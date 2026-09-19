sed -i 's/<td colSpan={5}/<td colSpan={6}/g' src/pages/admin/ApplicationsManager.tsx
sed -i '/<th className="font-medium p-4 pb-3">Notes (Visible to Applicant)<\/th>/a \                  <th className="font-medium p-4 pb-3 text-right">Actions<\/th>' src/pages/admin/ApplicationsManager.tsx
sed -i '/<\/td>$/c \
                    <\/td>\
                    <td className="p-4 text-right">\
                      <button onClick={() => handleSendEmail(app.id)} className="p-2 text-[#7A7369] hover:text-[#3E3A35] hover:bg-[#F0EEE9] rounded-lg transition-colors">\
                        <Mail className="w-4 h-4"\/>\
                      <\/button>\
                    <\/td>\
' src/pages/admin/ApplicationsManager.tsx
