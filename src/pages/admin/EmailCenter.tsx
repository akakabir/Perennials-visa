import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Button } from '../../components/Button';
import { Mail, Save, Send, Plus, Trash2, Edit2, Clock, Check, XCircle, Search, Eye } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { EmailTemplate, EmailDraft, EmailRecord, Application } from '../../types';

// [ADMIN PAGE] Email Center for composing and managing communications
// [UI COMPONENT] EmailCenter - Renders the EmailCenter view
export default function EmailCenter() {
  const { applications, emailTemplates, emailDrafts, emailHistory, siteSettings, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate, addEmailDraft, updateEmailDraft, deleteEmailDraft, addEmailRecord, deleteEmailRecord, adminEmail, visaPlans } = useAppContext();
  
  const location = useLocation();
  const state = location.state as { selectedApplicant?: string, recipientType?: string } | null;
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'drafts' | 'history'>('compose');
  
  // Compose State
  const [recipientType, setRecipientType] = useState<'specific' | 'multiple' | 'applicant' | 'all_admins'>((state?.recipientType as any) || 'specific');
  const [specificEmail, setSpecificEmail] = useState('');
  const [multipleEmails, setMultipleEmails] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(state?.selectedApplicant || '');
  const [applicantSearch, setApplicantSearch] = useState('');
  
  const [fromEmail, setFromEmail] = useState(siteSettings?.defaultFromEmail || 'support@perennials.com');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    if (state?.selectedApplicant) {
      setRecipientType('applicant');
      setSelectedApplicant(state.selectedApplicant);
    }
  }, [state]);

  const adminEmails = (siteSettings.admins || []).map(a => a.email).filter(Boolean);

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const t = emailTemplates.find(x => x.id === id);
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
  };

  const getRecipientEmails = () => {
    let to: string[] = [];
    if (recipientType === 'specific') to = [specificEmail];
    else if (recipientType === 'multiple') to = multipleEmails.split(',').map(e => e.trim()).filter(Boolean);
    else if (recipientType === 'applicant') {
      const app = applications.find(a => a.id === selectedApplicant);
      if (app) to = [app.email];
    }
    else if (recipientType === 'all_admins') {
      to = adminEmails;
    }
    return to;
  };

  const getReplacedText = (text: string, app?: Application) => {
    let t = text;
    t = t.replace(/{{adminEmail}}/g, adminEmail || '');
    t = t.replace(/{{companyName}}/g, 'Perennials');
    t = t.replace(/{{companyEmail}}/g, siteSettings?.email || '');
    t = t.replace(/{{companyPhone}}/g, siteSettings?.phone || '');
    if (app) {
      const plan = visaPlans.find(p => p.id === app.planId);
      t = t.replace(/{{applicantName}}/g, app.name || '');
      t = t.replace(/{{applicantEmail}}/g, app.email || '');
      t = t.replace(/{{referenceId}}/g, app.referenceId || '');
      t = t.replace(/{{destination}}/g, plan?.destinationCountry || '');
      t = t.replace(/{{visaPlan}}/g, plan?.name || '');
      t = t.replace(/{{applicationStatus}}/g, app.status || '');
      t = t.replace(/{{applicationDate}}/g, app.submittedDate ? new Date(app.submittedDate).toLocaleDateString() : '');
    }
    return t;
  };

  const handleSend = async () => {
    const to = getRecipientEmails();
    if (!to.length || !subject || !body) {
        alert("Missing recipient, subject, or body.");
        return;
    }
    setSending(true);

    let finalSubject = subject;
    let finalBody = body;
    const app = recipientType === 'applicant' ? applications.find(a => a.id === selectedApplicant) : undefined;
    finalSubject = getReplacedText(finalSubject, app);
    finalBody = getReplacedText(finalBody, app);

    const templateName = emailTemplates.find(t => t.id === selectedTemplateId)?.name || 'Custom';

    try {
      const res = await /* [API CALL] /api/send-email */ fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, from: fromEmail, subject: finalSubject, html: finalBody.replace(/\n/g, '<br/>') })
      });
      const data = await res.json();
      
      const record: EmailRecord = {
        id: Date.now().toString(),
        recipient: to.join(', '),
        subject: finalSubject,
        templateName,
        date: new Date().toISOString(),
        status: data.error ? 'Failed' : 'Sent',
        errorMsg: data.error
      };
      await addEmailRecord(record);
      
      if (data.error) {
        alert("Failed to send: " + data.error);
      } else {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3000);
        setSpecificEmail(''); setMultipleEmails(''); setSubject(''); setBody('');
      }
    } catch (e: any) {
        alert("Error sending email: " + e.message);
        const record: EmailRecord = {
          id: Date.now().toString(),
          recipient: to.join(', '),
          subject: finalSubject,
          templateName,
          date: new Date().toISOString(),
          status: 'Failed',
          errorMsg: e.message
        };
        await addEmailRecord(record);
    }
    setSending(false);
  };

  const saveDraft = async () => {
    if (!subject && !body) return;
    const to = getRecipientEmails();
    const draft: EmailDraft = {
      id: Date.now().toString(),
      recipients: to.join(', '),
      subject,
      body,
      templateId: selectedTemplateId || undefined
    };
    await addEmailDraft(draft);
    alert('Draft saved!');
  };

  const [tName, setTName] = useState('');
  const [tSubj, setTSubj] = useState('');
  const [tBody, setTBody] = useState('');
  const [editTemplateId, setEditTemplateId] = useState('');

  const saveTemplate = async () => {
    if (!tName || !tSubj || !tBody) return;
    const t: EmailTemplate = {
      id: editTemplateId || Date.now().toString(),
      name: tName, subject: tSubj, body: tBody
    };
    if (editTemplateId) await updateEmailTemplate(t);
    else await addEmailTemplate(t);
    setTName(''); setTSubj(''); setTBody(''); setEditTemplateId('');
  };

  const handleEditTpl = (t: EmailTemplate) => {
    setTName(t.name); setTSubj(t.subject); setTBody(t.body); setEditTemplateId(t.id);
  };

  const selectedApp = applications.find(a => a.id === selectedApplicant);
  const selectedAppPlan = selectedApp ? visaPlans.find(p => p.id === selectedApp.planId) : null;

  const activeApps = applications.filter(a => !a.archived);
  const filteredApplicants = activeApps.filter(a => 
    a.name.toLowerCase().includes(applicantSearch.toLowerCase()) || 
    a.referenceId.toLowerCase().includes(applicantSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(applicantSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#3E3A35]">Email Center</h1>
      </div>

      <div className="flex border-b border-[#E6DFD5] space-x-6">
        {(['compose', 'templates', 'drafts', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? 'border-[#E2B87C] text-[#E2B87C]' : 'border-transparent text-[#7A7369] hover:text-[#3E3A35]'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'compose' && (
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 border-r border-[#E6DFD5] pr-6">
                <div>
                    <label className="block text-xs font-medium text-[#7A7369] mb-1">From</label>
                    <input value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="support@perennials.com" className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[#7A7369] mb-1">Template</label>
                    <select value={selectedTemplateId} onChange={e => handleTemplateSelect(e.target.value)} className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none">
                        <option value="">No Template</option>
                        {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-[#7A7369] mb-1">Recipient Type</label>
                    <select value={recipientType} onChange={e => setRecipientType(e.target.value as any)} className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none">
                        <option value="applicant">Reply to Applicant</option>
                        <option value="specific">Specific Email</option>
                        <option value="multiple">Multiple Emails (comma separated)</option>
                        <option value="all_admins">All Admins</option>
                    </select>
                </div>
                
                {recipientType === 'specific' && (
                    <input value={specificEmail} onChange={e => setSpecificEmail(e.target.value)} placeholder="Email Address" className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none" />
                )}
                {recipientType === 'multiple' && (
                    <input value={multipleEmails} onChange={e => setMultipleEmails(e.target.value)} placeholder="email1@test.com, email2@test.com" className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none" />
                )}
                {recipientType === 'applicant' && (
                    <div className="space-y-3">
                        <div className="relative">
                            <input type="text" placeholder="Search applicants..." value={applicantSearch} onChange={e => setApplicantSearch(e.target.value)} className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
                            <Search className="w-4 h-4 text-[#7A7369] absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <div className="max-h-48 overflow-y-auto border border-[#E6DFD5] rounded-lg bg-white">
                            {filteredApplicants.map(a => (
                                <button key={a.id} onClick={() => setSelectedApplicant(a.id)} className={`w-full text-left p-3 border-b border-[#E6DFD5] hover:bg-[#F7F5F0] transition-colors ${selectedApplicant === a.id ? 'bg-[#F0EEE9]' : ''}`}>
                                    <div className="font-medium text-sm text-[#3E3A35]">{a.name}</div>
                                    <div className="text-xs text-[#7A7369]">{a.email}</div>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] bg-[#FCFBF8] border border-[#E6DFD5] px-1.5 py-0.5 rounded text-[#7A7369]">{a.referenceId}</span>
                                        <span className="text-[10px] bg-[#FCFBF8] border border-[#E6DFD5] px-1.5 py-0.5 rounded text-[#7A7369]">{a.status}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {selectedApp && (
                            <div className="p-3 bg-[#FCFBF8] border border-[#E2B87C]/30 rounded-lg space-y-1 text-sm text-[#5C564D]">
                                <div><span className="font-medium">To:</span> {selectedApp.email}</div>
                                <div><span className="font-medium">Applicant:</span> {selectedApp.name}</div>
                                <div><span className="font-medium">Reference:</span> {selectedApp.referenceId}</div>
                                <div><span className="font-medium">Destination:</span> {selectedAppPlan?.destinationCountry || '-'}</div>
                                <div><span className="font-medium">Visa Plan:</span> {selectedAppPlan?.name || '-'}</div>
                                <div><span className="font-medium">Status:</span> {selectedApp.status}</div>
                            </div>
                        )}
                    </div>
                )}
                {recipientType === 'all_admins' && (
                    <p className="text-sm text-[#7A7369]">Will send to {adminEmails.length} admin(s).</p>
                )}

                <div>
                    <label className="block text-xs font-medium text-[#7A7369] mb-1">Subject</label>
                    <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email Subject" className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[#7A7369] mb-1">Body</label>
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} placeholder="Type your message here..." className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none resize-y" />
                </div>
                
                {sendSuccess && <div className="p-3 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm flex items-center gap-2"><Check className="w-4 h-4"/> Email sent successfully!</div>}

                <div className="flex gap-4 pt-2">
                    <Button onClick={handleSend} disabled={sending} className="flex-1 flex justify-center gap-2">
                        {sending ? <Clock className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                        {sending ? 'Sending...' : 'Send Email'}
                    </Button>
                    <Button variant="outline" onClick={saveDraft} className="flex justify-center gap-2">
                        <Save className="w-4 h-4"/> Save Draft
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-[#3E3A35] mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4"/> Live Preview
                </h3>
                <div className="p-6 bg-white border border-[#E6DFD5] rounded-xl shadow-sm min-h-[400px]">
                    <div className="border-b border-[#E6DFD5] pb-4 mb-4">
                        <p className="text-sm text-[#7A7369] mb-1"><span className="font-medium text-[#3E3A35]">From:</span> {fromEmail}</p>
                        <p className="text-sm text-[#7A7369] mb-1"><span className="font-medium text-[#3E3A35]">To:</span> {getRecipientEmails().join(', ') || '(No recipient)'}</p>
                        <p className="text-sm text-[#7A7369]"><span className="font-medium text-[#3E3A35]">Subject:</span> {getReplacedText(subject, recipientType === 'applicant' ? selectedApp : undefined) || '(No subject)'}</p>
                    </div>
                    <div className="text-sm text-[#3E3A35] whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: getReplacedText(body, recipientType === 'applicant' ? selectedApp : undefined).replace(/\n/g, '<br/>') }} />
                </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#3E3A35] mb-4">Manage Templates</h2>
            <div className="space-y-3">
                {emailTemplates.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-white border border-[#E6DFD5] rounded-xl">
                        <div>
                            <p className="font-medium text-[#3E3A35]">{t.name}</p>
                            <p className="text-xs text-[#7A7369]">{t.subject}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEditTpl(t)} className="p-2 text-[#7A7369] hover:text-[#3E3A35] hover:bg-[#F0EEE9] rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={() => window.confirm('Are you sure you want to delete this template?') && deleteEmailTemplate(t.id)} className="p-2 text-[#7A7369] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
          <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4 h-fit">
            <h2 className="text-lg font-semibold text-[#3E3A35]">{editTemplateId ? 'Edit Template' : 'New Template'}</h2>
            <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Name</label>
                <input value={tName} onChange={e=>setTName(e.target.value)} className="w-full bg-white border border-[#E6DFD5] rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Subject</label>
                <input value={tSubj} onChange={e=>setTSubj(e.target.value)} className="w-full bg-white border border-[#E6DFD5] rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Body</label>
                <textarea value={tBody} onChange={e=>setTBody(e.target.value)} rows={12} className="w-full bg-white border border-[#E6DFD5] rounded-lg px-3 py-2 text-sm resize-y font-mono" />
            </div>
            <Button onClick={saveTemplate} className="w-full"><Save className="w-4 h-4 mr-2"/> Save Template</Button>
            {editTemplateId && <Button variant="outline" className="w-full mt-2" onClick={() => {setEditTemplateId(''); setTName(''); setTSubj(''); setTBody('');}}>Cancel</Button>}
          </div>
        </div>
      )}
         
      {activeTab === 'drafts' && (
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl overflow-hidden p-6">
            <h2 className="text-lg font-semibold text-[#3E3A35] mb-4">Saved Drafts</h2>
            <div className="space-y-3">
                {emailDrafts.map(draft => (
                    <div key={draft.id} className="flex items-center justify-between p-4 bg-white border border-[#E6DFD5] rounded-xl">
                        <div>
                            <p className="font-medium text-[#3E3A35]">{draft.subject || '(No Subject)'}</p>
                            <p className="text-xs text-[#7A7369]">To: {draft.recipients}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => {
                                setRecipientType('specific');
                                setSpecificEmail(draft.recipients);
                                setSubject(draft.subject);
                                setBody(draft.body);
                                setSelectedTemplateId(draft.templateId || '');
                                setActiveTab('compose');
                            }} className="px-3 py-1.5 text-xs font-medium text-[#E2B87C] bg-[#E2B87C]/10 hover:bg-[#E2B87C]/20 rounded-lg transition-colors">Edit & Send</button>
                            <button onClick={() => window.confirm('Are you sure you want to delete this draft?') && deleteEmailDraft(draft.id)} className="p-1.5 text-[#7A7369] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
                {emailDrafts.length === 0 && (
                    <p className="text-[#7A7369] text-sm">No drafts saved.</p>
                )}
            </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-[#5C564D]">
                <thead className="bg-[#F0EEE9]/50 text-xs text-[#7A7369] font-medium border-b border-[#E6DFD5]">
                    <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Recipient</th>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4">Template</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DFD5]">
                    {emailHistory.map(record => (
                        <tr key={record.id} className="hover:bg-white/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleString()}</td>
                            <td className="px-6 py-4">{record.recipient}</td>
                            <td className="px-6 py-4">{record.subject}</td>
                            <td className="px-6 py-4">{record.templateName || '-'}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${record.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {record.status}
                                </span>
                                {record.errorMsg && <p className="text-[10px] text-red-500 mt-1 max-w-[200px] truncate">{record.errorMsg}</p>}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => window.confirm('Are you sure you want to delete this email record?') && deleteEmailRecord(record.id)} className="text-red-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4"/></button>
                            </td>
                        </tr>
                    ))}
                    {emailHistory.length === 0 && (
                        <tr><td colSpan={6} className="px-6 py-8 text-center text-[#7A7369]">No emails sent yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
