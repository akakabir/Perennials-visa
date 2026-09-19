sed -i '/<Button onClick={handleSend}/i \
                    <Button variant="outline" onClick={async () => {\
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
                    </Button>\
' src/pages/admin/EmailCenter.tsx
