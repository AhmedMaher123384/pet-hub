import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ShoppingCart, Heart, User, ChevronDown } from 'lucide-react';
import logo from '../../assets/logo.png';
import AuthModal from '../modals/AuthModal';
import CartDropdown from '../ui/CartDropdown';
import LiveSearch from '../ui/LiveSearch';
import LanguageCurrencySelector from '../ui/LanguageCurrencySelector';
import CategoryCollectionBar from './CategoryCollectionBar';

function Navbar() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir(i18n.language) === 'rtl';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState(0);
  const [user] = useState<any>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);

  const cartDropdownRef = useRef<HTMLDivElement>(null);

  // Load counts from localStorage and keep them in sync with events
  useEffect(() => {
    const calculateCartCount = () => {
      try {
        const localCart = localStorage.getItem('cart');
        if (!localCart) {
          setCartItemsCount(0);
          return;
        }
        const cartItems = JSON.parse(localCart);
        if (Array.isArray(cartItems)) {
          const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
          setCartItemsCount(totalItems);
        } else {
          setCartItemsCount(0);
        }
      } catch (error) {
        setCartItemsCount(0);
      }
    };

    const calculateWishlistCount = () => {
      try {
        const savedWishlist = localStorage.getItem('wishlist');
        if (!savedWishlist) {
          setWishlistItemsCount(0);
          return;
        }
        const ids = JSON.parse(savedWishlist);
        setWishlistItemsCount(Array.isArray(ids) ? ids.length : 0);
      } catch (error) {
        setWishlistItemsCount(0);
      }
    };

    // initial load
    calculateCartCount();
    calculateWishlistCount();

    // listeners
    const onCartUpdated = () => calculateCartCount();
    const onCartCleared = () => calculateCartCount();
    const onWishlistUpdated = () => calculateWishlistCount();
    const onWishlistCleared = () => calculateWishlistCount();

    window.addEventListener('cartUpdated', onCartUpdated as any);
    window.addEventListener('cartCleared', onCartCleared as any);
    window.addEventListener('wishlistUpdated', onWishlistUpdated as any);
    window.addEventListener('wishlistCleared', onWishlistCleared as any);

    return () => {
      window.removeEventListener('cartUpdated', onCartUpdated as any);
      window.removeEventListener('cartCleared', onCartCleared as any);
      window.removeEventListener('wishlistUpdated', onWishlistUpdated as any);
      window.removeEventListener('wishlistCleared', onWishlistCleared as any);
    };
  }, []);

  // Smooth Scroll Hide/Show - No Shaking
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // إذا في الأول خالص: اظهر
      if (currentScrollY < 80) {
        setShowNavbar(true);
      } 
      // لو سكرولت لتحت: اخفي
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
      } 
      // لو سكرولت لفوق: اظهر
      else if (currentScrollY < lastScrollY) {
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Click outside cart
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(e.target as Node)) {
        setTimeout(() => !isCartHovered && setIsCartDropdownOpen(false), 200);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isCartHovered]);

  const openAuthModal = () => {
    setIsMenuOpen(false);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      {/* Navbar - Smooth Transitions */}
      <nav
        className={`
          sticky top-0 z-50 bg-white transition-transform duration-300 ease-in-out
          ${showNavbar ? 'translate-y-0' : '-translate-y-full'}
        `}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <style>{`
          /* Force Categories to Spread & Enlarge */
          nav [data-variant="navbar"] {
            display: flex !important;
            justify-content: space-between !important;
            width: 100% !important;
            gap: 2rem !important;
          }
          nav [data-variant="navbar"] > * {
            font-size: 1.25rem !important; /* larger */
            font-weight: 500 !important;
            white-space: nowrap !important;
          }
        `}</style>
        {/* Top White Bar - Compact & Tight */}
        <div className="bg-white shadow-sm pb-3">
          <div className="flex items-center justify-between h-20 lg:h-24 px-4 lg:px-12 max-w-[1400px] mx-auto">
            {/* Logo */}
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <img src={logo} alt="7Pets" className="h-16 lg:h-20 w-auto" />
            </Link>

            {/* Desktop Search */}
            <div className="hidden lg:block flex-1 max-w-2xl mx-6">
              <div className="relative">
                <LiveSearch triggerVariant="bar" barStyle="light" />
                <button className="absolute left-0 top-0 h-full px-4 bg-[#2e8b57] hover:bg-[#236143] rounded-l-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop Icons - Compact */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageCurrencySelector />

              <Link to="/wishlist" className="relative group" data-wishlist-count>
                <div className="p-3 rounded-full hover:bg-gray-100 transition">
                  <Heart className="w-6 h-6 text-[#e28437]" />
                  {wishlistItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#2e8b57] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistItemsCount}
                    </span>
                  )}
                </div>
              </Link>

              <div className="relative" ref={cartDropdownRef} data-cart-count>
                <button
                  onMouseEnter={() => setIsCartHovered(true)}
                  onMouseLeave={() => setIsCartHovered(false)}
                  onClick={() => setIsCartDropdownOpen(v => !v)}
                  className="p-3 rounded-full hover:bg-gray-100 transition relative group"
                >
                  <ShoppingCart className="w-6 h-6 text-[#e28437]" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#2e8b57] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </button>

                {isCartDropdownOpen && (
                  <div className={`absolute top-full mt-3 z-50 ${isRTL ? 'left-0 translate-x-2' : 'right-0'}`}>
                    <CartDropdown
                      isOpen={isCartDropdownOpen}
                      onClose={() => setIsCartDropdownOpen(false)}
                      onHoverChange={setIsCartHovered}
                    />
                  </div>
                )}
              </div>

              {user ? (
                <button className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-4 py-2 transition">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#e28437]" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              ) : (
                <button onClick={openAuthModal} className="p-3 rounded-full hover:bg-gray-100 transition">
                  <User className="w-6 h-6 text-[#e28437]" />
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2">
              <Menu className="w-8 h-8 text-gray-800" />
            </button>
          </div>
        </div>

        {/* Orange Category Bar - Full Spread & Larger Font */}
        <div className="hidden lg:block px-4">
          <div className="max-w-[1400px] mx-auto px-12">
            <div className="bg-[#e28437] rounded-full shadow-lg px-8 py-3.5">
              <div 
                className="flex items-center justify-between text-white"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '500',
                  width: '100%'
                }}
              >
                <div className="w-full" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: '2rem'
                }}>
                  <CategoryCollectionBar variant="navbar" tone="dark" showCollections={true} includeProductsLink={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
          <div
            className="absolute top-0 left-0 right-0 bg-white rounded-b-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-5 pb-6 bg-gradient-to-b from-orange-50 to-white">
              <div className="flex items-center justify-between mb-6">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <img src={logo} alt="7Pets" className="h-9 w-auto" />
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2">
                  <X className="w-7 h-7 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 shadow hover:shadow-md transition-all border border-gray-100"
                >
                  <Heart className="w-9 h-9 text-[#e28437]" />
                  <span className="text-sm font-medium text-gray-700">المفضلة</span>
                </Link>

                <button
                  onClick={openAuthModal}
                  className="bg-[#e28437] hover:bg-[#d1752c] text-white rounded-xl p-4 flex flex-col items-center gap-2 shadow-md transition-all"
                >
                  <User className="w-9 h-9" />
                  <span className="text-sm font-medium">
                    {user ? 'حسابي' : 'تسجيل الدخول'}
                  </span>
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 pb-10">
              <div className="space-y-8 pt-2">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                    الأقسام
                  </h3>
                  <CategoryCollectionBar variant="navbar" tone="light" showCollections={true} includeProductsLink={true} />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                    روابط سريعة
                  </h3>
                  <div className="space-y-1">
                    {['الرئيسية', 'المنتجات', 'سياسة الخصوصية', 'الشروط والأحكام', 'سياسة الإرجاع'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full text-right py-3.5 border-b border-gray-100 text-gray-700 hover:text-[#e28437] font-medium transition"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <LanguageCurrencySelector />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

export default Navbar;