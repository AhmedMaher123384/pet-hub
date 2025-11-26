import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { smartToast } from '../../utils/toastConfig';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../../config/api';
import { PRODUCT_PLACEHOLDER_SRC } from '../../utils/placeholders';
import CheckoutAuthModal from '../modals/CheckoutAuthModal';
import PriceDisplay from './PriceDisplay';
import { useCurrency } from '../../contexts/CurrencyContext';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  selectedOptions?: Record<string, string>;
  optionsPricing?: Record<string, number>;
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
  addOns?: Array<{ 
    name: string; 
    name_ar?: string; 
    name_en?: string; 
    price: number; 
    description?: string; 
    description_ar?: string; 
    description_en?: string; 
  }>;
  totalPrice?: number;
  basePrice?: number;
  addOnsPrice?: number;
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    mainImage: string;
    detailedImages?: string[];
    isAvailable: boolean;
    productType?: string;
    additionalServices?: Array<{
      name: string;
      price: number;
      description?: string;
    }>;
  };
}

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

const CartDropdown: React.FC<CartDropdownProps> = ({ isOpen, onClose, onHoverChange }) => {
  const { t, i18n } = useTranslation('common');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCheckoutAuthModal, setShowCheckoutAuthModal] = useState(false);
  const navigate = useNavigate();

  // Helper function to get localized content for add-ons
  const getLocalizedAddOnContent = (field: 'name' | 'description', addOn: any) => {
    const currentLang = i18n.language;
    
    if (!addOn) return '';
    
    if (currentLang === 'ar') {
      return addOn[`${field}_ar`] || addOn[`${field}_en`] || addOn[field] || '';
    } else {
      return addOn[`${field}_en`] || addOn[`${field}_ar`] || addOn[field] || '';
    }
  };

  // Load cart from server for logged users, fallback to localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        console.log('🛒 [CartDropdown] Loading cart...');
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const user = JSON.parse(userData);
          console.log('👤 [CartDropdown] User found, fetching cart from server for user:', user.id);
          
          try {
            const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
            console.log('📡 [CartDropdown] Server response:', data);
            
            let cartToLoad = [];
            if (Array.isArray(data) && data.length > 0) {
              cartToLoad = data;
              console.log('✅ [CartDropdown] Using server cart (array format):', cartToLoad.length, 'items');
            } else if (data && data.cart && Array.isArray(data.cart) && data.cart.length > 0) {
              cartToLoad = data.cart;
              console.log('✅ [CartDropdown] Using server cart (object format):', cartToLoad.length, 'items');
            } else {
              console.log('📭 [CartDropdown] Server cart is empty, checking localStorage');
            }
            
            if (cartToLoad.length > 0) {
              setCartItems(cartToLoad);
              // Sync localStorage with server cart
              localStorage.setItem('cart', JSON.stringify(cartToLoad));
              console.log('🔄 [CartDropdown] localStorage synced with server cart');
              return;
            }
          } catch (serverError) {
            console.error('❌ [CartDropdown] Server error, falling back to localStorage:', serverError);
          }
        } else {
          console.log('👤 [CartDropdown] No user found, loading from localStorage');
        }
        
        // Fallback to localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
          console.log('💾 [CartDropdown] Loaded from localStorage:', parsedCart.length, 'items');
        } else {
          console.log('📭 [CartDropdown] No cart found in localStorage');
        }
      } catch (error) {
        console.error('❌ [CartDropdown] Error loading cart:', error);
      }
    };

    // Only load cart when dropdown becomes open for the first time or when cart is empty
    if (isOpen && cartItems.length === 0) {
      loadCart();
    }

    // Listen for cart updates and always reload cart to ensure sync
    const handleCartUpdate = () => {
      console.log('🔄 [CartDropdown] Cart update event received, reloading cart...');
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartCountChanged', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartCountChanged', handleCartUpdate);
    };
  }, [isOpen]);

  // Listen for cart updates continuously (not just when dropdown is open)
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('🔄 [CartDropdown] Cart update event received, reloading cart...');
      const loadCart = async () => {
        try {
          console.log('🛒 [CartDropdown] Loading cart...');
          const userData = localStorage.getItem('user');
          
          if (userData) {
            const user = JSON.parse(userData);
            console.log('👤 [CartDropdown] User found, fetching cart from server for user:', user.id);
            
            try {
              const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
              console.log('📡 [CartDropdown] Server response:', data);
              
              let cartToLoad = [];
              if (Array.isArray(data) && data.length > 0) {
                cartToLoad = data;
                console.log('✅ [CartDropdown] Using server cart (array format):', cartToLoad.length, 'items');
              } else if (data && data.cart && Array.isArray(data.cart) && data.cart.length > 0) {
                cartToLoad = data.cart;
                console.log('✅ [CartDropdown] Using server cart (object format):', cartToLoad.length, 'items');
              } else {
                console.log('📭 [CartDropdown] Server cart is empty, checking localStorage');
              }
              
              if (cartToLoad.length > 0) {
                setCartItems(cartToLoad);
                // Sync localStorage with server cart
                localStorage.setItem('cart', JSON.stringify(cartToLoad));
                console.log('🔄 [CartDropdown] localStorage synced with server cart');
                return;
              }
            } catch (serverError) {
              console.error('❌ [CartDropdown] Server error, falling back to localStorage:', serverError);
            }
          } else {
            console.log('👤 [CartDropdown] No user found, loading from localStorage');
          }
          
          // Fallback to localStorage
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setCartItems(parsedCart);
            console.log('💾 [CartDropdown] Loaded from localStorage:', parsedCart.length, 'items');
          } else {
            console.log('📭 [CartDropdown] No cart found in localStorage');
            setCartItems([]);
          }
        } catch (error) {
          console.error('❌ [CartDropdown] Error loading cart:', error);
        }
      };
      
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartCountChanged', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartCountChanged', handleCartUpdate);
    };
  }, []);

  // Update quantity
  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    try {
      // Check if user is logged in
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.id) {
          console.log('🔄 [CartDropdown] Updating quantity on server for user:', user.id, 'item:', itemId, 'quantity:', newQuantity);
          
          // Update quantity on server
          await apiCall(API_ENDPOINTS.CART_ITEM(user.id, itemId), {
            method: 'PUT',
            body: JSON.stringify({ quantity: newQuantity })
          });
          
          console.log('✅ [CartDropdown] Successfully updated quantity on server');
        }
      }
      
      // Update local state and localStorage
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('cartCountChanged'));
    } catch (error) {
      console.error('❌ [CartDropdown] Error updating quantity:', error);
      
      // Still update locally even if server update fails
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('cartCountChanged'));
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId: number) => {
    try {
      // Check if user is logged in
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.id) {
          console.log('🗑️ [CartDropdown] Removing item from server for user:', user.id, 'item:', itemId);
          
          // Delete from server
          await apiCall(API_ENDPOINTS.CART_ITEM(user.id, itemId), {
            method: 'DELETE'
          });
          
          console.log('✅ [CartDropdown] Successfully removed item from server');
        }
      }
      
      // Update local state and localStorage
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('cartCountChanged'));
      smartToast.frontend.success(t('cart_dropdown.product_removed'));
    } catch (error) {
      console.error('❌ [CartDropdown] Error removing item:', error);
      
      // Still remove locally even if server removal fails
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      window.dispatchEvent(new CustomEvent('cartCountChanged'));
      smartToast.frontend.success(t('cart_dropdown.product_removed'));
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Calculate base price
      const basePrice = item.basePrice || item.product.price;
      
      // Calculate options price
      const optionsPrice = item.optionsPricing ? 
        Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0) : 0;
      
      // Calculate add-ons price
      const addOnsPrice = item.addOnsPrice || 0;
      
      // Use totalPrice if available and greater than 0, otherwise calculate price
      const itemPrice = (item.totalPrice && item.totalPrice > 0) ? 
        item.totalPrice : (basePrice + optionsPrice + addOnsPrice);
      
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      smartToast.frontend.error(t('cart_dropdown.cart_empty_error'));
      return;
    }
    setShowCheckoutAuthModal(true);
  };

  // Handle view cart
  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="relative w-64 xs:w-72 sm:w-96 md:w-80 lg:w-96 border border-[#e28437]/20 rounded-xl shadow-xl z-50 bg-white max-h-[60vh] xs:max-h-[65vh] sm:max-h-[80vh] overflow-hidden"
        style={{
          background: '#ffffff',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.08)'
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          onHoverChange?.(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHoverChange?.(false);
          // Delay popup close to avoid quick disappearance
          setTimeout(() => {
            if (!isHovered) {
              onClose();
            }
          }, 300);
        }}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-[#e28437]/10">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-[#e28437] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#e28437]" />
              <span className="hidden xs:inline">{t('cart_dropdown.shopping_cart')}</span>
              <span className="xs:hidden">{t('cart_dropdown.cart')}</span>
            </h3>
            <span className="text-xs sm:text-sm text-gray-600">
              {cartItems.length} {t('cart_dropdown.product')}
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="max-h-40 xs:max-h-48 sm:max-h-64 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="p-3 xs:p-4 sm:p-6 text-center">
              <Package className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
              <p className="text-gray-600 mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm sm:text-base">{t('cart_dropdown.cart_empty')}</p>
            </div>
          ) : (
            <div className="p-1 xs:p-1 sm:p-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-1 xs:gap-2 sm:gap-3 p-1.5 xs:p-2 sm:p-3 hover:bg-[#e28437]/5 rounded-lg xs:rounded-xl transition-colors">
                  {/* Product Image */}
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-md xs:rounded-lg overflow-hidden bg-[#e28437]/10 flex-shrink-0">
                    <img
                      src={buildImageUrl(item.product.mainImage)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = PRODUCT_PLACEHOLDER_SRC;
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[#e28437] text-xs sm:text-sm font-medium truncate">
                      {item.product.name}
                    </h4>
                    
                    {/* Product Options - Combined Container */}
                    {((item.selectedOptions && Object.keys(item.selectedOptions).length > 0) || 
                      (item.productOptions && Array.isArray(item.productOptions) && item.productOptions.length > 0)) && (
                      <div className="mt-2 p-2 bg-[#e28437]/5 rounded-lg border border-[#e28437]/10">
                        <div className="text-xs text-[#e28437] font-medium mb-2 flex items-center gap-1">
                          <span className="w-2 h-2 bg-[#e28437] rounded-full"></span>
                          {t('product_options')}
                        </div>
                        
                        {/* Selected Options */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="space-y-1 mb-2">
                            {Object.entries(item.selectedOptions).slice(0, 2).map(([key, value]) => (
                              <div key={key} className="text-xs flex justify-between items-center bg-white rounded px-2 py-1 border border-[#e28437]/10">
                                <span className="text-gray-700">{key}:</span>
                                <span className="text-[#e28437] font-medium">{value}</span>
                              </div>
                            ))}
                            {Object.keys(item.selectedOptions).length > 2 && (
                              <div className="text-xs text-gray-500 text-center">+{Object.keys(item.selectedOptions).length - 2} {t('cart_dropdown.other_options')}</div>
                            )}
                          </div>
                        )}
                        
                        {/* Product Options */}
                        {item.productOptions && Array.isArray(item.productOptions) && item.productOptions.length > 0 && (
                          <div className="space-y-1">
                            {item.productOptions.slice(0, 2).map((option, index) => (
                              <div key={index} className="text-xs flex justify-between items-center bg-white rounded px-2 py-1 border border-[#e28437]/10">
                                <span className="text-gray-700">
                                  {option.optionName ? (i18n.language === 'ar' ? option.optionName.ar : option.optionName.en) : option.optionId}:
                                </span>
                                <span className="text-[#e28437] font-medium">
                                  {Array.isArray(option.value) ? option.value.join(', ') : option.value}
                                </span>
                              </div>
                            ))}
                            {item.productOptions.length > 2 && (
                              <div className="text-xs text-gray-500 text-center">+{item.productOptions.length - 2} {t('cart_dropdown.other_options')}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Add-ons - المنتجات الإضافية المختارة */}
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="mt-2 p-2 bg-[#e28437]/5 rounded-lg border border-[#e28437]/10">
                        <div className="text-xs text-[#e28437] font-medium mb-2 flex items-center gap-1">
                          <span className="w-2 h-2 bg-[#e28437] rounded-full"></span>
                          {t('addons')}
                        </div>
                        <div className="space-y-1">
                          {item.addOns.slice(0, 2).map((addon, index) => (
                            <div key={index} className="text-xs flex justify-between items-center bg-white rounded px-2 py-1 border border-[#e28437]/10">
                              <span className="text-gray-700">
                                {getLocalizedAddOnContent('name', addon)}
                              </span>
                              <span className="text-[#e28437] font-medium">
                                +<PriceDisplay price={addon.price} />
                              </span>
                            </div>
                          ))}
                          {item.addOns.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">+{item.addOns.length - 2} {t('cart_dropdown.other_addons')}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Services from product - المنتجات المتاحة للإضافة */}
                    {item.product.additionalServices && item.product.additionalServices.length > 0 && (
                      <div className="mt-2 p-2 bg-[#e28437]/10 rounded-lg border border-[#e28437]/20">
                        <div className="text-xs text-[#e28437] font-medium mb-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#e28437] rounded-full"></span>
                          {t('cart_dropdown.available_to_add')}:
                        </div>
                        <div className="space-y-1">
                          {item.product.additionalServices.slice(0, 2).map((service, index) => (
                            <div key={index} className="text-xs text-gray-700 flex justify-between items-center bg-white rounded px-2 py-1 border border-[#e28437]/10">
                              <span className="flex items-center gap-1">
                                <span className="text-[#e28437] text-xs">+</span>
                                {service.name}
                              </span>
                              <span className="text-[#e28437] font-medium"><PriceDisplay price={service.price} /></span>
                            </div>
                          ))}
                        </div>
                        {item.product.additionalServices.length > 2 && (
                          <div className="text-xs text-[#e28437]/70 mt-1 text-center">+{item.product.additionalServices.length - 2} {t('cart_dropdown.other_products')}</div>
                        )}
                      </div>
                    )}
                    
                    {/* Price Breakdown */}
                    <div className="mt-3 p-3 bg-white rounded-lg border border-[#e28437]/10">
                      <div className="text-xs text-[#e28437] font-medium mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#e28437] rounded-full"></span>
                        {t('price_breakdown')}
                      </div>
                      <div className="space-y-1.5">
                        {/* Base Price */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-700">{t('base_price')}</span>
                          <span className="text-[#e28437] font-medium">
                            <PriceDisplay price={(item.basePrice || item.product.price) * item.quantity} />
                          </span>
                        </div>
                        
                        {/* Options Price */}
                        {(() => {
                          // Calculate options price from both optionsPricing and productOptionsPriceModifier
                          let optionsPrice = 0;
                          
                          // Add from optionsPricing if available
                          if (item.optionsPricing) {
                            optionsPrice += Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0);
                          }
                          
                          // Add from productOptionsPriceModifier if available
                          if (item.productOptionsPriceModifier) {
                            optionsPrice += item.productOptionsPriceModifier;
                          }
                          
                          // Multiply by quantity
                          optionsPrice *= item.quantity;
                          
                          return optionsPrice > 0 ? (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-700">{t('product_options')}</span>
                              <span className="text-[#e28437] font-medium">
                                +<PriceDisplay price={optionsPrice} />
                              </span>
                            </div>
                          ) : null;
                        })()}
                        
                        {/* Add-ons Price */}
                        {item.addOnsPrice && item.addOnsPrice > 0 && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-700">{t('addons')}</span>
                            <span className="text-[#e28437] font-medium">
                              +<PriceDisplay price={item.addOnsPrice * item.quantity} />
                            </span>
                          </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-[#e28437]/10 my-1"></div>

                        {/* Total */}
                        <div className="flex justify-between items-center text-sm font-semibold">
                          <span className="text-[#e28437]">{t('total')}</span>
                          <span className="text-[#e28437]">
                            <PriceDisplay price={(() => {
                              const basePrice = (item.basePrice || item.product.price) * item.quantity;
                              
                              // Calculate options price from both sources
                              let optionsPrice = 0;
                              if (item.optionsPricing) {
                                optionsPrice += Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0);
                              }
                              if (item.productOptionsPriceModifier) {
                                optionsPrice += item.productOptionsPriceModifier;
                              }
                              optionsPrice *= item.quantity;
                              
                              const addOnsPrice = (item.addOnsPrice || 0) * item.quantity;
                              return basePrice + optionsPrice + addOnsPrice;
                            })()} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-0.5 xs:gap-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded bg-white border border-[#e28437]/20 hover:bg-[#e28437]/5 flex items-center justify-center text-[#e28437] transition-colors"
                    >
                      <Minus className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
                    </button>
                    <span className="w-5 xs:w-6 sm:w-8 text-center text-gray-700 text-xs sm:text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded bg-white border border-[#e28437]/20 hover:bg-[#e28437]/5 flex items-center justify-center text-[#e28437] transition-colors"
                    >
                      <Plus className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded bg-white border border-[#e28437]/20 hover:bg-[#e28437]/5 flex items-center justify-center text-[#e28437] transition-colors"
                  >
                    <Trash2 className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-2 xs:p-3 sm:p-4 border-t border-[#e28437]/10 bg-white">
            {/* Total */}
            <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
              <span className="text-[#e28437] font-medium text-sm sm:text-base">{t('cart_dropdown.total')}:</span>
              <span className="text-[#e28437] font-bold text-base sm:text-lg">
                <PriceDisplay price={calculateTotal()} />
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 xs:gap-2">
              <button
                onClick={handleViewCart}
                className="flex-1 bg-white border border-[#e28437]/20 hover:bg-[#e28437]/5 text-[#e28437] py-2 px-2 sm:px-4 rounded-xl transition-colors text-xs sm:text-sm font-medium"
              >
                <span className="hidden sm:inline">{t('cart_dropdown.view_cart')}</span>
              <span className="sm:hidden">{t('cart_dropdown.cart')}</span>
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-[#e28437] hover:bg-[#e28437]/90 text-white py-2 px-2 sm:px-4 rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2"
              >
                <span className="hidden sm:inline">{t('cart_dropdown.checkout')}</span>
              <span className="sm:hidden">{t('cart_dropdown.buy')}</span>
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Checkout Auth Modal */}
      {showCheckoutAuthModal && (
        <CheckoutAuthModal
          isOpen={showCheckoutAuthModal}
          onClose={() => setShowCheckoutAuthModal(false)}
          onContinueAsGuest={() => {
            setShowCheckoutAuthModal(false);
            onClose();
            navigate('/checkout');
          }}
          onLoginSuccess={() => {
            setShowCheckoutAuthModal(false);
            onClose();
            navigate('/checkout');
          }}
        />
      )}
    </>
  );
};

export default CartDropdown;