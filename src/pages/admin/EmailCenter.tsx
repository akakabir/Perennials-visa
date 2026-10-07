import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Button } from '../../components/Button';
import { Mail, Save, Plus, Trash2, Edit2, Check, Search, Eye, Copy, FileText, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { EmailTemplate, EmailDraft, Application } from '../../types';

// [ADMIN PAGE] Email Center for drafting and editing client communications and templates
// [UI COMPONENT] EmailCenter - Renders the EmailCenter view
export default function EmailCenter() {
  const { 
    applications, 
    emailTemplates, 
    emailDrafts, 
    siteSettings, 
    addEmailTemplate, 
    updateEmailTemplate, 
    deleteEmailTemplate, 
    addEmailDraft, 
    updateEmailDraft, 
    deleteEmailDraft, 
    adminEmail, 
    visaPlans 
  } = useAppContext();
  
  const location = useLocation();
  const state = location.state as { selectedApplicant?: string, recipientType?: string } | null;
  const [activeTab, setActiveTab] = useState<'editor' | 'drafts' | 'templates'>('editor');
  
  // Active Draft Editing State
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [recipientType, setRecipientType] = useState<'specific' | 'multiple' | 'applicant' | 'all_admins'>((state?.recipientType as any) || 'applicant');
  const [specificEmail, setSpecificEmail] = useState('');
  const [multipleEmails, setMultipleEmails] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(state?.selectedApplicant || '');
  const [applicantSearch, setApplicantSearch] = useState('');
  
  const [fromEmail, setFromEmail] = useState(siteSettings?.defaultFromEmail || 'support@perennials.com');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  // Feedback states
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  useEffect(() => {
    if (state?.selectedApplicant) {
      setRecipientType('applicant');
      setSelectedApplicant(state.selectedApplicant);
      setActiveTab('editor');
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
    t = t.replace(/{{companyName}}/g, siteSettings?.siteName || 'Perennials Visa');
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

  const selectedApp = applications.find(a => a.id === selectedApplicant);
  const selectedAppPlan = selectedApp ? visaPlans.find(p => p.id === selectedApp.planId) : null;

  const resolvedSubject = getReplacedText(subject, recipientType === 'applicant' ? selectedApp : undefined);
  const resolvedBody = getReplacedText(body, recipientType === 'applicant' ? selectedApp : undefined);

  // Save Draft (updates existing or adds new)
  const handleSaveDraft = async () => {
    if (!subject.trim() && !body.trim()) {
      showNotice('Please enter a subject or body before saving draft.');
      return;
    }
    const to = getRecipientEmails();
    const recipientStr = to.join(', ') || (recipientType === 'applicant' && selectedApp ? selectedApp.email : specificEmail);

    if (editingDraftId) {
      const updated: EmailDraft = {
        id: editingDraftId,
        recipients: recipientStr,
        subject,
        body,
        templateId: selectedTemplateId || undefined
      };
      await updateEmailDraft(updated);
      showNotice('Draft updated successfully!');
    } else {
      const newDraft: EmailDraft = {
        id: Date.now().toString(),
        recipients: recipientStr,
        subject,
        body,
        templateId: selectedTemplateId || undefined
      };
      await addEmailDraft(newDraft);
      setEditingDraftId(newDraft.id);
      showNotice('Draft saved to collection!');
    }
  };

  const handleSaveAsNewDraft = async () => {
    if (!subject.trim() && !body.trim()) {
      showNotice('Please enter a subject or body before saving draft.');
      return;
    }
    const to = getRecipientEmails();
    const recipientStr = to.join(', ') || (recipientType === 'applicant' && selectedApp ? selectedApp.email : specificEmail);
    const newDraft: EmailDraft = {
      id: Date.now().toString(),
      recipients: recipientStr,
      subject,
      body,
      templateId: selectedTemplateId || undefined
    };
    await addEmailDraft(newDraft);
    setEditingDraftId(newDraft.id);
    showNotice('Saved as a new draft!');
  };

  const handleCopyDraftContent = (subj: string, bdy: string, idTag = 'editor') => {
    const textToCopy = `Subject: ${subj}\n\n${bdy}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(idTag);
    showNotice('Copied subject and body to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleLoadDraft = (draft: EmailDraft) => {
    setEditingDraftId(draft.id);
    setSubject(draft.body ? draft.subject : '');
    setBody(draft.body || '');
    setSelectedTemplateId(draft.templateId || '');
    
    // Check if recipient matches an applicant
    const matchedApp = applications.find(a => a.email.toLowerCase() === draft.recipients.toLowerCase());
    if (matchedApp) {
      setRecipientType('applicant');
      setSelectedApplicant(matchedApp.id);
    } else {
      setRecipientType('specific');
      setSpecificEmail(draft.recipients);
    }
    setActiveTab('editor');
    showNotice(`Opened draft "${draft.subject || 'Untitled'}" in editor`);
  };

  const handleClearEditor = () => {
    setEditingDraftId(null);
    setSubject('');
    setBody('');
    setSelectedTemplateId('');
    setSpecificEmail('');
    setMultipleEmails('');
    setSelectedApplicant('');
    showNotice('Editor cleared.');
  };

  // Template Form State
  const [tName, setTName] = useState('');
  const [tSubj, setTSubj] = useState('');
  const [tBody, setTBody] = useState('');
  const [editTemplateId, setEditTemplateId] = useState('');

  const saveTemplate = async () => {
    if (!tName.trim() || !tSubj.trim() || !tBody.trim()) {
      showNotice('Please fill in template name, subject, and body.');
      return;
    }
    const t: EmailTemplate = {
      id: editTemplateId || Date.now().toString(),
      name: tName.trim(), 
      subject: tSubj.trim(), 
      body: tBody.trim()
    };
    if (editTemplateId) {
      await updateEmailTemplate(t);
      showNotice(`Template "${t.name}" updated!`);
    } else {
      await addEmailTemplate(t);
      showNotice(`Template "${t.name}" created!`);
    }
    setTName(''); setTSubj(''); setTBody(''); setEditTemplateId('');
  };

  const handleEditTpl = (t: EmailTemplate) => {
    setTName(t.name); setTSubj(t.subject); setTBody(t.body); setEditTemplateId(t.id);
  };

  const handleUseTemplate = (t: EmailTemplate) => {
    setSelectedTemplateId(t.id);
    setSubject(t.subject);
    setBody(t.body);
    setActiveTab('editor');
    showNotice(`Loaded template "${t.name}" into editor.`);
  };

  const activeApps = applications.filter(a => !a.archived);
  const filteredApplicants = activeApps.filter(a => 
    a.name.toLowerCase().includes(applicantSearch.toLowerCase()) || 
    a.referenceId.toLowerCase().includes(applicantSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(applicantSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#3E3A35]">Email Center</h1>
          <p className="text-sm text-[#7A7369]">Compose, draft, and manage client email correspondence and templates.</p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-[#FAF8F4] border border-[#E2B87C] text-[#5C564D] rounded-xl text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#E2B87C]" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-[#7A7369] hover:text-[#3E3A35]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E6DFD5] space-x-6">
        <button
          onClick={() => setActiveTab('editor')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'editor' ? 'border-[#E2B87C] text-[#3E3A35] font-semibold' : 'border-transparent text-[#7A7369] hover:text-[#3E3A35]'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>Draft Editor</span>
          {editingDraftId && <span className="text-[10px] bg-[#E2B87C]/20 text-[#5C564D] px-1.5 py-0.5 rounded">Editing</span>}
        </button>

        <button
          onClick={() => setActiveTab('drafts')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'drafts' ? 'border-[#E2B87C] text-[#3E3A35] font-semibold' : 'border-transparent text-[#7A7369] hover:text-[#3E3A35]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Saved Drafts</span>
          <span className="text-xs bg-[#E6DFD5] text-[#7A7369] px-2 py-0.5 rounded-full font-sans">{emailDrafts.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'templates' ? 'border-[#E2B87C] text-[#3E3A35] font-semibold' : 'border-transparent text-[#7A7369] hover:text-[#3E3A35]'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Templates</span>
          <span className="text-xs bg-[#E6DFD5] text-[#7A7369] px-2 py-0.5 rounded-full font-sans">{emailTemplates.length}</span>
        </button>
      </div>

      {/* Draft Editor Tab */}
      {activeTab === 'editor' && (
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-[#E6DFD5]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7A7369]">Editor Mode:</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-[#FAF8F4] border border-[#E6DFD5] text-[#3E3A35] font-medium">
                {editingDraftId ? 'Editing Saved Draft' : 'New Draft'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {editingDraftId && (
                <button 
                  onClick={handleClearEditor}
                  className="text-xs text-[#7A7369] hover:text-[#3E3A35] px-2 py-1 rounded hover:bg-[#F0EEE9] transition-colors"
                >
                  Clear & Start New
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Form Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#7A7369] mb-1">From Sender</label>
                  <input 
                    value={fromEmail} 
                    onChange={e => setFromEmail(e.target.value)} 
                    placeholder="support@perennialsvisa.com" 
                    className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7A7369] mb-1">Apply Template</label>
                  <select 
                    value={selectedTemplateId} 
                    onChange={e => handleTemplateSelect(e.target.value)} 
                    className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]"
                  >
                    <option value="">Choose a Template...</option>
                    {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Recipient Source</label>
                <select 
                  value={recipientType} 
                  onChange={e => setRecipientType(e.target.value as any)} 
                  className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]"
                >
                  <option value="applicant">Applicant from Applications</option>
                  <option value="specific">Custom Single Email</option>
                  <option value="multiple">Multiple Email Addresses</option>
                  <option value="all_admins">All System Admins</option>
                </select>
              </div>
              
              {recipientType === 'specific' && (
                <div>
                  <label className="block text-xs font-medium text-[#7A7369] mb-1">Recipient Email</label>
                  <input 
                    value={specificEmail} 
                    onChange={e => setSpecificEmail(e.target.value)} 
                    placeholder="client@example.com" 
                    className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" 
                  />
                </div>
              )}

              {recipientType === 'multiple' && (
                <div>
                  <label className="block text-xs font-medium text-[#7A7369] mb-1">Recipient Emails (comma separated)</label>
                  <input 
                    value={multipleEmails} 
                    onChange={e => setMultipleEmails(e.target.value)} 
                    placeholder="client1@example.com, client2@example.com" 
                    className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" 
                  />
                </div>
              )}

              {recipientType === 'applicant' && (
                <div className="space-y-3">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search applicant name, email, or reference..." 
                      value={applicantSearch} 
                      onChange={e => setApplicantSearch(e.target.value)} 
                      className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#E2B87C]" 
                    />
                    <Search className="w-4 h-4 text-[#7A7369] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-[#E6DFD5] rounded-lg bg-white divide-y divide-[#E6DFD5]">
                    {filteredApplicants.length > 0 ? (
                      filteredApplicants.map(a => (
                        <button 
                          key={a.id} 
                          type="button"
                          onClick={() => setSelectedApplicant(a.id)} 
                          className={`w-full text-left p-2.5 hover:bg-[#FAF8F4] transition-colors ${selectedApplicant === a.id ? 'bg-[#F0EEE9]' : ''}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-xs text-[#3E3A35]">{a.name}</span>
                            <span className="text-[10px] text-[#7A7369] font-mono">{a.referenceId}</span>
                          </div>
                          <div className="text-[11px] text-[#7A7369]">{a.email}</div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-[#7A7369] text-center">No applicants found matching "{applicantSearch}"</div>
                    )}
                  </div>
                  {selectedApp && (
                    <div className="p-3 bg-[#FAF8F4] border border-[#E6DFD5] rounded-lg space-y-1 text-xs text-[#5C564D]">
                      <div><span className="font-semibold">Selected Client:</span> {selectedApp.name} ({selectedApp.email})</div>
                      <div><span className="font-semibold">Reference ID:</span> {selectedApp.referenceId} | <span className="font-semibold">Status:</span> {selectedApp.status}</div>
                    </div>
                  )}
                </div>
              )}

              {recipientType === 'all_admins' && (
                <p className="text-xs text-[#7A7369] bg-white p-2.5 rounded-lg border border-[#E6DFD5]">
                  Will address to all {adminEmails.length} active administrator email(s).
                </p>
              )}

              <div>
                <label className="block text-xs font-medium text-[#7A7369] mb-1">Subject</label>
                <input 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  placeholder="e.g. Visa Application Update - {{referenceId}}" 
                  className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-[#7A7369]">Body Content</label>
                  <span className="text-[11px] text-[#7A7369]">Available tags: &#123;&#123;applicantName&#125;&#125;, &#123;&#123;referenceId&#125;&#125;</span>
                </div>
                <textarea 
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                  rows={10} 
                  placeholder="Type draft message here..." 
                  className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C] resize-y" 
                />
              </div>

              {/* Action Buttons for Drafting */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={handleSaveDraft} className="flex-1 flex justify-center items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>{editingDraftId ? 'Update Draft' : 'Save Draft'}</span>
                </Button>

                {editingDraftId && (
                  <Button variant="outline" onClick={handleSaveAsNewDraft} className="flex justify-center items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Save Copy as New</span>
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  onClick={() => handleCopyDraftContent(resolvedSubject, resolvedBody, 'editor')}
                  className="flex justify-center items-center gap-2"
                >
                  {copiedId === 'editor' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === 'editor' ? 'Copied' : 'Copy Email'}</span>
                </Button>
              </div>
            </div>

            {/* Right Column: Live Rendered Preview */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A7369] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#E2B87C]" />
                  <span>Rendered Draft Preview</span>
                </h3>
                <button
                  type="button"
                  onClick={() => handleCopyDraftContent(resolvedSubject, resolvedBody, 'preview')}
                  className="text-xs text-[#E2B87C] hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Formatted Text</span>
                </button>
              </div>

              <div className="p-6 bg-white border border-[#E6DFD5] rounded-2xl shadow-sm min-h-[460px] flex flex-col">
                <div className="border-b border-[#E6DFD5] pb-4 mb-4 space-y-1.5 text-xs text-[#7A7369]">
                  <p><span className="font-semibold text-[#3E3A35]">From:</span> {fromEmail}</p>
                  <p><span className="font-semibold text-[#3E3A35]">To:</span> {getRecipientEmails().join(', ') || (recipientType === 'applicant' && selectedApp ? selectedApp.email : '(No recipient specified)')}</p>
                  <p className="text-sm pt-1"><span className="font-semibold text-[#3E3A35]">Subject:</span> {resolvedSubject || <span className="italic text-[#7A7369]/60">(No subject specified)</span>}</p>
                </div>
                
                <div className="flex-1 text-sm text-[#3E3A35] leading-relaxed whitespace-pre-wrap font-sans">
                  {resolvedBody ? resolvedBody : (
                    <span className="italic text-[#7A7369]/50">Start typing your draft or select an email template to see live replacement tags here...</span>
                  )}
                </div>

                <div className="pt-4 mt-6 border-t border-[#E6DFD5] text-[11px] text-[#7A7369]/70 flex justify-between items-center">
                  <span>Tags automatically resolve with client and brand information.</span>
                  <span>Ready to copy & paste</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Drafts Tab */}
      {activeTab === 'drafts' && (
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-lg font-semibold text-[#3E3A35]">Saved Drafts</h2>
              <p className="text-xs text-[#7A7369]">Drafts are saved securely and can be edited or copied at any time.</p>
            </div>
            <Button size="sm" onClick={() => { handleClearEditor(); setActiveTab('editor'); }} className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Create New Draft</span>
            </Button>
          </div>

          <div className="space-y-3">
            {emailDrafts.length > 0 ? (
              emailDrafts.map(draft => (
                <div key={draft.id} className="p-4 bg-white border border-[#E6DFD5] rounded-xl hover:border-[#E2B87C]/50 transition-colors shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#3E3A35]">{draft.subject || '(Untitled Draft)'}</p>
                        {draft.templateId && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF8F4] border border-[#E6DFD5] text-[#7A7369]">
                            {emailTemplates.find(t => t.id === draft.templateId)?.name || 'Template'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#7A7369]">Recipient: <span className="text-[#3E3A35] font-medium">{draft.recipients || 'Unspecified'}</span></p>
                      <p className="text-xs text-[#7A7369]/80 line-clamp-2 mt-1 font-serif italic">"{draft.body.slice(0, 140)}..."</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button 
                        onClick={() => handleLoadDraft(draft)}
                        className="px-3 py-1.5 text-xs font-medium text-[#3E3A35] bg-[#FAF8F4] hover:bg-[#F0EEE9] border border-[#E6DFD5] rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#E2B87C]" />
                        <span>Edit Draft</span>
                      </button>

                      <button 
                        onClick={() => handleCopyDraftContent(draft.subject, draft.body, draft.id)}
                        className="p-2 text-[#7A7369] hover:text-[#3E3A35] hover:bg-[#FAF8F4] border border-[#E6DFD5] rounded-lg transition-colors"
                        title="Copy subject and body"
                      >
                        {copiedId === draft.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this saved draft?')) {
                            deleteEmailDraft(draft.id);
                            if (editingDraftId === draft.id) setEditingDraftId(null);
                            showNotice('Draft removed.');
                          }
                        }} 
                        className="p-2 text-[#7A7369] hover:text-red-600 hover:bg-red-50 border border-transparent rounded-lg transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-white border border-[#E6DFD5] rounded-xl space-y-3">
                <FileText className="w-10 h-10 text-[#7A7369]/40 mx-auto" />
                <h3 className="font-medium text-[#3E3A35] text-sm">No saved drafts yet</h3>
                <p className="text-xs text-[#7A7369] max-w-sm mx-auto">
                  Compose your first client message in the Draft Editor and click "Save Draft" to keep it here.
                </p>
                <Button size="sm" onClick={() => setActiveTab('editor')} className="mt-2">
                  Go to Draft Editor
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#3E3A35] mb-4">Manage Email Templates</h2>
            <div className="space-y-3">
              {emailTemplates.map(t => (
                <div key={t.id} className="p-4 bg-white border border-[#E6DFD5] rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-sm hover:border-[#E2B87C]/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-[#3E3A35]">{t.name}</p>
                    <p className="text-xs text-[#7A7369]"><span className="font-medium">Subject:</span> {t.subject}</p>
                    <p className="text-xs text-[#7A7369]/70 line-clamp-1 font-mono">{t.body.slice(0, 100)}...</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleUseTemplate(t)}
                      className="px-3 py-1.5 text-xs font-medium text-[#3E3A35] bg-[#FAF8F4] hover:bg-[#F0EEE9] border border-[#E6DFD5] rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Draft With This</span>
                    </button>
                    <button 
                      onClick={() => handleEditTpl(t)} 
                      className="p-2 text-[#7A7369] hover:text-[#3E3A35] hover:bg-[#FAF8F4] border border-[#E6DFD5] rounded-lg transition-colors"
                      title="Edit template details"
                    >
                      <Edit2 className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this template?')) {
                          deleteEmailTemplate(t.id);
                          showNotice(`Template "${t.name}" deleted.`);
                        }
                      }} 
                      className="p-2 text-[#7A7369] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Edit/Create Form */}
          <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4 h-fit">
            <h2 className="text-lg font-semibold text-[#3E3A35]">{editTemplateId ? 'Edit Template' : 'New Template'}</h2>
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1">Template Name</label>
              <input 
                value={tName} 
                onChange={e => setTName(e.target.value)} 
                placeholder="e.g. Assessment - Recommended"
                className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1">Default Subject</label>
              <input 
                value={tSubj} 
                onChange={e => setTSubj(e.target.value)} 
                placeholder="e.g. Visa Update - {{referenceId}}"
                className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1">Body Text (with tags)</label>
              <textarea 
                value={tBody} 
                onChange={e => setTBody(e.target.value)} 
                rows={12} 
                placeholder="Hello {{applicantName}}, ..."
                className="w-full bg-white border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#E2B87C] resize-y" 
              />
            </div>
            <div className="space-y-2 pt-2">
              <Button onClick={saveTemplate} className="w-full flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                <span>{editTemplateId ? 'Save Template Changes' : 'Create Template'}</span>
              </Button>
              {editTemplateId && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => { setEditTemplateId(''); setTName(''); setTSubj(''); setTBody(''); }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

