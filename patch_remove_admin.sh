sed -i '/const removeAdmin = (index: number) => {/c \
  const removeAdmin = (index: number) => {\
    if (formData.admins && formData.admins.length === 1) {\
      alert("Cannot delete the last remaining admin account.");\
      return;\
    }\
    if (!window.confirm("Are you sure you want to delete this admin account?")) return;\
    const newAdmins = (formData.admins || []).filter((_, i) => i !== index);\
    setFormData({ ...formData, admins: newAdmins });\
    setSaved(false);\
  };\
' src/pages/admin/SettingsManager.tsx
