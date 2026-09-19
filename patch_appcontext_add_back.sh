sed -i '/const contextValue = React\.useMemo(() => {/i \
  const updateEmailTemplate = async (t: EmailTemplate) => await updateDoc(doc(db, '\''emailTemplates'\'', t.id), { ...t });\
  const addEmailTemplate = async (t: EmailTemplate) => await setDoc(doc(db, '\''emailTemplates'\'', t.id), { ...t });\
  const deleteEmailTemplate = async (id: string) => await deleteDoc(doc(db, '\''emailTemplates'\'', id));\
  const updateEmailDraft = async (d: EmailDraft) => await updateDoc(doc(db, '\''emailDrafts'\'', d.id), { ...d });\
  const addEmailDraft = async (d: EmailDraft) => await setDoc(doc(db, '\''emailDrafts'\'', d.id), { ...d });\
  const deleteEmailDraft = async (id: string) => await deleteDoc(doc(db, '\''emailDrafts'\'', id));\
  const addEmailRecord = async (r: EmailRecord) => await setDoc(doc(db, '\''emailHistory'\'', r.id), { ...r });\
  const deleteEmailRecord = async (id: string) => await deleteDoc(doc(db, '\''emailHistory'\'', id));\
' src/store/AppContext.tsx
