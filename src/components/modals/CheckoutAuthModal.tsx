import React, { useState } from 'react';
import { X, User, UserPlus, ArrowLeft, ShoppingCart, Shield, Clock, Star } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { apiCall, API_ENDPOINTS } from "../../config/api";
import { useTranslation } from 'react-i18next';

interface CheckoutAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
  onLoginSuccess: (user: any) => void;
}

interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const CheckoutAuthModal: React.FC<CheckoutAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onContinueAsGuest, 
  onLoginSuccess 
}) => {
  const { t } = useTranslation('common');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return t('auth.validation.emailRequired');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t('auth.validation.emailInvalid');
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return t('auth.validation.passwordRequired');
    if (password.length < 6) return t('auth.validation.passwordMinLength');
    return '';
  };

  const validateName = (name: string, fieldName: string) => {
    if (!name) return t('auth.validation.nameRequired', { field: fieldName });
    if (name.length < 2) return t('auth.validation.nameMinLength', { field: fieldName });
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return t('auth.validation.phoneRequired');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) return t('auth.validation.phoneLength');
    if (!cleanPhone.startsWith('5')) return t('auth.validation.phoneFormat');
    return '';
  };

  // Handle login
  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};
    newErrors.email = validateEmail(userData.email);
    newErrors.password = validatePassword(userData.password);
    
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    
    try {
      console.log('🔐 [CheckoutAuthModal] Attempting login');
      
      const response = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });
      
      console.log('✅ [CheckoutAuthModal] Login successful:', response);
      
      if (response.user) {
        onLoginSuccess(response.user);
        smartToast.frontend.success(t('auth.messages.loginSuccess'));
      }
      
    } catch (error: any) {
      console.error('❌ [CheckoutAuthModal] Login error:', error);
      
      let errorMessage = t('auth.messages.loginFailed');
      
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          errorMessage = t('auth.messages.emailNotRegistered');
        } else if (status === 401) {
          errorMessage = t('auth.messages.incorrectPassword');
        }
      }
      
      setErrors({ general: errorMessage });
      smartToast.frontend.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};
    newErrors.email = validateEmail(userData.email);
    newErrors.password = validatePassword(userData.password);
    newErrors.firstName = validateName(userData.firstName, t('auth.fields.firstName'));
    newErrors.lastName = validateName(userData.lastName, t('auth.fields.lastName'));
    newErrors.phone = validatePhone(userData.phone);
    
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    
    try {
      console.log('📝 [CheckoutAuthModal] Attempting registration');
      
      const response = await apiCall(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone
        })
      });
      
      console.log('✅ [CheckoutAuthModal] Registration successful:', response);
      
      if (response.user) {
        onLoginSuccess(response.user);
        smartToast.frontend.success(t('auth.messages.registerSuccess'));
      }
      
    } catch (error: any) {
      console.error('❌ [CheckoutAuthModal] Registration error:', error);
      
      let errorMessage = t('auth.messages.registerFailed');
      
      if (error.response?.status === 409) {
        errorMessage = t('auth.messages.emailAlreadyExists');
      }
      
      setErrors({ general: errorMessage });
      smartToast.frontend.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset to main view
  const resetToMain = () => {
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setUserData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: ''
    });
    setErrors({});
  };

  // Format phone number
  const formatSaudiPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return cleaned;
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto border border-[#e28437]/20 my-auto" style={{
        maxHeight: '90vh',
        minHeight: 'auto',
        transform: 'translateY(0)',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div className="p-4 border-b border-[#e28437]/10 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <ShoppingCart className="w-5 h-5 text-[#e28437]" />
              <h2 className="text-lg font-bold text-[#e28437]">{t('checkout.completeOrder')}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#e28437]/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 hover:text-[#e28437]" />
            </button>
          </div>
        </div>

        {/* Main Choice View */}
        {!showLoginForm && !showRegisterForm && (
          <div className="p-4 bg-white">
            <div className="text-center mb-4">
              <h3 className="text-base font-semibold text-[#e28437] mb-1">
                {t('checkout.chooseMethod')}
              </h3>
              <p className="text-gray-700 text-xs">
                {t('checkout.methodDescription')}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Continue as Guest */}
              <button
                onClick={onContinueAsGuest}
                className="w-full p-3 border border-[#e28437]/40 hover:border-[#e28437] rounded-lg bg-white hover:bg-[#e28437]/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-8 h-8 bg-[#e28437]/15 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-[#e28437]" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-[#e28437] text-sm">{t('checkout.continueAsGuest')}</h4>
                <p className="text-xs text-gray-700">{t('checkout.quickMethod')}</p>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-[#e28437] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Login Option */}
              <button
                onClick={() => setShowLoginForm(true)}
                className="w-full p-3 border border-[#e28437]/20 hover:border-[#e28437] rounded-lg bg-white hover:bg-[#e28437]/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-8 h-8 bg-[#e28437]/15 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#e28437]" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-[#e28437] text-sm">{t('auth.login')}</h4>
                <p className="text-xs text-gray-700">{t('checkout.existingAccount')}</p>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-[#e28437] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Register Option */}
              <button
                onClick={() => setShowRegisterForm(true)}
                className="w-full p-3 border border-[#e28437]/40 hover:border-[#e28437] rounded-lg bg-white hover:bg-[#e28437]/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-8 h-8 bg-[#e28437]/15 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-[#e28437]" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-[#e28437] text-sm">{t('auth.newAccount')}</h4>
                <p className="text-xs text-gray-700">{t('checkout.additionalFeatures')}</p>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-[#e28437] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-[#e28437]/10">
              <h5 className="font-semibold text-[#e28437] mb-2 text-xs">{t('checkout.accountFeatures')}:</h5>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 space-x-reverse text-xs text-gray-700">
                  <Clock className="w-3 h-3 text-[#e28437]" />
                  <span>{t('checkout.orderTracking')}</span>
                </div>
                <div className="flex items-center space-x-1.5 space-x-reverse text-xs text-gray-700">
                  <Star className="w-3 h-3 text-[#e28437]" />
                  <span>{t('checkout.favoriteProducts')}</span>
                </div>
                <div className="flex items-center space-x-1.5 space-x-reverse text-xs text-gray-700">
                  <Shield className="w-3 h-3 text-[#e28437]" />
                  <span>{t('checkout.saveAddresses')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        {showLoginForm && (
          <div className="p-4 bg-white">
            <button
              onClick={resetToMain}
              className="flex items-center space-x-1 space-x-reverse text-gray-600 hover:text-[#e28437] mb-3"
            >
              <ArrowLeft className="w-3 h-3 rotate-180" />
              <span className="text-xs">{t('common.back')}</span>
            </button>
            <h3 className="text-base font-semibold text-[#e28437] mb-3">{t('auth.login')}</h3>

            {errors.general && (
              <div className="mb-3 p-2 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-xs">
                {errors.general}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('auth.fields.email')}
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border text-gray-900 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-sm ${
                    errors.email ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder={t('auth.placeholders.enterEmail')}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('auth.fields.password')}
                </label>
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border text-gray-900 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-sm ${
                    errors.password ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder={t('auth.placeholders.enterPassword')}
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#e28437] hover:bg-[#e28437]/90 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
              >
                {loading ? t('auth.messages.loggingIn') : t('auth.login')}
              </button>
            </div>
          </div>
        )}

        {/* Register Form */}
        {showRegisterForm && (
          <div className="p-4 bg-white">
            <button
              onClick={resetToMain}
              className="flex items-center space-x-1 space-x-reverse text-gray-600 hover:text-[#e28437] mb-3"
            >
              <ArrowLeft className="w-3 h-3 rotate-180" />
              <span className="text-xs">{t('common.back')}</span>
            </button>

            <h3 className="text-base font-semibold text-[#e28437] mb-3">{t('auth.createNewAccount')}</h3>

            {errors.general && (
              <div className="mb-3 p-2 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-xs">
                {errors.general}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('auth.fields.firstName')}
                  </label>
                  <input
                    type="text"
                    value={userData.firstName}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    className={`w-full px-2 py-2 bg-white border text-gray-900 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-sm ${
                      errors.firstName ? 'border-red-600' : 'border-gray-300'
                    }`}
                    placeholder={t('auth.placeholders.firstNameExample')}
                  />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('auth.fields.lastName')}
                  </label>
                  <input
                    type="text"
                    value={userData.lastName}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    className={`w-full px-2 py-2 bg-white border text-gray-900 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-sm ${
                      errors.lastName ? 'border-red-600' : 'border-gray-300'
                    }`}
                    placeholder={t('auth.placeholders.lastNameExample')}
                  />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('auth.fields.email')}
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border text-gray-900 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-sm ${
                    errors.email ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('auth.fields.phone')}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-2 rounded-r-lg border border-l-0 border-gray-300 bg-white text-gray-700 text-xs">
                    +966
                  </span>
                  <input
                    type="tel"
                    value={formatSaudiPhone(userData.phone)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 9) {
                        setUserData({ ...userData, phone: value });
                      }
                    }}
                    className={`flex-1 px-2 py-2 bg-white border text-gray-900 rounded-l-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-sm ${
                      errors.phone ? 'border-red-600' : 'border-gray-300'
                    }`}
                    placeholder="5XX XXX XXX"
                    dir="ltr"
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('auth.fields.password')}
                </label>
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border text-gray-900 rounded-lg focus:ring-2 focus:ring-[#e28437] focus:border-[#e28437] text-sm ${
                    errors.password ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder={t('auth.placeholders.strongPassword')}
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-[#e28437] hover:bg-[#e28437]/90 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
              >
                {loading ? t('auth.messages.creatingAccount') : t('auth.createAccount')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutAuthModal;