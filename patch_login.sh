sed -i 's/const \[showForgotPassword, setShowForgotPassword\] = useState(false);/const [showForgotPassword, setShowForgotPassword] = useState(false);\n  const [showCodeSuccess, setShowCodeSuccess] = useState(false);\n  const [newPassword, setNewPassword] = useState('\'''\'');/g' src/pages/admin/Login.tsx
sed -i 's/Prewritten Code/Backup password/g' src/pages/admin/Login.tsx
sed -i 's/Submit Code/Submit Backup Password/g' src/pages/admin/Login.tsx
