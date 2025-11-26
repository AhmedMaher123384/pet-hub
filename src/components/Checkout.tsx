import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { 
  ShoppingCart, User, CreditCard, CheckCircle, ArrowLeft, 
  Package, MapPin, Phone, Mail, Gift, Truck 
} from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import PriceDisplay from './ui/PriceDisplay';
import { useCurrency } from '../contexts/CurrencyContext';

// Interfaces
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  mainImage: string;
  productType?: string;
  additionalServices?: Array<{
    name: string;
    price: number;
    description?: string;
  }>;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product?: Product;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
  productOptions?: Array<{
    optionId: string;
    optionName: { ar: string; en: string };
    value: string | string[];
    priceModifier: number;
  }>;
  productOptionsPriceModifier?: number;
  attachments?: {
    images?: string[];
    text?: string;
  };
  addOns?: Array<{ name: string; price: number; description?: string }>;
  totalPrice?: number;
  basePrice?: number;
  addOnsPrice?: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  notes?: string;
  address: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

interface ShippingMethod {
  _id: string;
  regionName: string;
  price: number;
  isActive: boolean;
}

const Checkout: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const { getCurrentCurrencySymbol } = useCurrency();
  const isRTL = i18n.language === 'ar';

  // Helper for localized add-on content
  const getLocalizedAddOnContent = (field: 'name' | 'description', addOn: any) => {
    const currentLang = i18n.language;
    if (!addOn) return '';
    if (currentLang === 'ar') {
      return addOn[`${field}_ar`] || addOn[`${field}_en`] || addOn[field] || '';
    } else {
      return addOn[`${field}_en`] || addOn[`${field}_ar`] || addOn[field] || '';
    }
  };

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    notes: '',
    address: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [loading, setLoading] = useState<boolean>(true);
  const [placing, setPlacing] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponValidating, setCouponValidating] = useState<boolean>(false);
  const [shippingRegions, setShippingRegions] = useState<ShippingMethod[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<ShippingMethod | null>(null);
  const [regionsLoading, setRegionsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const paymentMethods: PaymentMethod[] = [
    { id: 'cod', name: t('checkout.cashOnDelivery'), description: t('checkout.cashOnDeliveryDesc') }
  ];

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        try {
          const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
          if (Array.isArray(data) && data.length > 0) {
            setCartItems(data);
            return;
          }
        } catch (error) {
          console.error('Error fetching from server, falling back to localStorage:', error);
        }
      }
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        const localItems = JSON.parse(localCart);
        if (Array.isArray(localItems) && localItems.length > 0) {
          const formattedItems = localItems.map((item: any) => ({
            id: item.id || Date.now() + Math.random(),
            productId: item.productId,
            quantity: item.quantity || 1,
            selectedOptions: item.selectedOptions || {},
            optionsPricing: item.optionsPricing || {},
            attachments: item.attachments || {},
            addOns: item.addOns || [],
            productOptions: item.productOptions || [],
            productOptionsPriceModifier: item.productOptionsPriceModifier || 0,
            basePrice: item.basePrice,
            addOnsPrice: item.addOnsPrice,
            totalPrice: item.totalPrice,
            product: item.product || {
              id: item.productId,
              name: 'منتج غير معروف',
              price: 0,
              mainImage: '',
              productType: item.product?.productType || ''
            }
          }));
          setCartItems(formattedItems);
          return;
        }
      }
      setCartItems([]);
    } catch (error) {
      console.error('Error in fetchCart:', error);
      smartToast.frontend.error('فشل في تحميل السلة');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch shipping regions
  const fetchShippingRegions = useCallback(async () => {
    try {
      setRegionsLoading(true);
      const data = await apiCall(API_ENDPOINTS.SHIPPING_ACTIVE);
      if (Array.isArray(data)) {
        setShippingRegions(data);
        if (data.length > 0 && !selectedRegion) {
          setSelectedRegion(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching shipping regions:', error);
      smartToast.frontend.error('فشل في تحميل مناطق الشحن');
    } finally {
      setRegionsLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    fetchCart();
    fetchShippingRegions();
  }, [fetchCart]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCustomerInfo(prev => ({
          ...prev,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          phone: user.phone || ''
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Calculations
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const basePrice = item.basePrice || (item.product ? item.product.price : 0);
      const optionsPrice = item.optionsPricing ? 
        Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0) : 0;
      const productOptionsPrice = item.productOptionsPriceModifier || 0;
      const addOnsPrice = item.addOnsPrice || 0;
      const itemPrice = (item.totalPrice && item.totalPrice > 0) ? 
        item.totalPrice : (basePrice + optionsPrice + productOptionsPrice + addOnsPrice);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);
  const getDiscountAmount = () => appliedCoupon ? appliedCoupon.discountAmount : 0;
  const getShippingPrice = () => selectedRegion ? selectedRegion.price : 0;
  const getFinalTotal = () => Math.max(0, getTotalPrice() - getDiscountAmount() + getShippingPrice());

  const formatOptionName = (optionName: string): string => {
    const optionNames: { [key: string]: string } = {
      nameOnSash: 'الاسم على الوشاح',
      embroideryColor: 'لون التطريز',
      capFabric: 'قماش الكاب',
      size: 'التفاصيل',
      color: 'اللون',
      capColor: 'لون الكاب',
      dandoshColor: 'لون الدندوش',
      fabric: 'نوع القماش',
      length: 'الطول',
      width: 'العرض',
      material: 'المادة',
      style: 'النمط',
      pattern: 'النقشة',
      finish: 'اللمسة النهائية',
      customization: 'التخصيص',
      engraving: 'النقش',
      packaging: 'التغليف'
    };
    return optionNames[optionName] || optionName;
  };

  // Coupon
  const validateCoupon = async (code: string) => {
    try {
      setCouponValidating(true);
      const data = await apiCall(API_ENDPOINTS.VALIDATE_COUPON, {
        method: 'POST',
        body: JSON.stringify({ code, totalAmount: getTotalPrice() })
      });
      if (data.coupon && data.discountAmount !== undefined) {
        setAppliedCoupon({ ...data.coupon, discountAmount: data.discountAmount });
        smartToast.frontend.success(`تم تطبيق كود الخصم! خصم ${data.discountAmount} ${getCurrentCurrencySymbol()}`);
      } else {
        smartToast.frontend.error(data.message || 'كود الخصم غير صحيح');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      smartToast.frontend.error('فشل في التحقق من كود الخصم');
    } finally {
      setCouponValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    smartToast.frontend.info('تم إلغاء الكوبون');
  };

  // Input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  // Validation
  const validateAll = (): boolean => {
    if (cartItems.length === 0) {
      smartToast.frontend.error('سلة التسوق فارغة!');
      return false;
    }
    if (!customerInfo.name?.trim() || !customerInfo.phone?.trim()) {
      smartToast.frontend.error('يرجى ملء جميع بيانات التوصيل المطلوبة (الاسم ورقم الهاتف)');
      return false;
    }
    if (!customerInfo.address?.trim()) {
      smartToast.frontend.error('يرجى ملء العنوان التفصيلي');
      return false;
    }
    if (!selectedRegion) {
      smartToast.frontend.error('يرجى اختيار منطقة الشحن');
      return false;
    }
    if (!selectedPaymentMethod) {
      smartToast.frontend.error('يرجى اختيار طريقة الدفع');
      return false;
    }
    return true;
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!validateAll()) return;
    setPlacing(true);
    try {
      const userData = localStorage.getItem('user');
      let user = null;
      let isGuest = false;
      if (userData) {
        user = JSON.parse(userData);
      }
      if (!user || !user.id) {
        isGuest = true;
        user = {
          id: `guest_${Date.now()}`,
          email: customerInfo.email?.trim() || '',
          name: customerInfo.name?.trim() || '',
          phone: customerInfo.phone?.trim() || '',
          isGuest: true
        };
      }

      const paymentResult = await processPayment({});
      if (!paymentResult.success) {
        throw new Error('فشل في معالجة الدفع');
      }

      const orderPayload = {
        items: cartItems.map(item => {
          const basePrice = item.product?.price || 0;
          const optionsPrice = item.optionsPricing ? 
            Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0) : 0;
          const addOnsPrice = item.addOnsPrice || 0;
          const totalItemPrice = item.totalPrice || ((basePrice + optionsPrice + addOnsPrice) * item.quantity);
          return {
            productId: item.productId,
            productName: item.product?.name || 'منتج غير معروف',
            price: basePrice,
            quantity: item.quantity,
            totalPrice: totalItemPrice,
            selectedOptions: item.selectedOptions || {},
            optionsPricing: item.optionsPricing || {},
            productOptions: item.productOptions || [],
            productOptionsPriceModifier: item.productOptionsPriceModifier || 0,
            productImage: item.product?.mainImage || '',
            attachments: item.attachments || {},
            addOns: item.addOns || [],
            basePrice: item.basePrice || basePrice,
            addOnsPrice: item.addOnsPrice || 0,
            productType: item.product?.productType || ''
          };
        }),
        customerInfo: {
          name: customerInfo.name?.trim() || '',
          email: customerInfo.email?.trim() || '',
          phone: customerInfo.phone?.trim() || '',
          notes: customerInfo.notes?.trim() || '',
          address: customerInfo.address?.trim() || ''
        },
        paymentMethod: selectedPaymentMethod,
        total: getFinalTotal(),
        subtotal: getTotalPrice(),
        shippingPrice: getShippingPrice(),
        shippingRegion: selectedRegion ? {
          id: selectedRegion._id,
          name: selectedRegion.regionName,
          price: selectedRegion.price
        } : null,
        couponDiscount: getDiscountAmount(),
        appliedCoupon: appliedCoupon ? {
          code: appliedCoupon.coupon?.code || '',
          discount: getDiscountAmount()
        } : null,
        userId: isGuest ? null : user.id,
        isGuestOrder: isGuest,
        ...(paymentResult.paymentId && { 
          paymentId: paymentResult.paymentId,
          paymentStatus: 'paid'
        }),
        ...(!paymentResult.paymentId && { 
          paymentStatus: 'pending'
        })
      };

      const result = await apiCall(API_ENDPOINTS.CHECKOUT, {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      if (!result || !result.orderId) {
        throw new Error(result?.message || 'فشل في إتمام الطلب');
      }

      const thankYouOrder = {
        id: result.orderId,
        customerName: customerInfo.name?.trim() || '',
        customerEmail: customerInfo.email?.trim() || '',
        customerPhone: customerInfo.phone?.trim() || '',
        isGuest: isGuest,
        items: cartItems.map(item => {
          const basePrice = item.product?.price || 0;
          const optionsPrice = item.optionsPricing ? 
            Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0) : 0;
          const addOnsPrice = item.addOnsPrice || 0;
          const itemTotalPrice = item.totalPrice || (basePrice + optionsPrice + addOnsPrice);
          return {
            id: item.product?.id || item.productId,
            name: item.product?.name || 'منتج غير معروف',
            price: basePrice,
            quantity: item.quantity,
            mainImage: item.product?.mainImage || '',
            selectedOptions: item.selectedOptions || {},
            optionsPricing: item.optionsPricing || {},
            productOptions: item.productOptions || [],
            productOptionsPriceModifier: item.productOptionsPriceModifier || 0,
            attachments: item.attachments || {},
            addOns: item.addOns || [],
            basePrice: item.basePrice || basePrice,
            addOnsPrice: item.addOnsPrice || 0,
            productType: item.product?.productType || '',
            totalPrice: itemTotalPrice * item.quantity
          };
        }),
        totalAmount: getTotalPrice(),
        shippingPrice: getShippingPrice(),
        shippingRegion: selectedRegion ? selectedRegion.regionName : '',
        couponDiscount: getDiscountAmount(),
        customerAddress: customerInfo.address,
        finalAmount: getFinalTotal(),
        paymentMethod: paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.name || 'الدفع عند الاستلام',
        notes: customerInfo.notes?.trim() || '',
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      localStorage.setItem('thankYouOrder', JSON.stringify(thankYouOrder));
      localStorage.setItem('lastOrderId', thankYouOrder.id.toString());
      smartToast.frontend.success('تم إرسال طلبك بنجاح!');

      if (!isGuest && user && user.id) {
        await apiCall(API_ENDPOINTS.USER_CART(user.id), { method: 'DELETE' });
      } else {
        localStorage.removeItem('cart');
      }

      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/thank-you', { state: { order: thankYouOrder }, replace: true });
    } catch (error) {
      console.error('Error placing order:', error);
      smartToast.frontend.error(error instanceof Error ? error.message : 'فشل في إتمام الطلب');
    } finally {
      setPlacing(false);
    }
  };

  const handlePaymentMethodSelection = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    smartToast.frontend.success(`تم اختيار ${paymentMethods.find(pm => pm.id === methodId)?.name}`);
  };

  const processPayment = async (_: any) => {
    if (selectedPaymentMethod === 'card' || selectedPaymentMethod === 'wallet') {
      const confirmPayment = window.confirm(
        `هل تريد المتابعة للدفع الإلكتروني؟\nالمبلغ: ${getFinalTotal().toFixed(2)} ${getCurrentCurrencySymbol()}`
      );
      if (!confirmPayment) throw new Error('تم إلغاء عملية الدفع');
      smartToast.frontend.success('تم الدفع بنجاح!');
      return { success: true, paymentId: 'PAY_' + Date.now() };
    }
    return { success: true, paymentId: null };
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-3 border-[#0A2A55] border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-black text-[#0A2A55] mt-6">جاري تحميل السلة...</h2>
        </div>
      </div>
    );
  }

  // Empty State
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-2xl shadow-md p-12 sm:p-16 text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#e28437]/10 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-[#e28437]" />
          </div>
          <h2 className="text-2xl font-black text-[#0A2A55] mb-4">سلة التسوق فارغة</h2>
          <p className="text-gray-700 text-lg mb-8">
            أضف بعض المنتجات أولاً
          </p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center justify-center px-8 py-4 bg-[#e28437] text-white font-bold rounded-xl hover:bg-[#4a221f] min-w-[200px]"
          >
            تسوق الآن
          </button>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <section className="min-h-screen bg-gray-50 py-8 sm:py-12" dir="rtl">
      {/* Header */}
      <div className="bg-[#e28437] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <div>
                <h1 className="text-2xl font-black">{t('checkout.checkout')}</h1>
                <p className="text-sm opacity-90">{t('checkout.reviewOrder')}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('checkout.backToCart')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-black text-[#0A2A55] mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />
                {t('checkout.order_summary')}
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.product?.mainImage ? (
                          <img 
                            src={buildImageUrl(item.product.mainImage)} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-[#0A2A55] text-base mb-1 truncate">
                          {item.product?.name || 'منتج غير معروف'}
                        </h3>
                        <p className="text-gray-700 text-sm">×{item.quantity}</p>

                        {/* Selected Options */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                              <div key={key} className="text-xs text-gray-600">
                                <span className="font-medium">{formatOptionName(key)}:</span> {value}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Product Options */}
                        {Array.isArray(item.productOptions) && item.productOptions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {item.productOptions.map((opt, idx) => (
                              <div key={idx} className="text-xs text-gray-600">
                                <span className="font-medium">
                                  {opt.optionName ? (i18n.language === 'ar' ? opt.optionName.ar : opt.optionName.en) : opt.optionId}:
                                </span>{' '}
                                {Array.isArray(opt.value) ? opt.value.join(', ') : opt.value}
                                {opt.priceModifier > 0 && (
                                  <span className="text-[#e28437] mr-1">
                                    (+{opt.priceModifier} {getCurrentCurrencySymbol()})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add-ons */}
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {item.addOns.map((addon, idx) => (
                              <div key={idx} className="text-xs text-gray-600">
                                <span>{getLocalizedAddOnContent('name', addon)}</span>
                                <span className="text-[#e28437] mr-1">
                                  (+{addon.price} {getCurrentCurrencySymbol()})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Item Total */}
                        <div className="mt-3 text-right">
                          <PriceDisplay 
                            price={(() => {
                              const base = item.basePrice || (item.product?.price || 0);
                              const opts = item.optionsPricing ? Object.values(item.optionsPricing).reduce((s, p) => s + (p || 0), 0) : 0;
                              const prodOpts = item.productOptionsPriceModifier || 0;
                              const addons = item.addOnsPrice || 0;
                              return (base + opts + prodOpts + addons) * item.quantity;
                            })()}
                            className="font-black text-[#e28437] text-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="كود الخصم"
                    className="flex-1 px-4 py-3 bg-white border border-[#e28437]/30 rounded-lg text-[#e28437] placeholder-[#e28437]/50 focus:outline-none focus:ring-2 focus:ring-[#e28437] text-sm"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={removeCoupon}
                      className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm"
                    >
                      إلغاء
                    </button>
                  ) : (
                    <button
                      onClick={() => validateCoupon(couponCode)}
                      disabled={!couponCode.trim() || couponValidating}
                      className="px-4 py-3 bg-[#e28437] hover:bg-[#4a221f] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm"
                    >
                      {couponValidating ? '...' : 'تطبيق'}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                      <Gift className="w-4 h-4" />
                      <span>كود الخصم مُطبّق: {appliedCoupon.coupon?.code}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>المجموع ({getTotalItems()} منتجات)</span>
                  <PriceDisplay price={getTotalPrice()} />
                </div>
                {getDiscountAmount() > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>الخصم</span>
                    <PriceDisplay price={-getDiscountAmount()} />
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>رسوم التوصيل</span>
                  <PriceDisplay price={getShippingPrice()} />
                </div>
                <div className="flex justify-between font-black text-[#e28437] text-xl pt-2 border-t border-gray-200">
                  <span>المجموع الكلي</span>
                  <PriceDisplay price={getFinalTotal()} />
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-black text-[#0A2A55] mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('checkout.deliveryInfo')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-[#0A2A55] font-medium mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#0A2A55] font-medium mb-2">رقم الجوال *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-gray-800"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#0A2A55] font-medium mb-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-gray-800"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#0A2A55] font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> العنوان التفصيلي *
                  </label>
                  <textarea
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-gray-800 resize-none"
                    required
                  />
                  <p className="text-gray-600 text-sm mt-1">يرجى كتابة العنوان الكامل لتوصيل دقيق</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[#0A2A55] font-medium mb-2">ملاحظات إضافية</label>
                  <textarea
                    name="notes"
                    value={customerInfo.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-gray-800 resize-none"
                    placeholder="مثال: بالقرب من مسجد..., الطابق الثالث بدون مصعد"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Region */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-black text-[#0A2A55] mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                {t('checkout.shippingRegion')}
              </h2>
              {regionsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="inline-block w-6 h-6 border-3 border-[#0A2A55] border-t-transparent rounded-full animate-spin"></div>
                  <span className="mr-3 text-[#0A2A55] font-medium">جاري التحميل...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingRegions.map((region) => (
                    <div
                      key={region._id}
                      onClick={() => setSelectedRegion(region)}
                      className={`p-4 border-2 rounded-xl cursor-pointer ${
                        selectedRegion?._id === region._id
                          ? 'border-[#e28437] bg-[#e28437]/5'
                          : 'border-gray-200 hover:border-[#e28437]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedRegion?._id === region._id
                              ? 'border-[#e28437] bg-[#e28437]'
                              : 'border-gray-300'
                          }`}>
                            {selectedRegion?._id === region._id && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="font-medium text-[#0A2A55]">{region.regionName}</span>
                        </div>
                        <span className="font-black text-[#e28437]">
                          <PriceDisplay price={region.price} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-black text-[#0A2A55] mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t('checkout.paymentMethod')}
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handlePaymentMethodSelection(method.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer ${
                      selectedPaymentMethod === method.id
                        ? 'border-[#e28437] bg-[#e28437]/5'
                        : 'border-gray-200 hover:border-[#e28437]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === method.id
                          ? 'border-[#e28437] bg-[#e28437]'
                          : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#0A2A55]">{method.name}</h3>
                        <p className="text-gray-600 text-sm">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Place Order Button */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <button
                onClick={handlePlaceOrder}
                disabled={placing || cartItems.length === 0}
                className="w-full bg-[#e28437] hover:bg-[#4a221f] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-xl transition-colors text-lg"
              >
                {placing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري إنشاء الطلب...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    تأكيد الطلب - <PriceDisplay price={getFinalTotal()} />
                  </div>
                )}
              </button>
              <p className="text-center text-gray-600 text-sm mt-3">
                بالضغط على تأكيد الطلب، أنت توافق على الشروط والأحكام.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;