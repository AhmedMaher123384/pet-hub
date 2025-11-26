import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Package } from 'lucide-react';
import { PRODUCT_PLACEHOLDER_SRC } from '../../utils/placeholders';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import { createProductSlug } from '../../utils/slugify';
import { useTranslation } from 'react-i18next';
import PriceDisplay from './PriceDisplay';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: number | null;
  mainImage: string;
  category?: {
    id: number;
    name: string;
  };
}

interface LiveSearchProps {
  onClose?: () => void;
  className?: string;
  triggerVariant?: 'icon' | 'bar';
  barStyle?: 'light' | 'dark';
  
}

const LiveSearch: React.FC<LiveSearchProps> = ({ onClose, className = '', triggerVariant = 'icon', barStyle = 'dark' }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // تحميل المنتجات عند بدء التطبيق
  useEffect(() => {
    loadProducts();
  }, []);

  // تحميل المنتجات من API أو localStorage
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      // محاولة تحميل من localStorage أولاً
      const cached = localStorage.getItem('searchProducts');
      if (cached) {
        const cachedProducts = JSON.parse(cached);
        setAllProducts(cachedProducts);
        setIsLoading(false);
      }

      // تحميل من API
      const productsResponse = await apiCall(API_ENDPOINTS.PRODUCTS);
      
      // Handle response object that contains products array
      const productsData = productsResponse.products || productsResponse;
      
      // فلترة المنتجات المتاحة فقط
      const availableProducts = productsData.filter((product: Product) => 
        product.isAvailable && product.name && product.name.trim() !== ''
      );
      
      setAllProducts(availableProducts);
      localStorage.setItem('searchProducts', JSON.stringify(availableProducts));
      setIsLoading(false);
    } catch (error) {
      console.error(t('live_search.loading_error'), error);
      setIsLoading(false);
    }
  };

  // البحث المحلي البسيط والدقيق
  const performSearch = (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTerm = query.trim().toLowerCase();
    
    // البحث في اسم المنتج أولاً
    const nameMatches = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm)
    );

    // البحث في الوصف إذا لم نجد نتائج كافية في الاسم
    const descriptionMatches = allProducts.filter(product =>
      !nameMatches.includes(product) &&
      product.description && 
      product.description.toLowerCase().includes(searchTerm)
    );

    // دمج النتائج (الاسم أولاً ثم الوصف)
    const combinedResults = [...nameMatches, ...descriptionMatches];
    
    // تحديد النتائج إلى 6 منتجات فقط
    setSearchResults(combinedResults.slice(0, 6));
  };

  // التعامل مع تغيير النص
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value);
    setIsOpen(value.length > 0);
  };

  // إغلاق البحث
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
    onClose?.();
  };

  // الانتقال إلى صفحة المنتج
  const handleProductClick = (product: Product) => {
    const slug = createProductSlug(product.id, product.name);
    navigate(`/product/${slug}`);
    handleClose();
  };

  // الانتقال إلى صفحة جميع النتائج
  const handleViewAll = () => {
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    handleClose();
  };

  // إغلاق عند الضغط خارج المكون أو الضغط على Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  return (
    <div className={className}>
      {/* Search Trigger */}
      {triggerVariant === 'icon' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="relative text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
        >
          <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`${barStyle === 'light'
            ? 'w-full relative flex items-center gap-2 pl-14 pr-4 py-2.5 rounded-2xl bg-white border border-gray-300 text-gray-600 hover:text-gray-800 hover:shadow-md transition-all duration-300 group'
            : 'w-full relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/15 transition-all duration-300 group'}`}
          aria-label={t('search_placeholder', 'ابحث عن المنتجات...')}
        >
          <span className={barStyle === 'light' ? 'text-sm text-gray-600' : 'text-sm'}>{t('search_placeholder', 'ابحث عن المنتجات...')}</span>
          <div className={`${barStyle === 'light' ? 'absolute inset-0 rounded-2xl bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' : 'absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'}`}></div>
        </button>
      )}

      {/* Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50 flex items-start justify-center pt-20">
          <div ref={searchRef} className="w-full max-w-2xl mx-4">
            {/* Search Input */}
            <div className="relative mb-4">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder={t('search_placeholder', 'البحث عن المنتجات...')}
                className="w-full px-6 py-4 pl-14 pr-12 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#e28437]/30 focus:border-[#e28437]/40 transition-all duration-300 shadow-lg text-lg text-right"
                autoFocus
              />
              <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <button
                onClick={handleClose}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* نتائج البحث المحسنة - Updated with glassmorphism */}
            {searchQuery.length >= 2 && (
              <div 
                className="rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-top-2 duration-300 bg-white border border-gray-200"
              >
                 {isLoading ? (
                   <div className="p-8 text-center">
                     <div className="inline-block w-8 h-8 border-4 border-[#e28437] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                     <p className="text-gray-700 font-medium text-sm">{t('live_search.loading', 'جاري التحميل...')}</p>
                   </div>
                 ) : searchResults.length > 0 ? (
                   <>
                     {/* قائمة النتائج المحسنة */}
                     <div className="max-h-80 overflow-y-auto custom-scrollbar">
                       {searchResults.map((product, index) => (
                         <button
                           key={product.id}
                           onClick={() => handleProductClick(product)}
                           className="w-full p-3 hover:bg-gray-50 transition-all duration-300 border-b border-gray-100 last:border-b-0 text-right group/item"
                           style={{
                             animationDelay: `${index * 50}ms`,
                             animation: 'slideInUp 0.4s ease-out forwards'
                           }}
                         >
                           <div className="flex items-center gap-3">
                             {/* صورة المنتج المحسنة */}
                             <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 group-hover/item:scale-105 transition-transform duration-300 border border-gray-200">
                               {product.mainImage ? (
                                 <img
                                   src={buildImageUrl(product.mainImage)}
                                   alt={product.name}
                                   className="w-full h-full object-cover"
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.src = PRODUCT_PLACEHOLDER_SRC;
                                   }}
                                 />
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                   <Package size={20} className="text-gray-400" />
                                  </div>
                               )}
                             </div>
                             
                             {/* معلومات المنتج المحسنة */}
                             <div className="flex-1 min-w-0">
                               <h4 className="font-semibold text-gray-900 truncate text-right mb-1 group-hover/item:text-[#e28437] transition-colors duration-200 text-sm">
                                 {product.name}
                               </h4>
                               {product.category?.name && (
                                 <p className="text-xs text-gray-500 truncate text-right mb-1">
                                   {product.category.name}
                                 </p>
                               )}
                               <div className="flex items-center justify-end">
                                  <span className="text-xs font-semibold text-white bg-gradient-to-r from-[#e28437] to-[#e28437] px-2 py-1 rounded-lg">
                                    <PriceDisplay price={product.price} variant="inverse" />
                                  </span>
                               </div>
                             </div>
                             
                             {/* سهم الانتقال */}
                              <div className="opacity-0 group-hover/item:opacity-100 transition-all duration-300 transform group-hover/item:translate-x-1">
                               <div className="w-6 h-6 rounded-lg bg-[#e28437]/10 flex items-center justify-center">
                                 <svg className="w-3 h-3 text-[#e28437]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                 </svg>
                               </div>
                             </div>
                           </div>
                         </button>
                       ))}
                     </div>
              
                     {/* زر عرض جميع النتائج المحسن */}
                      {searchResults.length >= 6 && (
                        <div className="p-3 border-t border-gray-100">
                          <button
                            onClick={handleViewAll}
                            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white transition-all duration-300 relative overflow-hidden group/btn text-sm bg-[#e28437] border border-[#e28437] hover:bg-[#4a221f]"
                          >
                            {/* تأثير الإضاءة عند التمرير */}
                            <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300 bg-white" />
                            <span className="relative z-10">{t('live_search.view_all_results', 'عرض جميع النتائج')}</span>
                          </button>
                        </div>
                      )}
                   </>
                 ) : (
                   <div className="p-6 text-center">
                     <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
                       <Package size={24} className="text-gray-400" />
                     </div>
                     <h3 className="text-sm font-semibold text-gray-900 mb-1">{t('live_search.no_results', 'لا توجد نتائج')}</h3>
                     <p className="text-xs text-gray-500">{t('live_search.no_products_found', 'لم يتم العثور على منتجات')}</p>
                   </div>
                 )}
               </div>
             )}
           </div>
         </div>
       )}
       
       {/* إضافة الستايلات المخصصة */}
       <style>{`
         .custom-scrollbar::-webkit-scrollbar {
           width: 4px;
         }
         .custom-scrollbar::-webkit-scrollbar-track {
           background: rgba(255,255,255,0.05);
           border-radius: 2px;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb {
           background: rgba(255,255,255,0.2);
           border-radius: 2px;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
           background: rgba(255,255,255,0.3);
         }
         
         @keyframes slideInUp {
           from {
             opacity: 0;
             transform: translateY(8px);
           }
           to {
             opacity: 1;
             transform: translateY(0);
           }
         }
       `}</style>
     </div>
   );
};

export default LiveSearch;