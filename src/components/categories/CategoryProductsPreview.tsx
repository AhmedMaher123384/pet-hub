import React, { useEffect, useState } from 'react';
import ProductCard from '../ui/ProductCard';
import { apiCall, API_ENDPOINTS } from '../../config/api';
import { getProductImage } from '../../assets/productImages';

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

type Props = {
  categoryId: number;
  limit?: number;
};

const CategoryProductsPreview: React.FC<Props> = ({ categoryId, limit = 5 }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiCall(API_ENDPOINTS.PRODUCTS_BY_CATEGORY(categoryId));

        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (Array.isArray(res?.products)) {
          list = res.products;
        } else if (Array.isArray(res?.data?.products)) {
          list = res.data.products;
        } else if (Array.isArray(res?.data)) {
          list = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          list = res.data.data;
        }

        const normalized: Product[] = list.map((p: any, idx: number) => {
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

        normalized.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        
        if (mounted) setProducts(normalized.slice(0, limit));
      } catch (err) {
        console.error('Error fetching category products preview:', err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [categoryId, limit]);

  const displayLimit = isMobile ? Math.min(4, limit) : limit;

  if (loading) {
    return (
      <div className="relative">
        {/* Decorative gradient background */}
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
    );
  }

  if (!products.length) {
    return (
      <div className="relative py-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e28437]/5 via-transparent to-[#e28437]/5 rounded-3xl" />
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#e28437]/20 to-[#e28437]/10 mb-4">
            <svg className="w-8 h-8 text-[#e28437]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-2">لا توجد منتجات حالياً</p>
          <p className="text-sm text-gray-500">سنضيف المزيد قريباً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group/container">
      {/* Animated gradient background */}
      <div className="absolute -inset-2 bg-gradient-to-br from-[#e28437]/5 via-transparent to-[#e28437]/5 rounded-3xl opacity-0 group-hover/container:opacity-100 transition-opacity duration-700" />
      
      {/* Main grid */}
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
              {/* Hover glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#e28437]/30 via-[#e28437]/10 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 blur-lg transition-all duration-500" />
              
              {/* Product card wrapper */}
              <div className="relative transform transition-all duration-500 ease-out group-hover/card:scale-[1.03] group-hover/card:-translate-y-1">
                <ProductCard product={product} />
              </div>
              
              {/* Floating accent */}
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
  );
};

export default CategoryProductsPreview;