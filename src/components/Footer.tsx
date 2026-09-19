import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Plane, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

// [UI COMPONENT] Footer - Renders the Footer view
export function Footer() {
  const { siteSettings } = useAppContext();
  const [logoError, setLogoError] = React.useState(false);

  return (
    <footer className="bg-[#F7F5F0] border-t border-[#E6DFD5] pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="md:col-span-1 space-y-6">
            <Link to="/" className="flex items-center gap-2 group relative inline-flex">
              <div className="relative flex items-center justify-center w-14 h-14 bg-[#0C0C34] rounded-full p-0 shadow-md group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <img 
                  src={logoError ? "/logo.png" : (siteSettings?.logoUrl || "/logo.png")} 
                  alt={`${siteSettings?.siteName || 'Perennials Visa'} Logo`} 
                  className="w-[85%] h-[85%] object-contain drop-shadow-sm" 
                  onError={() => setLogoError(true)}
                />
              </div>
              <span className="font-bold text-2xl tracking-wider text-[#3E3A35]">{siteSettings?.siteName?.toUpperCase() || 'PERENNIALS'}</span>
            </Link>
            <p className="text-sm text-[#7A7369]/70 leading-relaxed">
              {siteSettings.aboutBlurb}
            </p>
          </div>

          <div>
            <h4 className="text-[#3E3A35] font-medium mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-[#7A7369]/70">
              <li><a href="/#plans" className="hover:text-[#5C564D] transition-colors">Visa Plans</a></li>
              <li><a href="/#reviews" className="hover:text-[#5C564D] transition-colors">Client Reviews</a></li>
              <li><a href="#" className="hover:text-[#5C564D] transition-colors">About Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#3E3A35] font-medium mb-6">Support</h4>
            <ul className="space-y-3 text-sm text-[#7A7369]/70">
              <li><a href="#" className="hover:text-[#5C564D] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#5C564D] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#5C564D] transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#3E3A35] font-medium mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-[#7A7369]/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#E2B87C] shrink-0 mt-0.5" />
                <span>{siteSettings.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#E2B87C] shrink-0" />
                <a href={`tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-[#5C564D] transition-colors">{siteSettings.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#E2B87C] shrink-0" />
                <a href={`mailto:${siteSettings.email}`} className="hover:text-[#5C564D] transition-colors">{siteSettings.email}</a>
              </li>
            </ul>

            <div className="flex items-center gap-4 mt-6">
              {siteSettings.instagram && (
                <a href={`https://instagram.com/${siteSettings.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#7A7369] hover:bg-[#E2B87C]/20 hover:text-[#5C564D] transition-colors border border-[#E6DFD5] hover:border-[#E2B87C]/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {siteSettings.whatsapp && (
                <a href={`https://wa.me/${siteSettings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#7A7369] hover:bg-[#E2B87C]/20 hover:text-[#5C564D] transition-colors border border-[#E6DFD5] hover:border-[#E2B87C]/50">
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-[#E6DFD5] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#7A7369]/50">
          <p>{siteSettings.footerText}</p>
          <div className="flex gap-4">
            <span>Premium Visa Consultancy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
