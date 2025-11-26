import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import { Heart, ShoppingCart, CheckCircle, Sparkles, Package } from 'lucide-react';
import { createProductSlug } from '../../utils/slugify';
import { addToCartUnified, addToWishlistUnified, removeFromWishlistUnified } from '../../utils/cartUtils';
import { buildImageUrl } from '../../config/api';
import { PRODUCT_PLACEHOLDER_SRC } from '../../utils/placeholders';
import PriceDisplay from '../ui/PriceDisplay';

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

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { t, i18n } = useTranslation(['product_card', 'product', 'common']);
  const isRTL = i18n.language === 'ar';
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const getLocalizedContent = (field: 'name' | 'description') => {
    const currentLang = i18n.language;
    const arField = `${field}_ar` as keyof Product;
    const enField = `${field}_en` as keyof Product;
    if (currentLang === 'ar') {
      return (product[arField] as string) || product[field] || (product[enField] as string);
    } else {
      return (product[enField] as string) || product[field] || (product[arField] as string);
    }
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [product.id]);

  useEffect(() => {
    const handleWishlistUpdate = (event: any) => {
      if (event.detail && Array.isArray(event.detail)) {
        setIsInWishlist(event.detail.includes(product.id));
      } else {
        checkWishlistStatus();
      }
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product.id]);

  const truncateDescription = (text: string, maxWords: number = 5): string => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + ' ...';
  };

  const checkWishlistStatus = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setIsInWishlist(parsedWishlist.includes(product.id));
        }
      }
    } catch (error) {
      console.error(t('product_card.wishlist_error'), error);
      setIsInWishlist(false);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isInWishlist) {
        const success = await removeFromWishlistUnified(product.id, getLocalizedContent('name'));
        if (success) setIsInWishlist(false);
      } else {
        const success = await addToWishlistUnified(product.id, getLocalizedContent('name'));
        if (success) setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      smartToast.frontend.error(t('product.wishlist_error'));
    }
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.hasRequiredOptions) {
      const productPath = `/product/${createProductSlug(product.id, getLocalizedContent('name'))}`;
      navigate(productPath);
      smartToast.frontend.info(t('product.select_options_first', { name: getLocalizedContent('name') }));
      return;
    }
    try {
      const success = await addToCartUnified(product.id, getLocalizedContent('name'), quantity);
      if (success) {
        smartToast.frontend.success(t('product.added_to_cart', { name: getLocalizedContent('name') }));
      } else {
        smartToast.frontend.error(t('product.add_to_cart_failed'));
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      smartToast.frontend.error(t('product.add_to_cart_error'));
    }
  };

  const increaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < 99) setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productPath = `/product/${createProductSlug(product.id, getLocalizedContent('name'))}`;
    navigate(productPath);
  };

  const effectivePrice = product.price;
  const hasDiscount = false;
  const discountPercent = 0;

  // ======================= LIST VIEW =======================
  if (viewMode === 'list') {
    return (
      <div
        className={`group/card relative flex flex-col bg-white rounded-2xl border border-gray-200/50 shadow-sm w-full overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-[#e28437]/30 ${
          isRTL ? 'text-right md:text-right' : 'text-left md:text-left'
        } text-center md:text-start`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-br from-[#e28437]/20 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 blur-lg transition-opacity duration-500 pointer-events-none" />
        
        <Link
          to={`/product/${createProductSlug(product.id, getLocalizedContent('name'))}`}
          onClick={handleProductClick}
          className="relative block"
          aria-label={t('product.view_product_details', { name: getLocalizedContent('name') })}
        >
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-full blur opacity-50" />
                <div className="relative rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 shadow-lg">
                  <Sparkles className="inline w-3 h-3 mr-1" />
                  -{discountPercent}%
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md z-20 transition-all duration-300 ${
              isInWishlist 
                ? 'text-red-500 bg-red-50/90 shadow-lg shadow-red-500/20' 
                : 'text-gray-600 bg-white/90 hover:bg-red-50/90 hover:text-red-500'
            }`}
            type="button"
            aria-label={isInWishlist ? t('common.removeFromWishlist') : t('common.addToWishlist')}
          >
            <Heart className={`w-5 h-5 transition-transform duration-300 ${isInWishlist ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
          </button>

          <div className="flex p-5 gap-5 items-start">
            {/* Image */}
            <div className="flex-shrink-0 w-32 h-32 relative">
              <div className="w-full h-full rounded-xl overflow-hidden shadow-md group-hover/card:shadow-xl transition-shadow duration-300">
                <img
                  src={buildImageUrl(product.mainImage)}
                  alt={getLocalizedContent('name')}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover/card:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = PRODUCT_PLACEHOLDER_SRC;
                  }}
                />
              </div>
              {product.isAvailable === false && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-xl">
                  <span className="text-white font-bold bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 rounded-lg text-sm shadow-lg">
                    {t('common.outOfStock')}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col">
              <h3
                dir={isRTL ? 'rtl' : 'ltr'}
                className="text-xl font-black text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover/card:text-[#e28437] transition-colors duration-300"
              >
                {getLocalizedContent('name')}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] overflow-hidden">
                {truncateDescription(
                  getLocalizedContent('description') ||
                    `${t('common.discover')} ${getLocalizedContent('name')} ${t('common.highQuality')}`,
                  viewMode === 'list' ? 8 : 5
                )}
              </p>

              <div className="space-y-2 text-sm mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <PriceDisplay price={product.price} size="sm" variant="card" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <span className={`text-sm font-semibold ${product.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {product.isAvailable ? t('available') : t('unavailable')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {product.isAvailable && (
              <div className="flex-shrink-0 flex flex-col items-end gap-3 w-28">
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-md bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-base font-bold hover:bg-[#e28437] hover:text-white hover:border-[#e28437] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= 99}
                    className="w-8 h-8 rounded-md bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-base font-bold hover:bg-[#e28437] hover:text-white hover:border-[#e28437] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={addToCart}
                  className="relative flex items-center justify-center gap-2 w-full py-2.5 rounded-lg overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-[#e28437]/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e28437] to-[#f5a962]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f5a962] to-[#e28437] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  <ShoppingCart className="relative w-4 h-4 text-white" />
                  <span className="relative text-white font-bold text-sm">{t('addToCart')}</span>
                </button>
              </div>
            )}
          </div>
        </Link>
      </div>
    );
  }

  // ======================= GRID VIEW =======================
  return (
    <div
      className={`group/card relative flex flex-col bg-white rounded-2xl border border-gray-200/50 shadow-sm w-full max-w-xs h-full overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-[#e28437]/30 text-center md:text-start ${
        isRTL ? 'md:text-right' : 'md:text-left'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-br from-[#e28437]/20 to-transparent rounded-2xl opacity-0 group-hover/card:opacity-100 blur-lg transition-opacity duration-500 pointer-events-none" />
      
      <Link
        to={`/product/${createProductSlug(product.id, getLocalizedContent('name'))}`}
        onClick={handleProductClick}
        className="relative flex flex-col h-full"
        aria-label={t('product.view_product_details', { name: getLocalizedContent('name') })}
      >
        <div className="relative">
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 rounded-full blur opacity-50" />
                <div className="relative rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 shadow-lg">
                  <Sparkles className="inline w-3 h-3 mr-1" />
                  -{discountPercent}%
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md z-20 transition-all duration-300 ${
              isInWishlist 
                ? 'text-red-500 bg-red-50/90 shadow-lg shadow-red-500/20 scale-110' 
                : 'text-gray-600 bg-white/90 hover:bg-red-50/90 hover:text-red-500 hover:scale-110'
            }`}
            type="button"
            aria-label={isInWishlist ? t('product_card.remove_from_wishlist') : t('product_card.add_to_wishlist')}
          >
            <Heart className={`w-5 h-5 transition-transform duration-300 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Image Container */}
          <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl">
            <img
              src={buildImageUrl(product.mainImage)}
              alt={getLocalizedContent('name')}
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover/card:scale-110"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = PRODUCT_PLACEHOLDER_SRC;
              }}
            />
            
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/30 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
          </div>

          {/* Out of Stock Overlay */}
          {product.isAvailable === false && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-t-2xl">
              <span className="text-white font-bold bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 rounded-lg text-sm shadow-xl">
                {t('common.outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          <h3
            dir={isRTL ? 'rtl' : 'ltr'}
            className="text-base font-black text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover/card:text-[#e28437] transition-colors duration-300"
          >
            {getLocalizedContent('name')}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] overflow-hidden">
            {truncateDescription(
              getLocalizedContent('description') ||
                `${t('common.discover')} ${getLocalizedContent('name')} ${t('common.highQuality')}`,
              5
            )}
          </p>

          <div className="space-y-2 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <PriceDisplay price={product.price} size="sm" variant="card" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <span className={`text-sm font-semibold ${product.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {product.isAvailable ? t('available') : t('unavailable')}
              </span>
            </div>
          </div>

          {/* Add to Cart Section */}
          {product.isAvailable && (
            <div className="space-y-3 mt-auto flex-shrink-0">
              <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg p-2">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-lg font-bold hover:bg-[#e28437] hover:text-white hover:border-[#e28437] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-lg text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= 99}
                  className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-lg font-bold hover:bg-[#e28437] hover:text-white hover:border-[#e28437] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <button
                onClick={addToCart}
                className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-[#e28437]/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#e28437] to-[#f5a962]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f5a962] to-[#e28437] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                <ShoppingCart className="relative w-5 h-5 text-white" />
                <span className="relative text-white font-bold text-sm">{t('addToCart')}</span>
              </button>
            </div>
          )}
        </div>
      </Link>
      
      {/* Floating accent dot */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#e28437] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 shadow-lg shadow-[#e28437]/50" />
    </div>
  );
};

export default ProductCard;