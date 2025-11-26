import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import heroImage from '../../assets/about.png';
import ArabicCollectionList from '../collections/ArabicCollectionList';
import { Link } from 'react-router-dom';
import { createCategorySlug } from '../../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import { getCategoryImage } from '../../assets/categoryImages';
import CategoryProductsPreview from '../categories/CategoryProductsPreview';
import { Sparkles, TrendingUp } from 'lucide-react';

interface Category { 
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  image?: string;
}

const AboutUsSection: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const isRtl = (typeof (i18n as any).dir === 'function' ? (i18n as any).dir() === 'rtl' : String(i18n.language || '').startsWith('ar'));

  const getCategoryName = (category: Category) => {
    const lang = i18n.language;
    if (lang === 'ar') {
      return category.name_ar || category.name_en || category.name || '';
    }
    return category.name_en || category.name_ar || category.name || '';
  };

  // Display name based on current language only
  const getCategoryDisplayName = (category: Category) => {
    return getCategoryName(category);
  };

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const data = await apiCall(API_ENDPOINTS.CATEGORIES);
        const list = Array.isArray(data) ? data : data?.data || [];
        if (mounted) {
          setCategories(list);
          try {
            localStorage.setItem('cachedCategories', JSON.stringify(list));
          } catch {}
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
    <div className="relative mb-8 group/title">
      <div className="flex items-center gap-4">
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-800 to-black">
            {children}
          </h2>
          {/* Underline with gradient */}
          <div className="relative mt-3 h-1.5 w-32 overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#e28437] via-[#f5a962] to-[#e28437]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#e28437] to-[#f5a962] animate-shimmer" />
          </div>
        </div>
        {Icon && (
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#e28437]/20 to-[#e28437]/5 group-hover/title:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-[#e28437]" />
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );

  return (
    <section className="relative bg-gradient-to-b from-white via-gray-50/30 to-white py-16 md:py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#e28437]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#e28437]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Latest Offers Collection */}
        <div className="mb-20">
          <SectionTitle icon={Sparkles}>{t('home.latest_offers')}</SectionTitle>
          <ArabicCollectionList arabicName="آخر العروض" limit={5} />
        </div>

        {/* New Arrivals / Latest Products Collection */}
        <div className="mb-20">
          <SectionTitle icon={TrendingUp}>{t('home.latest_products')}</SectionTitle>
          <ArabicCollectionList arabicName="وصل حديثاً" limit={5} />
        </div>

        {/* Hero Image with Overlay Effect */}
        <div className="relative mb-20 group/hero">
          <Link to="/products" aria-label="الانتقال إلى صفحة المنتجات">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#e28437] via-[#f5a962] to-[#e28437] rounded-3xl opacity-0 group-hover/hero:opacity-30 blur-xl transition-all duration-700" />
              
              {/* Image */}
              <div className="relative overflow-hidden rounded-3xl">
                <img 
                  src={heroImage} 
                  alt="Hero" 
                  className="w-full h-auto block transform transition-transform duration-700 group-hover/hero:scale-105" 
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/hero:opacity-100 transition-opacity duration-500" />
                
                {/* Floating badge */}
                <div className="absolute top-6 right-6 px-6 py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg transform translate-x-0 group-hover/hero:translate-x-2 transition-transform duration-300">
                  <span className="text-[#e28437] font-bold text-sm">{t('home.explore_more')}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Categories Section */}
        <div>
          <SectionTitle>{t('categories.title')}</SectionTitle>
          
          {/* Categories Grid - Luxury Circles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 mb-16">
            {categories
              .filter((category) => {
                const name = getCategoryName(category).toLowerCase();
                return name !== 'ثيمات' && name !== 'themes';
              })
              .map((category, idx) => {
                const name = getCategoryName(category);
                const displayName = getCategoryDisplayName(category);
                const to = `/category/${createCategorySlug(category.id, name)}`;
                return (
                  <Link
                    key={category.id}
                    to={to}
                    className="group/cat block"
                    aria-label={`استعراض تصنيف ${displayName}`}
                    style={{
                      animation: `fadeInScale 0.5s ease-out ${idx * 0.05}s both`
                    }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      {/* Circle Container */}
                      <div className="relative w-full aspect-square">
                        {/* Outer animated ring - gradient rotating */}
                        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#e28437] via-[#f5a962] via-[#e28437] to-[#f5a962] opacity-0 group-hover/cat:opacity-60 blur-xl transition-all duration-700 animate-spin-slow" />
                        
                        {/* Middle glow ring - pulsing */}
                        <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#e28437]/50 via-[#f5a962]/30 to-transparent opacity-0 group-hover/cat:opacity-100 blur-lg transition-opacity duration-500" />
                        
                        {/* Thin gradient border ring */}
                        <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-br from-[#e28437]/40 via-[#f5a962]/20 to-[#e28437]/40 opacity-50 group-hover/cat:opacity-100 transition-all duration-500">
                          <div className="w-full h-full rounded-full bg-white" />
                        </div>
                        
                        {/* Main circle - no border, just shadow */}
                        <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg group-hover/cat:shadow-2xl transition-all duration-500 bg-white">
                          {/* Inner gradient glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-[#e28437]/10 via-transparent to-[#f5a962]/10 opacity-0 group-hover/cat:opacity-100 transition-opacity duration-500" />
                          
                          {/* Image */}
                          <div className="relative w-full h-full rounded-full overflow-hidden">
                            {category.image || getCategoryImage(Number(category.id)) ? (
                              <img
                                src={buildImageUrl(getCategoryImage(Number(category.id)) || category.image || '')}
                                alt={name}
                                className="w-full h-full object-cover transform transition-all duration-700 group-hover/cat:scale-110 group-hover/cat:rotate-3"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#e28437]/20 via-[#f5a962]/10 to-transparent" />
                            )}
                            
                            {/* Gradient overlay - darker and more visible */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover/cat:opacity-100 transition-opacity duration-500" />
                            
                            {/* Shine effect - diagonal sweep */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/40 to-white/0 opacity-0 group-hover/cat:opacity-100 transition-all duration-700 translate-x-[-100%] group-hover/cat:translate-x-[100%]" 
                                 style={{ transition: 'all 0.7s ease-out' }} />
                          </div>
                          
                          {/* Floating sparkle on hover - with glow */}
                          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br from-[#e28437] via-[#f5a962] to-[#e28437] flex items-center justify-center opacity-0 group-hover/cat:opacity-100 scale-0 group-hover/cat:scale-100 transition-all duration-500 shadow-xl shadow-[#e28437]/50">
                            <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Animated dots around circle on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover/cat:opacity-100 transition-opacity duration-500">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#e28437] animate-ping" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#f5a962] animate-ping" style={{ animationDelay: '0.3s' }} />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#e28437] animate-ping" style={{ animationDelay: '0.6s' }} />
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#f5a962] animate-ping" style={{ animationDelay: '0.9s' }} />
                        </div>
                        
                        {/* Expanding ring on hover */}
                        <div className="absolute inset-0 rounded-full border-[3px] border-[#e28437]/0 scale-95 group-hover/cat:scale-105 group-hover/cat:border-[#e28437]/30 opacity-0 group-hover/cat:opacity-100 transition-all duration-700" />
                      </div>
                      
                      {/* Category Name Below Circle */}
                      <div className="text-center w-full px-2">
                        <h3 className="font-black text-base md:text-lg text-gray-900 group-hover/cat:text-[#e28437] transition-colors duration-300 line-clamp-2">
                          {displayName}
                        </h3>
                        {/* Animated underline */}
                        <div className="h-0.5 w-0 group-hover/cat:w-full bg-gradient-to-r from-transparent via-[#e28437] to-transparent mx-auto transition-all duration-500 mt-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>

          {/* Category Products */}
          <div className="space-y-16">
            {categories
              .filter((category) => {
                const name = getCategoryName(category).toLowerCase();
                return name !== 'ثيمات' && name !== 'themes';
              })
              .map((category, idx) => {
                const name = getCategoryName(category);
                const displayName = getCategoryDisplayName(category);
                const to = `/category/${createCategorySlug(category.id, name)}`;
                return (
                  <div 
                    key={category.id}
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                    }}
                  >
                    {/* Category header */}
                    <div className={`flex items-end ${isRtl ? 'flex-row-reverse' : ''} justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-[#e28437]/20 via-[#e28437]/10 to-transparent`}>
                      <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700">
                        {displayName}
                      </h3>
                      <Link 
                        to={to} 
                        className="group/link relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#e28437] to-[#f5a962]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#f5a962] to-[#e28437] opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />
            <span className="relative text-white font-bold text-sm">{t('categories.view_all')}</span>
                        {(() => {
                          const isRtl = i18n?.language === 'ar' || (typeof i18n?.dir === 'function' && i18n.dir() === 'rtl');
                          const hoverClass = isRtl ? 'group-hover/link:-translate-x-1' : 'group-hover/link:translate-x-1';
                          const d = isRtl ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7';
                          return (
                            <svg className={`relative w-4 h-4 text-white ${hoverClass} transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
                            </svg>
                          );
                        })()}
                      </Link>
                    </div>
                    
                    <CategoryProductsPreview categoryId={category.id} limit={5} />
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default AboutUsSection;