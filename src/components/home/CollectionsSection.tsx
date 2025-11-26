import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import ProductCard from '../ui/ProductCard';

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
  _id: string;
  name: { ar?: string; en?: string };
  type: 'manual' | 'automated';
  isActive?: boolean;
  featured?: boolean;
  productsCount?: number;
}

const CollectionsSection: React.FC = () => {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [collections, setCollections] = useState<Collection[]>([]);
  const [productsByCollection, setProductsByCollection] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localizedName = (c: Collection) => {
    if (!c?.name) return '';
    return isArabic ? (c.name.ar || c.name.en || '') : (c.name.en || c.name.ar || '');
  };

  useEffect(() => {
    let cancelled = false;
    const fetchCollectionsAndProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiCall(`${API_ENDPOINTS.COLLECTIONS}?active=true`);
        const cols: Collection[] = Array.isArray(res?.data) ? res.data : [];
        if (cancelled) return;
        setCollections(cols);

        // Fetch products for each collection (limit 8, latest first)
        const entries: Array<[string, Product[]]> = [];
        for (const col of cols) {
          try {
            const prodRes = await apiCall(`collections/${col._id}/products?page=1&limit=8&sort=createdAt&order=desc`);
            const prods: Product[] = Array.isArray(prodRes?.data) ? prodRes.data : [];
            if (cancelled) return;
            entries.push([col._id, prods]);
          } catch (err) {
            // If a specific collection fails, just skip it
            entries.push([col._id, []]);
          }
        }

        setProductsByCollection(Object.fromEntries(entries));
      } catch (err: any) {
        setError(err?.message || 'فشل في جلب المجموعات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCollectionsAndProducts();
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  const visibleCollections = useMemo(() => {
    return collections.filter(c => (productsByCollection[c._id]?.length || 0) > 0);
  }, [collections, productsByCollection]);

  if (loading) {
    return (
      <div className="py-10">
        <div className="text-center text-gray-200">جارِ تحميل المجموعات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (visibleCollections.length === 0) {
    return null;
  }

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title (optional) */}
        <h2 className="text-2xl font-bold text-white mb-6">{t('home.collections')}</h2>

        {visibleCollections.map((collection) => {
          const products = productsByCollection[collection._id] || [];
          return (
            <div key={collection._id} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{localizedName(collection)}</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionsSection;