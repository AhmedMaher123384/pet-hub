import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { smartToast } from '../utils/toastConfig';
import { Heart, ShoppingCart, Trash2, Package, X, Eye } from 'lucide-react';
import { createProductSlug } from '../utils/slugify';
import { addToCartUnified, removeFromWishlistUnified } from '../utils/cartUtils';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { PRODUCT_PLACEHOLDER_SRC } from '../utils/placeholders';
import PriceDisplay from './ui/PriceDisplay';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  mainImage: string;
  isAvailable: boolean;
  description: string;
  categoryId?: number;
}

const Wishlist: React.FC = () => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlistProducts();

    const handleWishlistUpdate = () => loadWishlistProducts();
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  const loadWishlistProducts = async () => {
    try {
      setLoading(true);
      let wishlistIds: number[] = [];
      const userData = localStorage.getItem('user');

      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) {
            const serverWishlist = await apiCall(API_ENDPOINTS.USER_WISHLIST(user.id));
            wishlistIds = serverWishlist.map((item: any) => item.productId || item.id);
            localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
          }
        } catch (serverError) {
          const savedWishlist = localStorage.getItem('wishlist');
          if (savedWishlist) wishlistIds = JSON.parse(savedWishlist) || [];
        }
      } else {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) wishlistIds = JSON.parse(savedWishlist) || [];
      }

      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      const productsResponse = await apiCall(API_ENDPOINTS.PRODUCTS);
      const allProducts = productsResponse.products || productsResponse;
      const wishlistProducts = allProducts.filter((product: Product) =>
        wishlistIds.includes(product.id)
      );
      setWishlistProducts(wishlistProducts);
    } catch (error) {
      smartToast.frontend.error('فشل في تحميل قائمة المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number, productName: string) => {
    try {
      const userData = localStorage.getItem('user');
      let success = false;

      if (userData) {
        const user = JSON.parse(userData);
        success = user?.id
          ? await removeFromWishlistUnified(productId, productName)
          : await removeFromWishlistGuest(productId, productName);
      } else {
        success = await removeFromWishlistGuest(productId, productName);
      }

      if (success) {
        setWishlistProducts((prev) => prev.filter((product) => product.id !== productId));
        const savedWishlist = localStorage.getItem('wishlist');
        const newWishlist = savedWishlist ? JSON.parse(savedWishlist).filter((id: number) => id !== productId) : [];
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: newWishlist }));
      }
    } catch (error) {
      smartToast.frontend.error('فشل في حذف المنتج من المفضلة');
    }
  };

  const removeFromWishlistGuest = async (productId: number, productName: string): Promise<boolean> => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      const currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      const newWishlist = currentWishlist.filter((id: number) => id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      smartToast.frontend.success(`تم حذف ${productName} من المفضلة`);
      return true;
    } catch (error) {
      smartToast.frontend.error('فشل في حذف المنتج من المفضلة');
      return false;
    }
  };

  const addToCart = async (productId: number, productName: string) => {
    try {
      const success = await addToCartUnified(productId, productName, 1);
      // لا تعرض أي توست نجاح عند الإضافة للسلة بناءً على الطلب
    } catch (error) {
      smartToast.frontend.error('فشل في إضافة المنتج للسلة');
    }
  };

  const clearWishlist = async () => {
    if (!window.confirm('هل أنت متأكد من إفراغ قائمة المفضلة؟')) return;

    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.id) {
          await apiCall(API_ENDPOINTS.USER_WISHLIST(user.id), { method: 'DELETE' });
        }
      }

      localStorage.setItem('wishlist', JSON.stringify([]));
      localStorage.setItem('lastWishlistCount', '0');
      setWishlistProducts([]);
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('wishlistCleared'));
      document.querySelectorAll('[data-wishlist-count]').forEach((element) => {
        if (element instanceof HTMLElement) {
          element.textContent = '0';
          element.style.display = 'none';
        }
      });
      smartToast.frontend.success('تم إفراغ قائمة المفضلة بالكامل');
    } catch (error) {
      smartToast.frontend.error('حدث خطأ أثناء إفراغ المفضلة');
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-8 sm:py-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0A2A55] mb-2">
                المنتجات المفضلة
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {wishlistProducts.length > 0 
                  ? `لديك ${wishlistProducts.length} منتج في قائمة المفضلة`
                  : 'قائمتك فارغة حالياً'}
              </p>
            </div>
            {wishlistProducts.length > 0 && (
              <button
                onClick={clearWishlist}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl border-2 border-red-200 hover:bg-red-100"
                aria-label="إفراغ قائمة المفضلة"
              >
                <Trash2 className="w-5 h-5" />
                <span>إفراغ الكل</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-md p-16 text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#e28437] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#0A2A55] font-bold text-lg mt-6">جارٍ تحميل المنتجات...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && wishlistProducts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 sm:p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#e28437]/5 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-[#e28437]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A2A55] mb-4">
              لا توجد منتجات مفضلة
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              ابدأ بإضافة منتجات إلى قائمة المفضلة لتسهيل الوصول إليها لاحقاً
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#e28437] text-white font-bold rounded-xl hover:bg-[#4a221f] min-w-[200px]"
              >
                استكشف المنتجات
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0A2A55] font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 min-w-[200px]"
              >
                الصفحة الرئيسية
              </Link>
            </div>
          </div>
        )}

        {/* Products List */}
        {wishlistProducts.length > 0 && (
          <div className="space-y-4">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Product Image */}
                  <div className="relative w-full sm:w-64 h-64 sm:h-48 flex-shrink-0 bg-gray-100">
                    <img
                      src={buildImageUrl(product.mainImage)}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = PRODUCT_PLACEHOLDER_SRC)}
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 text-sm font-black rounded-lg">
                        خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-xl sm:text-2xl font-black text-[#0A2A55] leading-tight">
                          {product.name}
                        </h3>
                        <button
                          onClick={() => removeFromWishlist(product.id, product.name)}
                          className="flex-shrink-0 w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100"
                          aria-label={`إزالة ${product.name} من المفضلة`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        {product.originalPrice && product.originalPrice > product.price ? (
                          <>
                            <span className="text-2xl font-black text-[#e28437]">
                              <PriceDisplay price={product.price} />
                            </span>
                            <span className="text-lg text-gray-400 line-through">
                              <PriceDisplay price={product.originalPrice} />
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-black text-[#e28437]">
                            <PriceDisplay price={product.price} />
                          </span>
                        )}
                      </div>

                      {!product.isAvailable && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg">
                          <Package className="w-4 h-4" />
                          غير متوفر حالياً
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <Link
                        to={`/product/${createProductSlug(product.id, product.name)}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0A2A55] text-white font-bold rounded-xl hover:bg-[#0A2A55]/90"
                      >
                        <Eye className="w-5 h-5" />
                        <span>عرض المنتج</span>
                      </Link>
                      {product.isAvailable && (
                        <button
                          onClick={() => addToCart(product.id, product.name)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#e28437] text-white font-bold rounded-xl hover:bg-[#4a221f]"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          <span>أضف للسلة</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Wishlist;