// === بداية قسم: تصدير المكون ===
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { Filter, Package } from 'lucide-react';
import ProductCard from './ui/ProductCard';
import WhatsAppButton from './ui/WhatsAppButton';
import { apiCall, API_ENDPOINTS } from '../config/api';
// === نهاية قسم: تصدير المكون ===

// === بداية قسم: أنواع البيانات ===
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId?: number | null;
  subcategoryId?: number | null;
  mainImage: string;
  detailedImages?: string[];
  createdAt?: string;
}

interface Collection {
  _id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  description_ar?: string;
  description_en?: string;
  image?: string;
  type: 'manual' | 'automated';
}
// === نهاية قسم: أنواع البيانات ===

// === بداية قسم: المكون الرئيسي ===
const CollectionPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { id } = useParams<{ id: string }>();

  const [products, setProducts] = useState<Product[]>(() => {
    const key = `cachedCollectionProducts_${id}`;
    const saved = localStorage.getItem(key);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [collection, setCollection] = useState<Collection | null>(() => {
    const key = `cachedCollection_${id}`;
    const saved = localStorage.getItem(key);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(!collection);

  // === بداية قسم: دالة مساعدة للترجمة ===
  const getLocalizedContent = (item: any, field: string): string => {
    if (!item) return '';
    const currentLang = i18n.language;
    const otherLang = currentLang === 'ar' ? 'en' : 'ar';
    const langField = `${field}_${currentLang}`;
    const otherLangField = `${field}_${otherLang}`;

    const val = item[langField];
    if (typeof val === 'string' && val.trim()) return val.trim();

    const alt = item[otherLangField];
    if (typeof alt === 'string' && alt.trim()) return alt.trim();

    const base = item[field];
    if (typeof base === 'string' && base.trim()) return base.trim();
    if (base && typeof base === 'object') {
      const cur = base[currentLang];
      if (typeof cur === 'string' && cur.trim()) return cur.trim();
      const oth = base[otherLang];
      if (typeof oth === 'string' && oth.trim()) return oth.trim();
    }
    return '';
  };
  // === نهاية قسم: دالة مساعدة للترجمة ===

  // === بداية قسم: جلب البيانات ===
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCollectionAndProducts = async () => {
      setLoading(true);
      try {
        const [collectionRes, productsRes] = await Promise.all([
          apiCall(API_ENDPOINTS.COLLECTION_BY_ID(id)),
          apiCall(API_ENDPOINTS.COLLECTION_PRODUCTS(id)),
        ]);

        // تنسيق الـ collection
        const col = collectionRes?.data || collectionRes;
        setCollection(col);

        // تنسيق المنتجات (دعم أشكال API المختلفة)
        let prods: Product[] = [];
        if (Array.isArray(productsRes)) {
          prods = productsRes;
        } else if (Array.isArray(productsRes?.products)) {
          prods = productsRes.products;
        } else if (Array.isArray(productsRes?.data?.products)) {
          prods = productsRes.data.products;
        } else if (Array.isArray(productsRes?.data)) {
          prods = productsRes.data;
        } else if (Array.isArray(productsRes?.data?.data)) {
          prods = productsRes.data.data;
        }
        setProducts(prods);

        // تخزين مؤقت
        localStorage.setItem(`cachedCollection_${id}`, JSON.stringify(col));
        localStorage.setItem(`cachedCollectionProducts_${id}`, JSON.stringify(prods));
      } catch (error) {
        console.error('Error fetching collection/products:', error);
        smartToast.frontend.error(t('loading_error') || 'فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionAndProducts();
  }, [id, t]);
  // === نهاية قسم: جلب البيانات ===

  // === بداية قسم: ترتيب المنتجات ===
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'name':
      default:
        const nameA = getLocalizedContent(a as any, 'name') || '';
        const nameB = getLocalizedContent(b as any, 'name') || '';
        return nameA.localeCompare(nameB);
    }
  });
  // === نهاية قسم: ترتيب المنتجات ===

  // === بداية قسم: حالة التحميل ===
  if (loading) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#e28437] border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-[#0A2A55] mt-4">{t('loading')}</h2>
          <p className="text-gray-600 mt-2">{t('loading_collection')}</p>
        </div>
      </section>
    );
  }
  // === نهاية قسم: حالة التحميل ===

  // === بداية قسم: حالة الخطأ / عدم وجود المجموعة ===
  if (!collection || !id) {
    return (
      <section className="min-h-screen bg-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block w-12 h-12 rounded-full bg-[#e28437]/10 flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-[#e28437]" />
          </div>
          <h2 className="text-xl font-bold text-[#0A2A55] mb-2">{t('error')}</h2>
          <p className="text-gray-700 mb-6">
            {t('collection_not_found') || 'المجموعة غير متوفرة'}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[#e28437] text-white font-medium rounded-md hover:bg-[#4a221f]"
          >
            {t('back_to_home')}
          </Link>
        </div>
      </section>
    );
  }
  // === نهاية قسم: حالة الخطأ ===

  // === بداية قسم: العرض الأساسي ===
  return (
    <section className="min-h-screen bg-white py-6 sm:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* === بداية قسم: رأس المجموعة === */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0A2A55]">
            {getLocalizedContent(collection, 'name')}
          </h1>
          <div className="h-1 w-24 bg-[#e28437] rounded-full mx-auto mt-3"></div>
          {getLocalizedContent(collection, 'description') && (
            <p className="text-gray-700 mt-4 max-w-3xl mx-auto leading-relaxed">
              {getLocalizedContent(collection, 'description')}
            </p>
          )}
        </div>
        {/* === نهاية قسم: رأس المجموعة === */}

        {/* === بداية قسم: شريط الفرز (بدون عداد أو زر شكل عرض) === */}
        <div className="flex items-center gap-2 mb-8 w-full max-w-md">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#e28437] focus:border-[#e28437]"
          >
            <option value="name">{t('sort_by_name')}</option>
            <option value="price-low">{t('price_low_to_high')}</option>
            <option value="price-high">{t('price_high_to_low')}</option>
          </select>
        </div>
        {/* === نهاية قسم: شريط الفرز === */}

        {/* === بداية قسم: عرض المنتجات === */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 justify-items-center mx-auto">
            {sortedProducts.map((product) => (
              <div key={product.id} className="w-full flex justify-center">
                <ProductCard product={product} viewMode="grid" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-gray-50 rounded-lg">
            <div className="inline-block w-12 h-12 rounded-full bg-[#e28437]/10 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-[#e28437]" />
            </div>
            <h3 className="text-xl font-bold text-[#0A2A55] mb-2">{t('no_products_in_collection')}</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t('products_coming_soon')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#e28437] text-white font-medium rounded-md hover:bg-[#4a221f]"
            >
              {t('back_to_home')}
            </Link>
          </div>
        )}
        {/* === نهاية قسم: عرض المنتجات === */}

        {/* === بداية قسم: زر الواتساب (ثابت) === */}
        <div className="fixed bottom-4 right-4 z-40">
          <WhatsAppButton />
        </div>
        {/* === نهاية قسم: زر الواتساب === */}
        
      </div>
    </section>
  );
  // === نهاية قسم: العرض الأساسي ===
};
// === نهاية قسم: المكون الرئيسي ===

export default CollectionPage;
// === نهاية الملف ===