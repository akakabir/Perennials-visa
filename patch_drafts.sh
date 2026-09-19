sed -i '/activeTab === '\''history'\'' && (/i \
      {activeTab === '\''drafts'\'' && (\
        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl overflow-hidden p-6">\
            <h2 className="text-lg font-semibold text-[#3E3A35] mb-4">Saved Drafts</h2>\
            <div className="space-y-3">\
                {emailDrafts.map(draft => (\
                    <div key={draft.id} className="flex items-center justify-between p-4 bg-white border border-[#E6DFD5] rounded-xl">\
                        <div>\
                            <p className="font-medium text-[#3E3A35]">{draft.subject || '\''(No Subject)'\''}</p>\
                            <p className="text-xs text-[#7A7369]">To: {draft.recipients}</p>\
                        </div>\
                        <div className="flex gap-2">\
                            <button onClick={() => {\
                                setRecipientType('\''specific'\'');\
                                setSpecificEmail(draft.recipients);\
                                setSubject(draft.subject);\
                                setBody(draft.body);\
                                setSelectedTemplateId(draft.templateId || '\'''\'');\
                                setActiveTab('\''compose'\'');\
                            }} className="px-3 py-1.5 text-xs font-medium text-[#E2B87C] bg-[#E2B87C]/10 hover:bg-[#E2B87C]/20 rounded-lg transition-colors">Edit & Send</button>\
                            <button onClick={() => deleteEmailDraft(draft.id)} className="p-1.5 text-[#7A7369] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>\
                        </div>\
                    </div>\
                ))}\
                {emailDrafts.length === 0 && (\
                    <p className="text-[#7A7369] text-sm">No drafts saved.</p>\
                )}\
            </div>\
        </div>\
      )}\
' src/pages/admin/EmailCenter.tsx

sed -i '/<Button onClick={handleSend}/i \                    <Button variant="outline" onClick={async () => {\
                        const d: EmailDraft = {\
                            id: Date.now().toString(),\
                            recipients: getRecipientEmails().join('\', \''),\
                            subject,\
                            body,\
                            templateId: selectedTemplateId\
                        };\
                        await addEmailDraft(d);\
                        alert('\''Draft saved!'\'');\
                    }} disabled={sending} className="flex items-center gap-2">\
                        <Save className="w-4 h-4"/> Save Draft\
                    </Button>' src/pages/admin/EmailCenter.tsx
