import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import { getCategoryImage } from '../../assets/categoryImages';
import { ProductCard } from '../ui';

interface Subcategory {
  id: number;
  name?: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  description_ar?: string;
  description_en?: string;
  image?: string;
  parentId: number;
  isActive?: boolean;
}

interface Product {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId?: number | null;
  subcategoryId?: number | null;
  mainImage: string;
  detailedImages?: string[];
  createdAt?: string;
  hasRequiredOptions?: boolean;
}

const SubcategoriesSection: React.FC = () => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [productsBySubcategory, setProductsBySubcategory] = useState<Record<number, Product[]>>({});

  const isRTL = i18n.language === 'ar';

  const getLocalized = (item: any, field: 'name' | 'description') => {
    const currentLang = i18n.language;
    const arField = `${field}_ar`;
    const enField = `${field}_en`;
    // عدّل ترتيب fallback ليُفضّل الحقل الأساسي (العربي في ملفاتنا) قبل البديل الإنجليزي
    if (currentLang === 'ar') {
      return item[arField] || item[field] || item[enField] || '';
    }
    // في الإنجليزية: استخدم الإنجليزي إن وجد، وإلا الحقل الأساسي، ثم العربي
    return item[enField] || item[field] || item[arField] || '';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get all active subcategories
        const response = await apiCall(`${API_ENDPOINTS.SUBCATEGORIES}?active=true`);
        const list: Subcategory[] = Array.isArray(response)
          ? response
          : response?.data || [];

        // Filter only active and with valid parentId
        const activeSubs = list.filter(s => s && s.parentId && (s as any).isActive !== false);
        setSubcategories(activeSubs);

        // Fetch products for each subcategory (limit 8)
        const productsEntries = await Promise.all(
          activeSubs.map(async (sub) => {
            try {
              const prodRes = await apiCall(`${API_ENDPOINTS.PRODUCTS_BY_SUBCATEGORY(sub.id)}?limit=8&sortBy=createdAt&sortOrder=desc`);
              const products: Product[] = prodRes?.products || Array.isArray(prodRes) ? prodRes.products || prodRes : [];
              return [sub.id, products] as [number, Product[]];
            } catch (e) {
              return [sub.id, []] as [number, Product[]];
            }
          })
        );

        setProductsBySubcategory(Object.fromEntries(productsEntries));
      } catch (e: any) {
        setError(e?.message || 'خطأ أثناء تحميل الأقسام الفرعية');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [i18n.language]);

  const sectionTitle = useMemo(() => (isRTL ? 'الأقسام الفرعية' : 'Subcategories'), [isRTL]);
  const sectionSubtitle = useMemo(
    () => (isRTL ? 'استعرض المنتجات المرتبطة بكل قسم فرعي' : 'Browse products associated with each subcategory'),
    [isRTL]
  );

  if (loading) {
    return (
      <section data-section="subcategories" className="py-12 md:py-20 bg-[#292929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <div className="h-6 md:h-8 bg-[#1f1f1f]/70 rounded-full w-32 md:w-48 mx-auto mb-3 md:mb-4 animate-pulse"></div>
            <div className="h-4 md:h-6 bg-[#1f1f1f]/70 rounded-full w-64 md:w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="space-y-4 md:space-y-8">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-[#1f1f1f]/70 rounded-2xl p-6 border border-[#18b5d5]/10">
                <div className="h-5 bg-[#18b5d5]/10 rounded w-40 mb-4"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((__, i) => (
                    <div key={i} className="h-40 rounded-xl bg-[#18b5d5]/5 border border-[#18b5d5]/10"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section data-section="subcategories" className="py-12 md:py-20 bg-[#292929]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-400">
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-section="subcategories" className="py-12 md:py-24 bg-[#292929]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-3">
            {sectionTitle}
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-white/80">
            {sectionSubtitle}
          </p>
        </div>

        {/* Subcategories List */}
        <div className="space-y-10 md:space-y-16">
          {subcategories.map((sub) => {
            const products = productsBySubcategory[sub.id] || [];
            if (!products.length) return null; // Hide empty subcategory blocks
            return (
              <div key={sub.id} className="bg-[#1f1f1f]/70 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-[#18b5d5]/10">
                {/* Subcategory Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {sub.image && (
                      <img
                        src={buildImageUrl(getCategoryImage(Number(sub.id)) || sub.image)}
                        alt={getLocalized(sub, 'name')}
                        className="w-12 h-12 rounded-xl object-cover border border-[#18b5d5]/20"
                      />
                    )}
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        {getLocalized(sub, 'name')}
                      </h3>
                      {getLocalized(sub, 'description') && (
                        <p className="text-white/70 text-sm md:text-base line-clamp-2">
                          {getLocalized(sub, 'description')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SubcategoriesSection;