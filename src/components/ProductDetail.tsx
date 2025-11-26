// === بداية قسم: تصدير المكون ===
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../utils/toastConfig';
import { 
  extractIdFromSlug, 
  isValidSlug, 
  slugify, 
  createProductSlug 
} from '../utils/slugify';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  ArrowRight, 
  Plus, 
  Minus, 
  FileText,
  AlertCircle,
  Sparkles,
  Gift,
  MessageSquare,
  Send,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import WhatsAppButton from './ui/WhatsAppButton';
import { PRODUCT_PLACEHOLDER_SRC } from '../utils/placeholders';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';
import { addToCartUnified, addToWishlistUnified, removeFromWishlistUnified } from '../utils/cartUtils';
import { commentService, Comment, CreateCommentData } from '../services/commentService';
import AuthModal from './modals/AuthModal';
import PriceDisplay from './ui/PriceDisplay';
import ProductOptionsSelector from './ui/ProductOptionsSelector';
import { useCurrency } from '../contexts/CurrencyContext';

// === نهاية قسم: تصدير المكون ===

// === بداية قسم: أنواع البيانات ===
interface ProductOption {
  id: string;
  type: 'dropdown' | 'radio' | 'checkbox' | 'text' | 'number' | 'color';
  name: { ar: string; en: string };
  label: { ar: string; en: string };
  required: boolean;
  options?: Array<{ value: string; label: { ar: string; en: string }; priceModifier: number; colorCode?: string; }>;
  placeholder?: { ar: string; en: string };
  validation?: { min?: number; max?: number; pattern?: string; };
  order: number;
}

interface Product {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  shortDescription?: string;
  shortDescription_ar?: string;
  shortDescription_en?: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId: number | null;
  mainImage: string;
  detailedImages?: string[];
  faqs?: Array<{ 
    question: string; question_ar?: string; question_en?: string; 
    answer: string; answer_ar?: string; answer_en?: string; 
  }>;
  addOns?: Array<{ 
    name: string; name_ar?: string; name_en?: string; 
    price: number; description?: string; description_ar?: string; description_en?: string; 
  }>;
  productOptions?: ProductOption[];
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
}
// === نهاية قسم: أنواع البيانات ===

// === بداية قسم: مكوّن FAQCard (محدّث للاستخدام الثابت بدون حركات) ===
const FAQCard: React.FC<{ 
  faq: { 
    question: string; question_ar?: string; question_en?: string; 
    answer: string; answer_ar?: string; answer_en?: string; 
  }; 
  index: number 
}> = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  const getLocalizedFAQContent = (field: 'question' | 'answer') => {
    const currentLang = i18n.language;
    if (currentLang === 'ar') {
      return faq[`${field}_ar`] || faq[`${field}_en`] || faq[field] || '';
    } else {
      return faq[`${field}_en`] || faq[`${field}_ar`] || faq[field] || '';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-right flex items-center justify-between bg-white"
      >
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-[#e28437] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
            {index + 1}
          </div>
          <h4 className="font-semibold text-[#0A2A55] text-sm sm:text-base text-right leading-relaxed">
            {getLocalizedFAQContent('question')}
          </h4>
        </div>
        <div className="flex-shrink-0 mr-2">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-[#e28437]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 bg-gray-50">
          <div className="border-r-4 border-[#e28437] pr-4">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {getLocalizedFAQContent('answer')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
// === نهاية قسم: مكوّن FAQCard ===

// === بداية قسم: المكون الرئيسي ===
const ProductDetail: React.FC = () => {
  const { t, i18n } = useTranslation(['product_detail', 'common']);
  const isRTL = i18n.language === 'ar';
  const { convertPrice, formatPrice } = useCurrency();
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [attachments, setAttachments] = useState<{
    images: File[];
    text: string;
  }>({
    images: [],
    text: ''
  });
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{ name: string; price: number; description?: string }>>([]);
  const [selectedProductOptions, setSelectedProductOptions] = useState<Array<{ optionId: string; value: string | string[]; priceModifier: number }>>([]);
  const [productOptionsPriceModifier, setProductOptionsPriceModifier] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // === بداية قسم: دوال مساعدة ===
  const getLocalizedContent = (field: 'name' | 'description' | 'shortDescription', item?: any) => {
    const currentLang = i18n.language;
    const targetItem = item || product;
    if (!targetItem) return '';
    if (currentLang === 'ar') {
      return targetItem[`${field}_ar`] || targetItem[`${field}_en`] || targetItem[field] || '';
    } else {
      return targetItem[`${field}_en`] || targetItem[`${field}_ar`] || targetItem[field] || '';
    }
  };

  const getCategoryLocalizedContent = (field: 'name' | 'description') => {
    if (!category) return '';
    const currentLang = i18n.language;
    if (currentLang === 'ar') {
      return category[`${field}_ar`] || category[`${field}_en`] || category[field] || '';
    } else {
      return category[`${field}_en`] || category[`${field}_ar`] || category[field] || '';
    }
  };
  // === نهاية قسم: دوال مساعدة ===

  // === بداية قسم: جلب البيانات ===
  useEffect(() => {
    const loadById = async (numericId: number) => {
      await fetchProductById(numericId);
    };

    const loadByNameSlug = async (nameSlug: string) => {
      await fetchProductByNameSlug(nameSlug);
    };

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        if (slug) {
          if (!isValidSlug(slug)) {
            setError(t('invalid_product_id'));
            return;
          }
          const decoded = decodeURIComponent(slug);
          const extracted = extractIdFromSlug(decoded);
          if (extracted && extracted > 0) {
            await loadById(extracted);
          } else {
            await loadByNameSlug(decoded);
          }
        } else if (id) {
          const numericId = parseInt(id, 10);
          if (numericId > 0) {
            await loadById(numericId);
          } else {
            setError(t('invalid_product_id'));
          }
        } else {
          setError(t('invalid_product_id'));
        }
      } finally {
        setLoading(false);
      }
    };

    init();

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [id, slug, t]);
  // === نهاية قسم: جلب البيانات ===

  // === بداية قسم: جلب التعليقات ===
  useEffect(() => {
    if (product) {
      fetchComments();
    }
  }, [product]);
  // === نهاية قسم: جلب التعليقات ===

  // === بداية قسم: معالجة البيانات من API ===
  const normalizeProductFromApi = (data: any) => {
    if (!data) return null;
    if (data.productOptions && data.productOptions.length > 0) {
      data.productOptions = data.productOptions.map((option: any) => ({
        id: option.id || Math.random().toString(36).substr(2, 9),
        type: option.type,
        name: { ar: option.name_ar || option.name || '', en: option.name_en || '' },
        label: { ar: option.label_ar || option.label || '', en: option.label_en || '' },
        required: option.required || false,
        options: option.options ? option.options.map((opt: any) => ({
          value: opt.value,
          label: { ar: opt.label_ar || opt.label || '', en: opt.label_en || '' },
          priceModifier: opt.priceModifier || 0,
          colorCode: opt.colorCode
        })) : [],
        placeholder: { ar: option.placeholder_ar || option.placeholder || '', en: option.placeholder_en || '' },
        validation: option.validation,
        order: option.order || 0
      }));
    }
    return data;
  };
  // === نهاية قسم: معالجة البيانات من API ===

  // === بداية قسم: دوال جلب المنتج والتصنيف ===
  const fetchProductById = async (numericId: number) => {
    try {
      const data = await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(numericId.toString()));
      if (!data) throw new Error(t('failed_to_load'));
      const normalized = normalizeProductFromApi(data);
      setProduct(normalized);
      if (normalized.categoryId) {
        fetchCategory(normalized.categoryId);
      }
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      setError(t('failed_to_load'));
    }
  };

  const fetchProductByNameSlug = async (nameSlug: string) => {
    try {
      const productsResponse = await apiCall(API_ENDPOINTS.PRODUCTS);
      const allProducts = Array.isArray(productsResponse)
        ? productsResponse
        : productsResponse?.data || productsResponse?.products || [];
      const target = nameSlug.trim();
      const found = allProducts.find((p: any) => {
        const candidates = [p.name, p.name_ar, p.name_en].filter(Boolean);
        return candidates.some((nm: string) => slugify(nm) === target);
      });
      if (!found) {
        setError(t('failed_to_load'));
        return;
      }
      const normalized = normalizeProductFromApi(found);
      setProduct(normalized);
      if (normalized.categoryId) {
        fetchCategory(normalized.categoryId);
      }
    } catch (error) {
      console.error('Error resolving product by name-only slug:', error);
      setError(t('failed_to_load'));
    }
  };

  const fetchCategory = async (categoryId: number) => {
    try {
      const data = await apiCall(API_ENDPOINTS.CATEGORY_BY_ID(categoryId));
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };
  // === نهاية قسم: دوال جلب المنتج والتصنيف ===

  // === بداية قسم: معالجة المرفقات ===
  const handleAttachmentImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments(prev => ({ ...prev, images: [...prev.images, ...filesArray] }));
    }
  };

  const handleAttachmentTextChange = (text: string) => {
    setAttachments(prev => ({ ...prev, text }));
  };

  const removeAttachmentImage = (index: number) => {
    setAttachments(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  // === نهاية قسم: معالجة المرفقات ===

  // === بداية قسم: إضافة/حذف الإضافات (Add-ons) ===
  const toggleAddOn = (addOn: { name: string; price: number; description?: string }) => {
    setSelectedAddOns(prev => {
      const isSelected = prev.some(item => item.name === addOn.name);
      if (isSelected) {
        return prev.filter(item => item.name !== addOn.name);
      } else {
        return [...prev, addOn];
      }
    });
  };
  // === نهاية قسم: إضافة/حذف الإضافات ===

  // === بداية قسم: معالجة خيارات المنتج ===
  const handleProductOptionsChange = useCallback((options: Array<{ optionId: string; value: string | string[]; priceModifier: number }>, totalPriceModifier: number) => {
    setSelectedProductOptions(options);
    setProductOptionsPriceModifier(totalPriceModifier);
  }, []);
  // === نهاية قسم: معالجة خيارات المنتج ===

  // === بداية قسم: حساب السعر ===
  const calculateTotalPrice = () => {
    if (!product) return 0;
    const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return (product.price + addOnsTotal + productOptionsPriceModifier) * quantity;
  };

  const getAddOnsPrice = () => {
    return selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
  };
  // === نهاية قسم: حساب السعر ===

  // === بداية قسم: التحقق من الخيارات المطلوبة ===
  const validateRequiredOptions = () => {
    if (!product?.productOptions) return true;
    const requiredOptions = product.productOptions.filter(option => option.required);
    for (const requiredOption of requiredOptions) {
      const selectedOption = selectedProductOptions.find(selected => selected.optionId === requiredOption.id);
      if (!selectedOption) {
        const optionLabel = i18n.language === 'ar' ? requiredOption.label.ar : requiredOption.label.en;
        smartToast.frontend.error(t('required_option_missing', { option: optionLabel }));
        return false;
      }
      if ((requiredOption.type === 'text' || requiredOption.type === 'number') && 
          (!selectedOption.value || (typeof selectedOption.value === 'string' && selectedOption.value.trim() === ''))) {
        const optionLabel = i18n.language === 'ar' ? requiredOption.label.ar : requiredOption.label.en;
        smartToast.frontend.error(t('required_option_empty', { option: optionLabel }));
        return false;
      }
      if (Array.isArray(selectedOption.value) && selectedOption.value.length === 0) {
        const optionLabel = i18n.language === 'ar' ? requiredOption.label.ar : requiredOption.label.en;
        smartToast.frontend.error(t('required_option_empty', { option: optionLabel }));
        return false;
      }
    }
    return true;
  };
  // === نهاية قسم: التحقق من الخيارات المطلوبة ===

  // === بداية قسم: إضافة إلى السلة ===
  const addToCart = async () => {
    if (!product) return;
    if (!validateRequiredOptions()) return;

    setAddingToCart(true);
    try {
      const addOnsPrice = getAddOnsPrice();
      const totalPrice = product.price + addOnsPrice + productOptionsPriceModifier;
      const attachmentsWithAddOns = {
        ...attachments,
        addOns: selectedAddOns,
        productOptions: selectedProductOptions,
        totalPrice: totalPrice,
        basePrice: product.price,
        addOnsPrice: addOnsPrice,
        productOptionsPriceModifier: productOptionsPriceModifier
      };

      const success = await addToCartUnified(
        product.id,
        getLocalizedContent('name'),
        quantity,
        attachmentsWithAddOns,
        product.price,
        product.mainImage
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      smartToast.frontend.error(t('add_to_cart_error'));
    } finally {
      setAddingToCart(false);
    }
  };
  // === نهاية قسم: إضافة إلى السلة ===

  // === بداية قسم: إضافة إلى المفضلة ===
  const addToWishlist = async () => {
    if (!product) return;
    try {
      const success = await addToWishlistUnified(product.id, getLocalizedContent('name'));
      if (success) {
        smartToast.frontend.success(t('wishlist_added'));
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      smartToast.frontend.error(t('wishlist_error'));
    }
  };
  // === نهاية قسم: إضافة إلى المفضلة ===

  // === بداية قسم: جلب وعرض التعليقات ===
  const fetchComments = async () => {
    if (!product) return;
    try {
      setCommentsLoading(true);
      const commentsData = await commentService.getProductComments(product.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      smartToast.frontend.error(t('comments_load_error'));
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!product || !commentText.trim()) {
      smartToast.frontend.error(t('comment_required'));
      return;
    }
    try {
      setIsSubmittingComment(true);
      const commentData: CreateCommentData = {
        productId: product.id,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        content: commentText.trim(),
        rating: commentRating
      };
      await commentService.createComment(commentData);
      await fetchComments();
      setCommentText('');
      setCommentRating(5);
      smartToast.frontend.success(t('comment_added'));
    } catch (error) {
      console.error('Error submitting comment:', error);
      smartToast.frontend.error(t('comment_add_error'));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    smartToast.frontend.success('مرحباً بك! يمكنك الآن إضافة تعليقك');
  };
  // === نهاية قسم: جلب وعرض التعليقات ===

  // === بداية قسم: عرض النجوم (ثابت بدون حركات) ===
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-[#e28437] fill-[#e28437]' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };
  // === نهاية قسم: عرض النجوم ===

  // === بداية قسم: حالة التحميل ===
  if (loading) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#e28437] border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-[#0A2A55] mt-4">{t('loading')}</h2>
          <p className="text-gray-600 mt-2">{t('loading_product')}</p>
        </div>
      </section>
    );
  }
  // === نهاية قسم: حالة التحميل ===

  // === بداية قسم: حالة الخطأ ===
  if (error || !product) {
    return (
      <section className="min-h-screen bg-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block w-12 h-12 rounded-full bg-[#e28437]/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-[#e28437]" />
          </div>
          <h2 className="text-xl font-bold text-[#0A2A55] mb-2">{t('error')}</h2>
          <p className="text-gray-700 mb-6">{error || t('product_not_found')}</p>
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
        
        {/* === بداية قسم: التنقل (Breadcrumb) === */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6" dir="ltr">
          <button 
            onClick={() => navigate('/')} 
            className="hover:text-[#e28437] transition-colors"
          >
            {t('home')}
          </button>
          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {category && (
            <>
              <span>{getCategoryLocalizedContent('name')}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </>
          )}
          <span className="text-[#0A2A55] font-medium">{getLocalizedContent('name')}</span>
        </nav>
        {/* === نهاية قسم: التنقل === */}

        {/* === بداية قسم: تفاصيل المنتج (صورة + معلومات) === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- الصورة (واحدة فقط) --- */}
          <div>
            <div className="bg-gray-50 rounded-lg overflow-hidden border">
              <img
                src={buildImageUrl(product.mainImage) || PRODUCT_PLACEHOLDER_SRC}
                alt={getLocalizedContent('name')}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = PRODUCT_PLACEHOLDER_SRC;
                }}
                loading="eager"
              />
            </div>
          </div>

          {/* --- المعلومات --- */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A2A55]">
                {getLocalizedContent('name')}
              </h1>
              <div className="h-1 w-24 bg-[#e28437] rounded-full mt-2"></div>
            </div>

            {/* السعر */}
            <div className="space-y-2">
              {product.originalPrice && product.originalPrice > product.price ? (
                <div className="flex items-baseline gap-2">
                  <PriceDisplay 
                    price={product.price} 
                    originalPrice={product.originalPrice}
                    className="text-2xl font-bold text-[#e28437]"
                  />
                </div>
              ) : (
                <PriceDisplay 
                  price={product.price}
                  className="text-2xl font-bold text-[#e28437]"
                />
              )}

              {/* السعر الإجمالي مع الإضافات */}
              {(selectedAddOns.length > 0 || productOptionsPriceModifier !== 0) && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="text-sm text-gray-700 mb-2">{t('total_price')}:</div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-600">{t('base_price')}: {formatPrice(product.price)}</div>
                      {productOptionsPriceModifier !== 0 && (
                        <div className={`text-gray-600 ${productOptionsPriceModifier > 0 ? 'text-[#e28437]' : 'text-red-600'}`}>
                          {t('product_options')}: {productOptionsPriceModifier > 0 ? '+' : ''}{formatPrice(productOptionsPriceModifier)}
                        </div>
                      )}
                      {selectedAddOns.length > 0 && (
                        <div className="text-[#e28437]">{t('addons')}: +{formatPrice(getAddOnsPrice())}</div>
                      )}
                    </div>
                    <div className="text-xl font-bold text-[#e28437]">
                      {formatPrice(calculateTotalPrice())}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* الوصف القصير */}
            {getLocalizedContent('shortDescription') && (
              <p className="text-gray-700 leading-relaxed">
                {getLocalizedContent('shortDescription')}
              </p>
            )}

            {/* خيارات المنتج */}
            {product.productOptions && product.productOptions.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-bold text-[#0A2A55] mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#e28437]" />
                  {t('product_options')}
                </h3>
                <ProductOptionsSelector
                  options={product.productOptions}
                  language={i18n.language}
                  onSelectionChange={handleProductOptionsChange}
                />
              </div>
            )}

            {/* الإضافات (Add-ons) */}
            {product.addOns && product.addOns.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-bold text-[#0A2A55] mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#e28437]" />
                  {t('addons')}
                </h3>
                <div className="space-y-3">
                  {product.addOns.map((addOn, index) => {
                    const isSelected = selectedAddOns.some(item => item.name === addOn.name);
                    return (
                      <div
                        key={index}
                        onClick={() => toggleAddOn(addOn)}
                        className={`p-4 border rounded-lg cursor-pointer ${
                          isSelected ? 'border-[#e28437] bg-[#e28437]/5' : 'border-gray-200 hover:border-[#e28437]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                              isSelected ? 'border-[#e28437] bg-[#e28437]' : 'border-gray-400'
                            }`}>
                              {isSelected && <span className="text-white text-xs">✓</span>}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{getLocalizedContent('name', addOn)}</h4>
                              {getLocalizedContent('description', addOn) && (
                                <p className="text-sm text-gray-600 mt-1">{getLocalizedContent('description', addOn)}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-[#e28437]">+{formatPrice(addOn.price)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* المرفقات */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-[#0A2A55] mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-[#e28437]/20 rounded flex items-center justify-center text-[#e28437] text-sm">📎</span>
                {t('additional_attachments')}
              </h3>
              <div className="space-y-4">
                <textarea
                  value={attachments.text}
                  onChange={(e) => handleAttachmentTextChange(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e28437] focus:border-[#e28437]"
                  placeholder={t('notes_placeholder')}
                />
                <div className="flex flex-wrap gap-2">
                  <label className="inline-block px-4 py-2 bg-white border border-dashed border-gray-400 rounded-md cursor-pointer hover:border-[#e28437]">
                    <span className="text-[#e28437]">📷</span> {t('add_images')}
                    <input
                      type="file"
                      onChange={handleAttachmentImagesChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </label>
                  {attachments.images.length > 0 && (
                    <span className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600">
                      {attachments.images.length} {t('image')}
                    </span>
                  )}
                </div>
                {attachments.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`${t('attachment')} ${index + 1}`}
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <button
                          onClick={() => removeAttachmentImage(index)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* أزرار الإضافة */}
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.isAvailable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.isAvailable ? t('available') : t('unavailable')}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={addToCart}
                  disabled={addingToCart || !product.isAvailable}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#e28437] text-white px-6 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <>
                      <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('adding')}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {t('add_to_cart')}
                    </>
                  )}
                </button>
                <button
                  onClick={addToWishlist}
                  className="p-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* === نهاية قسم: تفاصيل المنتج === */}

        {/* === بداية قسم: الوصف الكامل === */}
        {getLocalizedContent('description') && (
          <div className="mt-12">
            <div className="mb-4">
              <h2 className="text-2xl font-extrabold text-[#0A2A55]">{t('product_details')}</h2>
              <div className="h-1 w-24 bg-[#e28437] rounded-full mt-2"></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {getLocalizedContent('description')}
              </p>
            </div>
          </div>
        )}
        {/* === نهاية قسم: الوصف الكامل === */}

        {/* === بداية قسم: الأسئلة الشائعة === */}
        {product.faqs && product.faqs.length > 0 && (
          <div className="mt-12">
            <div className="mb-4">
              <h2 className="text-2xl font-extrabold text-[#0A2A55]">{t('faqs')}</h2>
              <div className="h-1 w-24 bg-[#e28437] rounded-full mt-2"></div>
            </div>
            <div className="space-y-3">
              {product.faqs?.map((faq, index) => (
                <FAQCard key={index} faq={faq} index={index} />
              ))}
            </div>
          </div>
        )}
        {/* === نهاية قسم: الأسئلة الشائعة === */}

        {/* === بداية قسم: التعليقات === */}
        <div className="mt-12">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-[#0A2A55]">{t('comments')} ({comments.length})</h2>
            <div className="h-1 w-24 bg-[#e28437] rounded-full mt-2"></div>
          </div>

          {/* نموذج إضافة تعليق */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#0A2A55] mb-4">{t('add_comment')}</h3>
            {!user ? (
              <div className="text-center py-6">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 mb-2">{t('login_to_comment')}</p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-block px-5 py-2 bg-[#e28437] text-white rounded-md hover:bg-[#4a221f]"
                >
                  {t('login')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e28437]/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#e28437]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">{t('rating')}</label>
                  <div className="flex gap-1">{renderStars(commentRating)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">{t('comment')}</label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('comment_placeholder')}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e28437] focus:border-[#e28437]"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">{commentText.length}/500</div>
                </div>
                
                <button 
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#e28437] text-white rounded-md disabled:opacity-50"
                >
                  {isSubmittingComment ? (
                    <>
                      <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('submit_comment')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* قائمة التعليقات */}
          <div className="space-y-4">
            {commentsLoading ? (
              <div className="text-center py-6">
                <div className="inline-block w-6 h-6 border-2 border-[#e28437] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-2">{t('loading_comments')}</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-5 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#e28437]/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#e28437]" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{comment.userName || t('user')}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(i18n.language, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    {comment.rating && renderStars(comment.rating)}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p>{t('no_comments')}</p>
              </div>
            )}
          </div>
        </div>
        {/* === نهاية قسم: التعليقات === */}

        {/* === بداية قسم: زر الواتساب === */}
        <div className="fixed bottom-4 right-4 z-40">
          <WhatsAppButton />
        </div>
        {/* === نهاية قسم: زر الواتساب === */}
        
      </div>

      {/* === بداية قسم: نافذة تسجيل الدخول === */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      {/* === نهاية قسم: نافذة تسجيل الدخول === */}
      
    </section>
  );
  // === نهاية قسم: العرض الأساسي ===
};
// === نهاية قسم: المكون الرئيسي ===

export default ProductDetail;
// === نهاية الملف ===