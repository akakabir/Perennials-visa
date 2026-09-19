sed -i '/<div className="relative">/i \                  <div className="grid grid-cols-2 gap-2">\
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
