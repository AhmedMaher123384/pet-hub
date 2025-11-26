import React, { useEffect, useMemo, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useTranslation } from 'react-i18next';
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

interface Collection {
  _id?: string;
  id?: number;
  name?: { ar?: string; en?: string } | string;
  type?: 'manual' | 'automated';
  isActive?: boolean;
}

interface ArabicCollectionCarouselProps {
  arabicName: string;
  limit?: number;
  className?: string;
}

const normalize = (s: any) => (typeof s === 'string' ? s : '').trim().toLowerCase();

const ArabicCollectionCarousel: React.FC<ArabicCollectionCarouselProps> = ({ arabicName, limit = 10, className }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setProducts([]);
      try {
        // 1) جلب جميع المجموعات
        const res = await apiCall(`${API_ENDPOINTS.COLLECTIONS}?active=true`);
        const list: any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const target = normalize(arabicName);
        const found = list.find((c: any) => {
          const ar = typeof c?.name === 'string' ? c?.name : (c?.name?.ar || '');
          const en = typeof c?.name === 'string' ? c?.name : (c?.name?.en || '');
          const nar = normalize(ar);
          const nen = normalize(en);
          return nar === target || nen === target || nar.includes(target) || nen.includes(target);
        });

        if (!found) {
          throw new Error('لم يتم العثور على المجموعة المطلوبة');
        }

        const colId = found._id || found.id;
        // 2) جلب منتجات المجموعة
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

        if (!cancelled) setProducts(normalized);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'حدث خطأ في جلب المنتجات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [arabicName, i18n.language, limit]);

  const settings = useMemo(() => ({
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    rtl: isArabic,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  }), [isArabic]);

  return (
    <div className={`collection-carousel ${className || ''}`}>
      <style>{`
        /* Make slick arrows visible on white background and brand-colored */
        .collection-carousel .slick-prev:before,
        .collection-carousel .slick-next:before {
          color: #e28437 !important;
          opacity: 1 !important;
          font-size: 26px !important;
        }
        .collection-carousel .slick-prev,
        .collection-carousel .slick-next {
          z-index: 30;
        }
        /* Slightly bring arrows inside so they don't clip */
        .collection-carousel .slick-prev { left: 8px; }
        .collection-carousel .slick-next { right: 8px; }
      `}</style>
      {loading ? (
        <div className="text-center text-black/70">جارِ التحميل...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-black/60">لا توجد عناصر لعرضها حالياً</div>
      ) : (
        <Slider {...settings}>
          {products.map((product) => (
            <div key={product.id} className="px-2">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default ArabicCollectionCarousel;