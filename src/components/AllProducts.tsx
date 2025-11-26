// === بداية قسم: تصدير المكون ===
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Grid, List, Package, X } from 'lucide-react';
import ProductCard from './ui/ProductCard';
import { createCategorySlug, createProductSlug } from '../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
// === نهاية قسم: تصدير المكون ===

// === بداية قسم: أنواع البيانات ===
interface Product {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  isAvailable: boolean;
  categoryId: number | null;
  subcategoryId?: number | null;
  mainImage: string;
  detailedImages?: string[];
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  image: string;
}
// === نهاية قسم: أنواع البيانات ===

// === بداية قسم: المكون الرئيسي ===
const AllProducts: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cachedAllProducts');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // نبدأ فارغًا، ونملؤه لاحقًا
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // === بداية قسم: دوال مساعدة ===
  const getLocalizedContent = (product: Product, field: 'name' | 'description') => {
    const currentLang = i18n.language;
    const arField = `${field}_ar` as keyof Product;
    const enField = `${field}_en` as keyof Product;
    
    if (currentLang === 'ar') {
      return (product[arField] as string) || (product[enField] as string) || product[field];
    } else {
      return (product[enField] as string) || (product[arField] as string) || product[field];
    }
  };

  const getCategoryLocalizedContent = (category: Category, field: 'name' | 'description') => {
    const currentLang = i18n.language;
    if (currentLang === 'ar') {
      return category[`${field}_ar`] || category[`${field}_en`] || category[field] || '';
    } else {
      return category[`${field}_en`] || category[`${field}_ar`] || category[field] || '';
    }
  };
  // === نهاية قسم: دوال مساعدة ===

  // === بداية قسم: جلب البيانات ===
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          apiCall(API_ENDPOINTS.PRODUCTS),
          apiCall(API_ENDPOINTS.CATEGORIES)
        ]);
        
        const allProducts = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse?.data || productsResponse?.products || [];
        
        const allCategories = Array.isArray(categoriesResponse)
          ? categoriesResponse
          : categoriesResponse?.data || categoriesResponse?.categories || [];
        
        // رفض "ثيمات" / "themes"
        const themesCategory = allCategories.find((C: Category) => {
          const name = getCategoryLocalizedContent(C, 'name').toLowerCase();
          return name === 'ثيمات' || name === 'themes';
        });
        const themesId = themesCategory?.id || null;
        
        const filteredProductsList = allProducts.filter((p: Product) => p.categoryId !== themesId);
        
        setProducts(filteredProductsList);
        setCategories(allCategories);
        setFilteredProducts(filteredProductsList); // مبدئيًا كل المنتجات
        
        localStorage.setItem('cachedAllProducts', JSON.stringify(filteredProductsList));
        localStorage.setItem('cachedCategories', JSON.stringify(allCategories));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProductsAndCategories();
  }, []);
  // === نهاية قسم: جلب البيانات ===

  // === بداية قسم: تصفية وترتيب المنتجات ===
  useEffect(() => {
    let result = [...products];
    
    // تصفية حسب التصنيف
    if (selectedCategory !== null) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }
    
    // تصفية حسب البحث
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => {
        const name = getLocalizedContent(p, 'name').toLowerCase();
        const desc = getLocalizedContent(p, 'description').toLowerCase();
        return name.includes(term) || desc.includes(term);
      });
    }
    
    // ترتيب
    result.sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      // sortBy === 'name'
      return getLocalizedContent(a, 'name').localeCompare(getLocalizedContent(b, 'name'));
    });
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm, sortBy]);
  // === نهاية قسم: تصفية وترتيب المنتجات ===

  // === بداية قسم: معالجات الأحداث ===
  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCategory(val ? parseInt(val, 10) : null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };
  // === نهاية قسم: معالجات الأحداث ===

  // === بداية قسم: حالة التحميل (اختياري – يمكنك استبداله بـ Skeleton إذا أردت) ===
  if (products.length === 0 && categories.length === 0) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#e28437] border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-[#0A2A55] mt-4">{t('loading')}</h2>
          <p className="text-gray-600 mt-2">{t('loading_products')}</p>
        </div>
      </section>
    );
  }
  // === نهاية قسم: حالة التحميل ===

  // === بداية قسم: العرض الأساسي ===
  return (
    <section className="min-h-screen bg-white py-6 sm:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* === بداية قسم: العنوان الرئيسي === */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0A2A55]">
            {t('all_products.title')}
          </h1>
          <div className="h-1 w-24 bg-[#e28437] rounded-full mx-auto mt-3"></div>
          <p className="text-gray-700 mt-4 max-w-3xl mx-auto leading-relaxed">
            {t('all_products.description')}
          </p>
        </div>
        {/* === نهاية قسم: العنوان الرئيسي === */}

        {/* === بداية قسم: شريط التحكم (بحث، تصنيف، فرز، عرض) === */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-8">
          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
            
            {/* --- البحث --- */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
                <input
                  type="text"
                  placeholder={t('all_products.search_placeholder')}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e28437] focus:border-[#e28437] text-gray-800"
                />
              </div>
            </div>

            {/* --- التصنيف --- */}
            <div className="min-w-[200px]">
              <select
                value={selectedCategory || ''}
                onChange={handleCategoryFilter}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e28437] focus:border-[#e28437] text-gray-800 bg-white"
              >
                <option value="">{t('all_products.all_categories')}</option>
                {categories
                  .filter(category => {
                    const name = getCategoryLocalizedContent(category, 'name').toLowerCase();
                    return name !== 'ثيمات' && name !== 'themes';
                  })
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {getCategoryLocalizedContent(category, 'name')}
                    </option>
                  ))}
              </select>
            </div>

            {/* --- الفرز --- */}
            <div className="min-w-[180px]">
              <select
                value={sortBy}
                onChange={handleSort}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e28437] focus:border-[#e28437] text-gray-800 bg-white"
              >
                <option value="name">{t('all_products.sort_by_name')}</option>
                <option value="price-low">{t('all_products.sort_by_price_low')}</option>
                <option value="price-high">{t('all_products.sort_by_price_high')}</option>
              </select>
            </div>

            {/* --- رموز العرض (شبكة/قائمة) --- */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'text-[#e28437] bg-[#e28437]/10' : 'text-gray-600 hover:text-gray-900'}`}
                aria-label={t('products.grid_view')}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'text-[#e28437] bg-[#e28437]/10' : 'text-gray-600 hover:text-gray-900'}`}
                aria-label={t('products.list_view')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* --- زر مسح الفلاتر (إن وجد) --- */}
          {(searchTerm || selectedCategory !== null) && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-[#e28437] font-medium hover:text-[#4a221f]"
              >
                <X className="w-4 h-4" />
                {t('all_products.clear_filters')}
              </button>
            </div>
          )}
        </div>
        {/* === نهاية قسم: شريط التحكم === */}

        {/* === بداية قسم: عرض المنتجات === */}
        {filteredProducts.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6'
                : 'space-y-5'
            }
          >
            {filteredProducts.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard product={product} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-gray-50 rounded-lg">
            <div className="inline-block w-12 h-12 rounded-full bg-[#e28437]/10 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-[#e28437]" />
            </div>
            <h3 className="text-xl font-bold text-[#0A2A55] mb-2">{t('products.no_products')}</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== null
                ? t('products.no_products_search')
                : t('products.no_products_available')}
            </p>
            {(searchTerm || selectedCategory !== null) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e28437] text-white font-medium rounded-md hover:bg-[#4a221f]"
              >
                <X className="w-4 h-4" />
                {t('products.clear_filters')}
              </button>
            )}
          </div>
        )}
        {/* === نهاية قسم: عرض المنتجات === */}
        
      </div>
    </section>
  );
  // === نهاية قسم: العرض الأساسي ===
};
// === نهاية قسم: المكون الرئيسي ===

export default AllProducts;
// === نهاية الملف ===