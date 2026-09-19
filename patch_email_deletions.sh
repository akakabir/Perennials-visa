sed -i 's/deleteEmailTemplate(t.id)/window.confirm('\''Are you sure you want to delete this template?'\'') \&\& deleteEmailTemplate(t.id)/g' src/pages/admin/EmailCenter.tsx
sed -i 's/deleteEmailDraft(draft.id)/window.confirm('\''Are you sure you want to delete this draft?'\'') \&\& deleteEmailDraft(draft.id)/g' src/pages/admin/EmailCenter.tsx
sed -i 's/deleteEmailRecord(record.id)/window.confirm('\''Are you sure you want to delete this email record?'\'') \&\& deleteEmailRecord(record.id)/g' src/pages/admin/EmailCenter.tsx
