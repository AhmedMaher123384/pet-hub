import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency, Currency } from '../../contexts/CurrencyContext';
import { ChevronDown, Check, Languages, DollarSign } from 'lucide-react';

const LanguageCurrencySelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentCurrency, setCurrency, currencies, getCurrentCurrencySymbol } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'language' | 'currency'>('language');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    document.documentElement.lang = langCode;
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('selectedLanguage', langCode);
    setIsOpen(false);
  };

  const changeCurrency = (currency: Currency) => {
    setCurrency(currency);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-3 py-2 rounded-full border border-[#e28437]/40 bg-white text-[#e28437] hover:bg-[#e28437] hover:text-white transition-all duration-300 group flex items-center gap-2 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{currentLanguage.flag}</span>
          <span className="text-xs font-semibold hidden sm:block">{currentLanguage.code.toUpperCase()}</span>
          <span className="hidden sm:block">•</span>
          <span className="text-xs font-semibold">{getCurrentCurrencySymbol()}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Compact Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-56 bg-white rounded-xl shadow-2xl border border-[#e28437]/20 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300">
          {/* Simple Tabs */}
          <div className="flex border-b border-[#e28437]/15">
            <button
              onClick={() => setActiveTab('language')}
              className={`flex-1 px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                activeTab === 'language'
                  ? 'text-[#e28437] border-b-2 border-[#e28437]'
                  : 'text-gray-700 hover:text-[#e28437] hover:bg-[#e28437]/5'
              }`}
            >
              <Languages className="w-3 h-3 mx-auto mb-1" />
              {t('common.language', 'اللغة')}
            </button>
            <button
              onClick={() => setActiveTab('currency')}
              className={`flex-1 px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                activeTab === 'currency'
                  ? 'text-[#e28437] border-b-2 border-[#e28437]'
                  : 'text-gray-700 hover:text-[#e28437] hover:bg-[#e28437]/5'
              }`}
            >
              <DollarSign className="w-3 h-3 mx-auto mb-1" />
              {t('common.currency', 'العملة')}
            </button>
          </div>

          {/* Compact Content */}
          <div className="max-h-48 overflow-y-auto">
            {activeTab === 'language' && (
              <div className="p-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-300 mb-1 ${
                      currentLanguage.code === language.code
                        ? 'bg-[#e28437]/10 text-[#e28437] border border-[#e28437]/20'
                        : 'text-gray-700 hover:text-[#e28437] hover:bg-[#e28437]/5'
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{language.nativeName}</div>
                    </div>
                    {currentLanguage.code === language.code && (
                      <Check className="w-3 h-3 text-[#e28437]" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'currency' && (
              <div className="p-2">
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => changeCurrency(currency)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-300 mb-1 ${
                      currentCurrency.code === currency.code
                        ? 'bg-[#e28437]/10 text-[#e28437] border border-[#e28437]/20'
                        : 'text-gray-700 hover:text-[#e28437] hover:bg-[#e28437]/5'
                    }`}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-white text-sm font-bold text-[#e28437] border border-[#e28437]/20">
                      {i18n.language === 'ar' ? currency.symbol : currency.symbolEn}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{i18n.language === 'ar' ? currency.nameAr : currency.name}</div>
                    </div>
                    {currentCurrency.code === currency.code && (
                      <Check className="w-3 h-3 text-[#e28437]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageCurrencySelector;