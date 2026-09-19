sed -i 's/const { siteSettings, updateSiteSettings } = useAppContext();/const { siteSettings, updateSiteSettings, adminUsername } = useAppContext();/g' src/pages/admin/SettingsManager.tsx
