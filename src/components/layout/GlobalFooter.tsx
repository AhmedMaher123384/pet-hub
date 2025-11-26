// === بداية قسم: تصدير المكون ===
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUp, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from "../../assets/logo.png";
// === نهاية قسم: تصدير المكون ===

// === بداية قسم: المكون الرئيسي ===
const GlobalFooter: React.FC = () => {
  const { t } = useTranslation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // ✅ الروابط المهمة — بدون "من نحن"
  const importantLinks = [
    { to: "/privacy-policy", label: t('footer.privacy_policy', { defaultValue: 'سياسة الخصوصية' }) },
    { to: "/terms-and-conditions", label: t('footer.terms_conditions', { defaultValue: 'الشروط والأحكام' }) },
    { to: "/return-policy", label: t('footer.exchange_return', { defaultValue: 'الاستبدال والاسترجاع' }) },
    { to: "/products", label: t('footer.products', { defaultValue: 'المنتجات' }) },
  ];

  return (
    <>
      {/* === Footer رئيسي — صغير، بلون e28437، بدون زينة === */}
      <footer className="bg-[#e285900] text-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* --- الشعار + وصف مختصر --- */}
            <div>
              <Link to="/" className="inline-block mb-2">
                <img src={logo} alt="Logo" className="h-24 object-contain" />
              </Link>
              <p className="text-xs text-gray-300 mt-1 max-w-xs">
                {t('footer.company_description_short', {
                  defaultValue: 'متجر مستلزمات حيوانات أليفة راقي — ننتقي الأفضل لعناية مبدعة.'
                })}
              </p>
            </div>

            {/* --- الروابط المهمة فقط (بدون "من نحن") --- */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-2">
                {t('footer.important_links', { defaultValue: 'روابط مهمة' })}
              </h4>
              <ul className="space-y-1 text-xs">
                {importantLinks.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.to}
                      className="inline-block py-0.5 text-gray-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* --- معلومات الاتصال + طرق الدفع --- */}
            <div>
              

              {/* --- طرق الدفع — بالصور الحقيقية --- */}
              <h4 className="font-semibold text-white text-sm mb-2">
                {t('footer.payment_methods', { defaultValue: 'طرق الدفع' })}
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {/* Visa */}
                <div className="bg-white rounded px-2 py-1 h-8 flex items-center justify-center min-w-[50px]">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                    alt="Visa"
                    className="h-4 object-contain"
                  />
                </div>
                
                {/* Mastercard */}
                <div className="bg-white rounded px-2 py-1 h-8 flex items-center justify-center min-w-[50px]">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                    alt="Mastercard"
                    className="h-5 object-contain"
                  />
                </div>
                
                {/* Apple Pay */}
                <div className="bg-white rounded px-2 py-1 h-8 flex items-center justify-center min-w-[50px]">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg"
                    alt="Apple Pay"
                    className="h-4 object-contain"
                  />
                </div>
                
                {/* Mada */}
                <div className="bg-white rounded px-2 py-1 h-8 flex items-center justify-center min-w-[50px]">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/f/fb/Mada_Logo.svg"
                    alt="Mada"
                    className="h-4 object-contain"
                  />
                </div>
                
                {/* Tamara */}
                <div className="bg-white rounded px-2 py-1 h-8 flex items-center justify-center min-w-[50px]">
                  <img 
                    src="https://cdn.prod.website-files.com/67c184892f7a84b971ff49d9/68931b49f2808979578bdc64_tamara-text-logo-black-en.svg"
                    alt="Tamara"
                    className="h-4 object-contain"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* --- حقوق النشر — سطر واحد، صغير --- */}
          <div className="border-t border-[#e28437]/60 mt-4 pt-3 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {t('footer.company_name', { defaultValue: 'غِيم' })}.
            {t('footer.copyright_short', { defaultValue: 'جميع الحقوق محفوظة — تم التطوير بواسطة Ufuq-Digital.' })}
          </div>
        </div>
      </footer>

      {/* === زر التمرير للأعلى — فقط على الجوال، بدون حركة === */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 w-9 h-9 bg-white text-[#e28437] rounded-full flex items-center justify-center shadow-md z-50 md:hidden"
          aria-label={t('footer.scroll_to_top', { defaultValue: 'العودة للأعلى' })}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </>
  );
};
// === نهاية قسم: المكون الرئيسي ===

export default GlobalFooter;