sed -i '/<div className="space-y-3 mt-2">/a \
                  <div>\
                    <label className="block text-xs font-medium text-[#7A7369] mb-1">Name</label>\
                    <input\
                      value={admin.name || '\'''\''}\
                      onChange={(e) => handleAdminChange(index, '\''name'\'', e.target.value)}\
                      className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]"\
                      placeholder="Admin Name"\
                    />\
                  </div>\
' src/pages/admin/SettingsManager.tsx
sed -i '/<\/div> *<\/div> *<\/div> *<\/div> *))} *{(!formData.admins || formData.admins.length === 0)/i \
                  <div className="grid grid-cols-2 gap-2">\
                    <div>\
                      <label className="block text-xs font-medium text-[#7A7369] mb-1">Role</label>\
                      <select\
                        value={admin.role || '\''admin'\''}\
                        onChange={(e) => handleAdminChange(index, '\''role'\'', e.target.value)}\
                        className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]"\
                      >\
                        <option value="admin">Admin</option>\
                        <option value="superadmin">Superadmin</option>\
                        <option value="manager">Manager</option>\
                      </select>\
                    </div>\
                    <div>\
                      <label className="block text-xs font-medium text-[#7A7369] mb-1">Status</label>\
                      <select\
                        value={admin.status || '\''active'\''}\
                        onChange={(e) => handleAdminChange(index, '\''status'\'', e.target.value)}\
                        className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]"\
                      >\
                        <option value="active">Active</option>\
                        <option value="inactive">Inactive</option>\
                      </select>\
                    </div>\
                  </div>\
' src/pages/admin/SettingsManager.tsx
