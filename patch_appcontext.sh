sed -i '/const \[adminLoggedIn, setAdminLoggedInState\] = useState<boolean>/i \  const [adminUsername, setAdminUsernameState] = useState<string | null>(() => sessionStorage.getItem('\''pv_adminUsername'\''));' src/store/AppContext.tsx
sed -i 's/setAdminLoggedInState(status);/setAdminLoggedInState(status);/g' src/store/AppContext.tsx
