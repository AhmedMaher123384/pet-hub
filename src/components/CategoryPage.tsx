// === بداية قسم: تصدير المكون ===
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { Package, Filter, Grid } from 'lucide-react'; // أزلت الـ List لأنها غير مستخدمة + RefreshCw (لا حاجة للـ spin في التصميم الثابت)
import ProductCard from './ui/ProductCard';
import WhatsAppButton from './ui/WhatsAppButton';
import { extractIdFromSlug, isValidSlug, slugify } from '../utils/slugify';
import { apiCall, API_ENDPOINTS } from '../config/api';

// === نهاية قسم: تصدير المكون ===

// === بداية قسم: أنواع البيانات ===
interface Product {
  id: number;
  name: string;
  description: string;
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
const CategoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { categoryId, slug } = useParams<{ categoryId?: string; slug?: string }>();
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`cachedCategoryProducts_${categoryId || slug}`);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [category, setCategory] = useState<Category | null>(() => {
    const saved = localStorage.getItem(`cachedCategory_${categoryId || slug}`);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(!category); // لتغيير حالة التحميل داخليًا فقط

  // === بداية قسم: دوال مساعدة ===
  const getLocalizedContent = (item: any, field: string) => {
    const currentLang = i18n.language;
    const langField = `${field}_${currentLang}`;
    if (item[langField] && item[langField].trim()) return item[langField];
    const otherLang = currentLang === 'ar' ? 'en' : 'ar';
    const otherLangField = `${field}_${otherLang}`;
    if (item[otherLangField] && item[otherLangField].trim()) return item[otherLangField];
    return item[field] || '';
  };
  // === نهاية قسم: دوال مساعدة ===

  // === بداية قسم: جلب البيانات ===
  useEffect(() => {
    setIsLoading(true);

    const resolveByName = async (decoded: string) => {
      try {
        const categoriesResponse = await apiCall(API_ENDPOINTS.CATEGORIES);
        const categories = Array.isArray(categoriesResponse)
          ? categoriesResponse
          : categoriesResponse?.data || categoriesResponse?.categories || [];
        const target = decoded.trim();
        const found = categories.find((c: any) => {
          const candidates = [c.name, c.name_ar, c.name_en].filter(Boolean);
          return candidates.some((nm: string) => slugify(nm) === target);
        });
        if (found) {
          fetchCategoryAndProducts(found.id);
        } else {
          smartToast.frontend.error(t('category_not_found'));
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error resolving category by name-only slug:', err);
        smartToast.frontend.error(t('category_load_error'));
        setIsLoading(false);
      }
    };

    const fetchCategoryAndProducts = async (catId: number) => {
      try {
        const [categoryData, productsResponse] = await Promise.all([
          apiCall(API_ENDPOINTS.CATEGORY_BY_ID(catId)),
          apiCall(API_ENDPOINTS.PRODUCTS),
        ]);

        setCategory(categoryData);
        const allProducts = Array.isArray(productsResponse)
          ? productsResponse
          : productsResponse?.data || productsResponse?.products || [];
        const categoryProducts = allProducts.filter((product: Product) => product.categoryId === catId);
        setProducts(categoryProducts);

        localStorage.setItem(`cachedCategory_${catId}`, JSON.stringify(categoryData));
        localStorage.setItem(`cachedCategoryProducts_${catId}`, JSON.stringify(categoryProducts));
      } catch (error) {
        console.error('Error fetching data:', error);
        smartToast.frontend.error(t('category_load_error'));
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      if (!isValidSlug(slug)) {
        smartToast.frontend.error(t('invalid_slug'));
        setIsLoading(false);
        return;
      }
      const decoded = decodeURIComponent(slug);
      const extracted = extractIdFromSlug(decoded);
      if (extracted && extracted > 0) {
        fetchCategoryAndProducts(extracted);
      } else {
        resolveByName(decoded);
      }
    } else if (categoryId) {
      const catId = parseInt(categoryId, 10);
      if (catId) {
        fetchCategoryAndProducts(catId);
      } else {
        smartToast.frontend.error(t('invalid_category_id'));
        setIsLoading(false);
      }
    } else {
      smartToast.frontend.error(t('missing_category_param'));
      setIsLoading(false);
    }
  }, [categoryId, slug, t]);
  // === نهاية قسم: جلب البيانات ===

  // === بداية قسم: ترتيب المنتجات ===
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'name':
      default: return a.name.localeCompare(b.name);
    }
  });
  // === نهاية قسم: ترتيب المنتجات ===

  // === بداية قسم: عرض حالة التحميل ===
  if (isLoading) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#e28437] border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-[#0A2A55] mt-4">{t('loading')}</h2>
          <p className="text-gray-600 mt-2">{t('loading_category_data')}</p>
        </div>
      </section>
    );
  }
  // === نهاية قسم: عرض حالة التحميل ===

  // === بداية قسم: العرض الأساسي ===
  return (
    <section className="min-h-screen bg-white py-6 sm:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* === بداية قسم: رأس التصنيف === */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0A2A55]">
            {getLocalizedContent(category, 'name')}
          </h1>
          <div className="h-1 w-24 bg-[#e28437] rounded-full mx-auto mt-3"></div>
          <p className="text-gray-700 mt-4 max-w-3xl mx-auto leading-relaxed">
            {getLocalizedContent(category, 'description')}
          </p>
        </div>
        {/* === نهاية قسم: رأس التصنيف === */}

      <div className="flex items-center gap-2 mb-8">
  <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="px-3 py-2 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#e28437] focus:border-[#e28437]"
  >
    <option value="name">{t('sort_by_name')}</option>
    <option value="price-low">{t('price_low_to_high')}</option>
    <option value="price-high">{t('price_high_to_low')}</option>
  </select>
</div>

        {/* === بداية قسم: عرض المنتجات === */}
        {sortedProducts.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6'
                : 'space-y-5' // وضع القائمة غير مُفعّل حاليًا، لكن الـ class جاهز
            }
          >
            {sortedProducts.map((product) => (
              <div key={product.id} className="w-full">
                <ProductCard product={product} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-gray-50 rounded-lg">
            <div className="inline-block w-12 h-12 rounded-full bg-[#e28437]/10 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-[#e28437]" />
            </div>
            <h3 className="text-xl font-bold text-[#0A2A55] mb-2">{t('no_products_in_category')}</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('products_coming_soon')}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#e28437] text-white font-medium rounded-md hover:bg-[#4a221f] focus:outline-none focus:ring-2 focus:ring-[#e28437]/50 transition-none"
            >
              {t('back_to_home')}
            </Link>
          </div>
        )}
        {/* === نهاية قسم: عرض المنتجات === */}

      </div>

      {/* === بداية قسم: زر الواتساب (ثابت) === */}
      <div className="fixed bottom-4 right-4 z-40">
        <WhatsAppButton />
      </div>
      {/* === نهاية قسم: زر الواتساب === */}
    </section>
  );
  // === نهاية قسم: العرض الأساسي ===
};
// === نهاية قسم: المكون الرئيسي ===

export default CategoryPage;
// === نهاية الملف ===