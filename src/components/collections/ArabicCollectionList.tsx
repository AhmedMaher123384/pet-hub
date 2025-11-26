import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import { getProductImage } from '../../assets/productImages';
import { apiCall, API_ENDPOINTS } from '../../config/api';

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

interface ArabicCollectionListProps {
  arabicName: string;
  limit?: number;
  className?: string;
}

const normalize = (s: any) => (typeof s === 'string' ? s : '').trim().toLowerCase();

const ArabicCollectionList: React.FC<ArabicCollectionListProps> = ({ arabicName, limit = 5, className }) => {
  const { i18n, t } = useTranslation();
  const isArabic = (typeof (i18n as any).dir === 'function' ? (i18n as any).dir() === 'rtl' : String(i18n.language || '').startsWith('ar'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [collectionId, setCollectionId] = useState<string | number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setProducts([]);
      setCollectionId(null);
      try {
        const res = await apiCall(`${API_ENDPOINTS.COLLECTIONS}?active=true`);
        const list: any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const target = normalize(arabicName);
        const found = list.find((c: any) => {
          const ar = typeof c?.name === 'string' ? c?.name : (c?.name?.ar || c?.name_ar || '');
          const en = typeof c?.name === 'string' ? c?.name : (c?.name?.en || c?.name_en || '');
          const nar = normalize(ar);
          const nen = normalize(en);
          return nar === target || nen === target || nar.includes(target) || nen.includes(target);
        });

        if (!found) {
          throw new Error('لم يتم العثور على المجموعة المطلوبة');
        }

        const colId = found._id || found.id;
        const prodRes = await apiCall(`${API_ENDPOINTS.COLLECTION_PRODUCTS(colId)}?page=1&limit=${limit}&sort=createdAt&order=desc`);
        const raw: any[] = Array.isArray(prodRes?.data)
          ? prodRes.data
          : Array.isArray(prodRes?.products)
            ? prodRes.products
            : Array.isArray(prodRes?.data?.products)
              ? prodRes.data.products
              : [];

        const normalized: Product[] = raw.map((p: any, idx: number) => {
          const idNum = typeof p?.id === 'number' ? p.id : (typeof p?.id === 'string' ? Number(p.id) : idx);
          const name = p?.name ?? p?.name_en ?? p?.name_ar ?? '';
          const description = p?.description ?? p?.description_en ?? p?.description_ar ?? '';
          const mainImage = p?.mainImage ?? (Array.isArray(p?.images) ? p.images[0] : '');
          const localImage = Number.isFinite(idNum) ? getProductImage(idNum) : undefined;
          const finalMainImage = localImage || mainImage;
          return {
            id: idNum,
            name,
            name_ar: p?.name_ar,
            name_en: p?.name_en,
            description,
            description_ar: p?.description_ar,
            description_en: p?.description_en,
            price: typeof p?.price === 'number' ? p.price : (Number(p?.price) || 0),
            originalPrice: typeof p?.originalPrice === 'number' ? p.originalPrice : (p?.originalPrice ? Number(p.originalPrice) : undefined),
            isAvailable: typeof p?.isAvailable === 'boolean' ? p.isAvailable : true,
            categoryId: typeof p?.categoryId === 'number' ? p.categoryId : (p?.categoryId ?? null),
            subcategoryId: typeof p?.subcategoryId === 'number' ? p.subcategoryId : (p?.subcategoryId ?? null),
            mainImage: finalMainImage,
            detailedImages: Array.isArray(p?.detailedImages) ? p.detailedImages : (Array.isArray(p?.images) ? p.images : []),
            createdAt: p?.createdAt,
            hasRequiredOptions: p?.hasRequiredOptions,
          } as Product;
        });

        if (!cancelled) {
          setProducts(normalized);
          setCollectionId(colId);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'حدث خطأ في جلب المنتجات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [arabicName, i18n.language, limit]);

  const displayLimit = isMobile ? Math.min(4, limit) : limit;

  if (loading) {
    return (
      <div className={className || ''}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e28437]/5 via-transparent to-[#e28437]/5 rounded-3xl" />
          
          <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 p-2">
            {[...Array(displayLimit)].map((_, idx) => (
              <div key={idx} className="group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm">
                  <div className="aspect-square animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#e28437]/10 via-transparent to-[#e28437]/5" />
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm p-3">
                      <div className="h-3 bg-gray-200 rounded-full w-3/4 mb-2" />
                      <div className="h-2 bg-gray-200 rounded-full w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className || ''}>
        <div className="relative py-16 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-transparent to-red-50 rounded-3xl" />
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-50 mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-red-700 mb-2">{error}</p>
            <p className="text-sm text-red-500">يرجى المحاولة مرة أخرى</p>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={className || ''}>
        <div className="relative py-16 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e28437]/5 via-transparent to-[#e28437]/5 rounded-3xl" />
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#e28437]/20 to-[#e28437]/10 mb-4">
              <svg className="w-8 h-8 text-[#e28437]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">لا توجد عناصر لعرضها حالياً</p>
            <p className="text-sm text-gray-500">سنضيف المزيد قريباً</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className || ''}>
      {/* View All Button - Luxury Style */}
      {collectionId && (
        <div className="mb-6 flex w-full">
          <Link
            to={`/collection/${collectionId}`}
            className={`group/btn relative inline-flex items-center gap-2 px-6 py-3 overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 ${isArabic ? 'mr-auto' : 'ml-auto'}`}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#e28437] to-[#d97832] transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#d97832] to-[#e28437] opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
            
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#e28437] to-[#d97832] rounded-xl blur opacity-30 group-hover/btn:opacity-60 transition-all duration-300" />
            
            {/* Content */}
            <span className="relative text-white font-bold text-sm tracking-wide">{t('categories.view_all')}</span>
            <Sparkles className="relative w-4 h-4 text-white group-hover/btn:rotate-12 transition-transform duration-300" />
          </Link>
        </div>
      )}

      {/* Products Grid - Same as CategoryProductsPreview */}
      <div className="relative group/container">
        <div className="absolute -inset-2 bg-gradient-to-br from-[#e28437]/5 via-transparent to-[#e28437]/5 rounded-3xl opacity-0 group-hover/container:opacity-100 transition-opacity duration-700" />
        
        <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 p-2">
          {products.slice(0, displayLimit).map((product, idx) => (
            <div 
              key={product.id} 
              className="group/card"
              style={{
                animation: `fadeInUp 0.6s ease-out ${idx * 0.08}s both`
              }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#e28437]/30 via-[#e28437]/10 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 blur-lg transition-all duration-500" />
                
                <div className="relative transform transition-all duration-500 ease-out group-hover/card:scale-[1.03] group-hover/card:-translate-y-1">
                  <ProductCard product={product} />
                </div>
                
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#e28437] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 shadow-lg shadow-[#e28437]/50" />
              </div>
            </div>
          ))}
        </div>

        <style>{`
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
        `}</style>
      </div>
    </div>
  );
};

export default ArabicCollectionList;