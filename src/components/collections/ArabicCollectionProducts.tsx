import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from '../ui/ProductCard';
import { apiCall, API_ENDPOINTS } from '../../config/api';
import { getProductImage } from '../../assets/productImages';

// Product shape aligned with ProductCard expectations
interface CollectionProduct {
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
  featured?: boolean;
}

interface ArabicCollectionProductsProps {
  arabicName: string;
  limit?: number;
  sectionTitle?: string;
  className?: string;
}

const ArabicCollectionProducts: React.FC<ArabicCollectionProductsProps> = ({ arabicName, limit = 8, sectionTitle, className }) => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<CollectionProduct[]>([]);

  const displayTitle = useMemo(() => {
    if (sectionTitle) return sectionTitle;
    const lang = i18n.language;
    const nameObj = typeof collection?.name === 'string'
      ? { ar: collection?.name as string, en: collection?.name as string }
      : (collection?.name as { ar?: string; en?: string } | undefined);
    const nameAr = typeof (collection as any)?.name_ar === 'string' ? (collection as any).name_ar : (nameObj?.ar || '');
    const nameEn = typeof (collection as any)?.name_en === 'string' ? (collection as any).name_en : (nameObj?.en || '');
    if (lang === 'ar') {
      return (nameAr && nameAr.trim()) || (nameEn && nameEn.trim()) || arabicName;
    }
    return (nameEn && nameEn.trim()) || (nameAr && nameAr.trim()) || arabicName;
  }, [sectionTitle, collection, arabicName, i18n.language]);

  const parseCollection = (resp: any): Collection | null => {
    if (!resp) return null;
    if (resp?.data && !Array.isArray(resp.data) && (resp.data?._id || resp.data?.id || resp.data?.name)) return resp.data;
    if (resp?.collection) return resp.collection;
    if (resp?.data?.collection) return resp.data.collection;
    const arr = Array.isArray(resp?.data) ? resp.data
      : Array.isArray(resp?.collections) ? resp.collections
      : Array.isArray(resp?.data?.collections) ? resp.data.collections
      : Array.isArray(resp) ? resp
      : null;
    return Array.isArray(arr) ? (arr[0] || null) : null;
  };

  // جلب آمن من الـ API مع إرجاع undefined عند الخطأ
  const safeApiCall = async (endpoint: string, options?: RequestInit): Promise<any | undefined> => {
    try {
      return await apiCall(endpoint, options || {});
    } catch {
      return undefined;
    }
  };

  // قراءة JSON من public
  const readMockJson = async (path: string): Promise<any | undefined> => {
    try {
      const res = await fetch(path);
      if (!res.ok) return undefined;
      return await res.json();
    } catch {
      return undefined;
    }
  };

  // جلب قائمة المجموعات من الـ API أو من ملفات الموك
  const fetchCollections = async (): Promise<any[]> => {
    const resp = await safeApiCall(`${API_ENDPOINTS.COLLECTIONS}?active=true`);
    const list: any[] = Array.isArray(resp?.data) ? resp.data
      : Array.isArray(resp) ? resp
      : [];
    if (list.length > 0) return list;
    const mock = await readMockJson('/mock-data/collections.json');
    return Array.isArray(mock) ? mock : [];
  };

  // جلب منتجات مجموعة محددة من الـ API أو من ملفات الموك
  const fetchCollectionProducts = async (col: any, limitCount: number): Promise<CollectionProduct[]> => {
    const id = (col as any)._id || (col as any).id;
    const prodResp = await safeApiCall(`${API_ENDPOINTS.COLLECTION_PRODUCTS(id)}?page=1&limit=${limitCount}&sort=createdAt&order=desc`);
    const raw: any[] = Array.isArray(prodResp?.data)
      ? prodResp.data
      : Array.isArray(prodResp?.products)
        ? prodResp.products
        : Array.isArray(prodResp?.data?.products)
          ? prodResp.data.products
          : [];
    if (raw.length > 0) {
      return raw.map((p: any, idx: number) => {
        const idNum = typeof p?.id === 'number' ? p.id : (typeof p?.id === 'string' ? Number(p.id) : 0);
        const name = p?.name ?? p?.name_en ?? p?.name_ar ?? '';
        const description = p?.description ?? p?.description_en ?? p?.description_ar ?? '';
        const mainImage = p?.mainImage ?? (Array.isArray(p?.images) ? p.images[0] : '');
        const localImage = Number.isFinite(idNum) ? getProductImage(idNum) : undefined;
        const finalMainImage = localImage || mainImage;
        return {
          id: Number.isFinite(idNum) ? idNum : idx,
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
        } as CollectionProduct;
      });
    }

    // fallback للموك داتا مباشرة
    const productsMock = await readMockJson('/mock-data/products.json');
    const productsArr: any[] = Array.isArray(productsMock) ? productsMock : [];
    let filtered: any[] = [];
    if (col?.type === 'manual' && Array.isArray(col?.products)) {
      filtered = productsArr.filter((p: any) => col.products.includes(p.id));
    } else if (col?.type === 'automated' && col?.conditions) {
      filtered = productsArr.filter((p: any) => {
        const inCategory = !col.conditions.categories || col.conditions.categories.includes(p.categoryId);
        const avail = col.conditions.isAvailable === undefined ? true : p.isAvailable === col.conditions.isAvailable;
        return inCategory && avail;
      });
    } else {
      filtered = productsArr;
    }
    const sliced = filtered.slice(0, limitCount);
    return sliced.map((p: any, idx: number) => {
      const idNum = typeof p?.id === 'number' ? p.id : (typeof p?.id === 'string' ? Number(p.id) : 0);
      const name = p?.name ?? p?.name_en ?? p?.name_ar ?? '';
      const description = p?.description ?? p?.description_en ?? p?.description_ar ?? '';
      const mainImage = p?.mainImage ?? (Array.isArray(p?.images) ? p.images[0] : '');
      const localImage = Number.isFinite(idNum) ? getProductImage(idNum) : undefined;
      const finalMainImage = localImage || mainImage;
      return {
        id: Number.isFinite(idNum) ? idNum : idx,
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
      } as CollectionProduct;
    });
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setProducts([]);
      setCollection(null);

      const targetNorm = (s: string) => (s || '').trim().toLowerCase();
      const target = targetNorm(arabicName);

      try {
        let resolvedCollection: Collection | null = null;

        // النهج المحترم: اعتمد على قائمة المجموعات ثم طابق الاسم محلياً (يدعم الموك والـ API الحقيقي)
        const list: any[] = await fetchCollections();
        const found = list.find((c: any) => {
          const ar = typeof c?.name === 'string' ? c?.name : (c?.name?.ar || c?.name_ar || '');
          const en = typeof c?.name === 'string' ? c?.name : (c?.name?.en || c?.name_en || '');
          const nar = targetNorm(ar);
          const nen = targetNorm(en);
          return nar === target || nen === target || nar.includes(target) || nen.includes(target);
        });
        if (found) resolvedCollection = found as Collection;

        if (!cancelled) {
          const finalCol = resolvedCollection || null;
          if (!finalCol) {
            setError('لم يتم العثور على المجموعة بالاسم العربي المحدد');
            setLoading(false);
            return;
          }

          try {
            const normalized = await fetchCollectionProducts(finalCol, limit);
            if (!cancelled) {
              setCollection(finalCol);
              setProducts(normalized);
            }
          } catch (e: any) {
            if (!cancelled) setError(e?.message || 'فشل في جلب منتجات المجموعة');
          } finally {
            if (!cancelled) setLoading(false);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'حدث خطأ غير متوقع');
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arabicName, i18n.language, limit]);

  return (
    <div className={className || ''}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">{displayTitle}</h2>
          <p className="text-[#ffffff]/80 text-base md:text-lg">{i18n.language === 'ar' ? 'عروض مميزة' : 'Featured Offers'}</p>
        </div>

        {loading ? (
          <div className="text-center text-[#ffffff]/80">جارِ التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center text-[#ffffff]/60">
                لا توجد عناصر لعرضها حالياً
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArabicCollectionProducts;