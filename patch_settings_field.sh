sed -i '/<div className="bg-\[#FCFBF8\] border border-\[#E6DFD5\] rounded-2xl p-6 space-y-4 lg:col-span-2">/i \
        {adminUsername === "admin1" && (\
          <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4 lg:col-span-2">\
            <div className="border-b border-[#E6DFD5] pb-3 mb-4">\
              <h2 className="text-lg font-semibold text-[#3E3A35]">Forgot Password Recovery Code</h2>\
              <p className="text-xs text-[#7A7369] mt-1">This prewritten code allows you to bypass the login screen if you forget your password.</p>\
            </div>\
            <div>\
              <label className="block text-xs font-medium text-[#7A7369] mb-1">Prewritten Code</label>\
              <input name="forgotPasswordCode" value={formData.forgotPasswordCode || ""} onChange={handleChange} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />\
            </div>\
          </div>\
        )}\
' src/pages/admin/SettingsManager.tsx
