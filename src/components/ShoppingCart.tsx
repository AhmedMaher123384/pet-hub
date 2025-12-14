import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { smartToast } from '../utils/toastConfig';
import { ShoppingCart as CartIcon , Plus, Minus, Trash2, Package, ArrowRight, X, Truck, Clock, ArrowLeft } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { PRODUCT_PLACEHOLDER_SRC } from '../utils/placeholders';
import PriceDisplay from './ui/PriceDisplay';
import CheckoutAuthModal from './modals/CheckoutAuthModal';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    mainImage: string;
    isAvailable: boolean;
  };
  totalPrice?: number;
}

const ShoppingCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckoutAuthModal, setShowCheckoutAuthModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      let cart: CartItem[] = [];

      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) {
            const serverCart = await apiCall(API_ENDPOINTS.USER_CART(user.id));
            cart = Array.isArray(serverCart) ? serverCart : serverCart.cart || [];
            localStorage.setItem('cart', JSON.stringify(cart));
          }
        } catch (e) {
          const saved = localStorage.getItem('cart');
          if (saved) cart = JSON.parse(saved);
        }
      } else {
        const saved = localStorage.getItem('cart');
        if (saved) cart = JSON.parse(saved);
      }

      setCartItems(cart);
    } catch (error) {
      smartToast.frontend.error('فشل في تحميل السلة');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;

    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user?.id) {
        await apiCall(API_ENDPOINTS.CART_ITEM(user.id, itemId), {
          method: 'PUT',
          body: JSON.stringify({ quantity: newQty })
        });
      }
    }

    const updated = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
    smartToast.frontend.success('تم تحديث الكمية');
  };

  const removeFromCart = async (itemId: number) => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user?.id) {
        await apiCall(API_ENDPOINTS.CART_ITEM(user.id, itemId), { method: 'DELETE' });
      }
    }

    const updated = cartItems.filter(item => item.id !== itemId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
    smartToast.frontend.success('تم حذف المنتج من السلة');
  };

  const clearCart = async () => {
    if (!confirm('هل أنت متأكد من إفراغ السلة بالكامل؟')) return;

    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user?.id) {
        await apiCall(API_ENDPOINTS.USER_CART(user.id), { method: 'DELETE' });
      }
    }

    setCartItems([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('cartCleared'));
    smartToast.frontend.success('تم إفراغ السلة بالكامل');
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const proceedToCheckout = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setShowCheckoutAuthModal(true);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-8 sm:py-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0A2A55] mb-2">
                سلة التسوق
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {cartItems.length > 0
                  ? `لديك ${cartItems.length} منتج في السلة`
                  : 'سلتك فارغة حالياً'}
              </p>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl border-2 border-red-200 hover:bg-red-100"
              >
                <Trash2 className="w-5 h-5" />
                <span>إفراغ السلة</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-md p-16 text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#e28437] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#0A2A55] font-bold text-lg mt-6">جارٍ تحميل السلة...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && cartItems.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 sm:p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#e28437]/5 rounded-full flex items-center justify-center">
              <CartIcon className="w-12 h-12 text-[#e28437]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A2A55] mb-4">
              سلة التسوق فارغة
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              ابدأ بإضافة منتجات إلى سلتك لتتمكن من إتمام الطلب
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

        {/* Cart Items + Summary */}
        {!loading && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative w-full sm:w-64 h-64 sm:h-48 bg-gray-100 flex-shrink-0">
                      <img
                        src={buildImageUrl(item.product.mainImage)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = PRODUCT_PLACEHOLDER_SRC)}
                      />
                      {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 text-sm font-black rounded-lg">
                          خصم {Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-xl sm:text-2xl font-black text-[#0A2A55] leading-tight">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-2xl font-black text-[#e28437]">
                            <PriceDisplay price={item.product.price * item.quantity} />
                          </span>
                          {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                            <span className="text-lg text-gray-400 line-through">
                              <PriceDisplay price={item.product.originalPrice * item.quantity} />
                            </span>
                          )}
                        </div>

                    
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="text-xl font-black text-[#0A2A55] min-w-[4rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 rounded-lg bg-[#e28437] text-white hover:bg-[#4a221f] flex items-center justify-center"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>

                        <button
                          onClick={proceedToCheckout}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#e28437] text-white font-bold rounded-xl hover:bg-[#0A2A55]/90"
                        >
                          <span>إتمام الطلب</span>
                          <ArrowLeft className="w-5 h-5" />

                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
                <h3 className="text-2xl font-black text-[#0A2A55] mb-6">ملخص الطلب</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>الإجمالي الفرعي</span>
                    <PriceDisplay price={subtotal} className="font-bold text-[#0A2A55]" />
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>التوصيل</span>
                    <span className="font-bold">مجاني</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-xl font-black text-[#0A2A55]">الإجمالي</span>
                      <PriceDisplay price={subtotal} className="text-2xl font-black text-[#e28437]" />
                    </div>
                  </div>
                  <button
                    onClick={proceedToCheckout}
                    className="w-full mt-6 py-4 bg-[#e28437] text-white font-bold rounded-xl hover:bg-[#4a221f] transition-colors"
                  >
                    إتمام الطلب
                  </button>
                  <Link
                    to="/products"
                    className="block text-center mt-4 text-[#0A2A55] font-bold hover:underline"
                  >
                    مواصلة التسوق
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Auth Modal */}
      <CheckoutAuthModal
        isOpen={showCheckoutAuthModal}
        onClose={() => setShowCheckoutAuthModal(false)}
        onContinueAsGuest={() => navigate('/checkout')}
        onLoginSuccess={() => navigate('/checkout')}
      />
    </section>
  );
};

export default ShoppingCart;