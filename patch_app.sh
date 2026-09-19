sed -i '/const ApplicationsManager/a const ApplicationHistory = lazy(() => import('\''./pages/admin/ApplicationHistory'\''));' src/App.tsx
sed -i '/<Route path="applications"/a \              <Route path="application-history" element={<ApplicationHistory />} />' src/App.tsx
