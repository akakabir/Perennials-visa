sed -i '/updateApplication: (application: Application) => Promise<void>;/a \  deleteApplication: (id: string) => Promise<void>;' src/store/AppContext.tsx
sed -i '/const updateApplication = async (app: Application) => {/i \  const deleteApplication = async (id: string) => {\n    await deleteDoc(doc(db, '\''applications'\'', id));\n  };' src/store/AppContext.tsx
sed -i 's/updateApplication, addApplication,/updateApplication, addApplication, deleteApplication,/g' src/store/AppContext.tsx
