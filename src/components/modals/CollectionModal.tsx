import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, Package, Filter, Eye, Tag, Calendar, DollarSign, Star, Clock, CheckCircle } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { apiCall, API_ENDPOINTS, buildApiUrl, buildImageUrl } from '../../config/api';

interface Collection {
  _id?: string;
  id?: number;
  name: {
    ar: string;
    en: string;
  };
  type: 'manual' | 'automated';
  products?: string[];
  productFilters?: {
    showLatest?: boolean;
    showDiscounted?: boolean;
    showFeatured?: boolean;
    showAvailable?: boolean;
    categoryFilter?: number;
    priceRange?: {
      min?: number;
      max?: number;
    };
  };
  conditions?: {
    categories?: number[];
    tags?: string[];
    priceRange?: {
      min?: number;
      max?: number;
    };
    hasDiscount?: boolean;
    discountPercentage?: {
      min?: number;
      max?: number;
    };
    productTypes?: string[];
    isAvailable?: boolean;
    featured?: boolean;
    createdAfter?: string;
    createdBefore?: string;
  };
  isActive: boolean;
  featured: boolean;
  sortOrder: string;
  maxProducts?: number;
  image?: string;
  displayOrder?: number;
}

interface Product {
  _id: string;
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  mainImage: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
}

interface Category {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
}

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  collection?: Collection | null;
}

const CollectionModal: React.FC<CollectionModalProps> = ({ isOpen, onClose, onSuccess, collection }) => {
  const [formData, setFormData] = useState<Collection>({
    name: { ar: '', en: '' },
    type: 'manual',
    products: [],
    productFilters: {
      showLatest: false,
      showDiscounted: false,
      showFeatured: false,
      showAvailable: false,
      categoryFilter: undefined,
      priceRange: {},
    },
    isActive: true,
    featured: false,
    sortOrder: 'created_desc',
    maxProducts: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterResults, setFilterResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchCategories();
      if (collection) {
        setFormData({
          ...collection,
          type: 'manual',
          products: collection.products || [],
        });
        // إصلاح مشكلة عدم ظهور المنتجات المحددة مسبقاً
        setSelectedProducts(collection.products || []);
      } else {
        resetForm();
      }
    }
  }, [isOpen, collection]);

  const resetForm = () => {
    setFormData({
      name: { ar: '', en: '' },
      type: 'manual',
      products: [],
      productFilters: {
        showLatest: false,
        showDiscounted: false,
        showFeatured: false,
        showAvailable: false,
        categoryFilter: undefined,
        priceRange: {},
      },
      isActive: true,
      featured: false,
      sortOrder: 'created_desc',
      maxProducts: undefined,
    });
    setSelectedProducts([]);
    setProductSearch('');
    setFilterResults([]);
    setShowFilters(false);
  };

  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching products...');
      console.log('🔗 API Endpoint:', API_ENDPOINTS.PRODUCTS);
      const response = await apiCall(API_ENDPOINTS.PRODUCTS);
      console.log('📦 Full response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response keys:', Object.keys(response || {}));
      
      if (response.data) {
        console.log('📦 Response.data:', response.data);
        console.log('📦 Response.data type:', typeof response.data);
        console.log('📦 Response.data keys:', Object.keys(response.data || {}));
        
        if (response.data.data) {
          console.log('📦 Response.data.data:', response.data.data);
          console.log('📦 Response.data.data type:', typeof response.data.data);
          console.log('📦 Response.data.data is array:', Array.isArray(response.data.data));
        }
      }
      
      // Handle different response structures
      let productsData = [];
      if (response.products) {
        // Response has products array directly
        productsData = Array.isArray(response.products) ? response.products : [];
        console.log('✅ Using response.products structure');
      } else if (response.data?.data) {
        // Response has nested data structure
        productsData = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('✅ Using nested data structure');
      } else if (response.data) {
        // Response has direct data
        productsData = Array.isArray(response.data) ? response.data : [];
        console.log('✅ Using direct data structure');
      } else if (Array.isArray(response)) {
        // Response is direct array
        productsData = response;
        console.log('✅ Using direct array structure');
      }
      
      console.log('✅ Final products data:', productsData);
      console.log('📊 Final products count:', productsData.length);
      setProducts(productsData);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories...');
      console.log('🔗 Categories API Endpoint:', API_ENDPOINTS.CATEGORIES);
      const response = await apiCall(API_ENDPOINTS.CATEGORIES);
      console.log('📦 Categories response:', response);
      console.log('📦 Categories response type:', typeof response);
      console.log('📦 Categories response keys:', Object.keys(response || {}));
      
      // API returns categories directly as an array
      const categoriesData = Array.isArray(response) ? response : response.data || response.data?.data || [];
      console.log('✅ Categories data to set:', categoriesData);
      console.log('🔍 First category sample:', categoriesData[0]);
      console.log('🔍 Category fields check:', categoriesData[0] ? Object.keys(categoriesData[0]) : 'No categories');
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      console.log('📊 Final categories count:', categoriesData.length);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchFilteredProducts = async () => {
    if (!formData.productFilters) return;
    
    setFiltersLoading(true);
    try {
      console.log('🔍 Fetching filtered products with filters:', formData.productFilters);
      const response = await apiCall(`${API_ENDPOINTS.COLLECTIONS}/filtered-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productFilters: formData.productFilters
        })
      });
      
      console.log('📦 Filtered products response:', response);
      
      if (response.success && response.products) {
        setFilterResults(response.products);
        console.log('✅ Set filtered products:', response.products.length);
      } else {
        setFilterResults([]);
      }
    } catch (error) {
      console.error('❌ Error fetching filtered products:', error);
      setFilterResults([]);
    } finally {
      setFiltersLoading(false);
    }
  };

  // دالة جديدة لتطبيق الفلتر على المنتجات المختارة
  const applyFilterToSelection = () => {
    if (filterResults.length > 0) {
      const filteredProductIds = filterResults.map(product => product._id);
      setSelectedProducts(prev => {
        // إضافة المنتجات المفلترة للمنتجات المختارة (بدون تكرار)
        const newSelection = [...new Set([...prev, ...filteredProductIds])];
        return newSelection;
      });
      smartToast.dashboard.success(`تم إضافة ${filterResults.length} منتج من الفلتر إلى المجموعة`);
    } else {
      smartToast.dashboard.warning('لا توجد منتجات في نتائج الفلتر لإضافتها');
    }
  };

  const handleInputChange = (field: string, value: any, lang?: string) => {
    setFormData(prev => {
      if (lang) {
        return {
          ...prev,
          [field]: {
            ...(prev[field as keyof Collection] as any),
            [lang]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleFilterChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      productFilters: {
        ...prev.productFilters,
        [field]: value
      }
    }));
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // تعديل الفاليديشن ليقبل الاسم بالعربي أو الإنجليزي وليس الاثنين معاً
    if (!formData.name.ar.trim() && !formData.name.en.trim()) {
      smartToast.dashboard.error('يرجى إدخال اسم المجموعة بالعربية أو الإنجليزية على الأقل');
      return;
    }

    // Check if there are either selected products or filters
    const hasSelectedProducts = selectedProducts.length > 0;
    const hasFilters = formData.productFilters && (
      formData.productFilters.showLatest ||
      formData.productFilters.showDiscounted ||
      formData.productFilters.showFeatured ||
      formData.productFilters.showAvailable ||
      formData.productFilters.categoryFilter ||
      (formData.productFilters.priceRange && (
        formData.productFilters.priceRange.min !== undefined ||
        formData.productFilters.priceRange.max !== undefined
      ))
    );
    
    if (!hasSelectedProducts && !hasFilters) {
      smartToast.dashboard.error('يرجى اختيار منتجات أو تطبيق فلاتر للمجموعة');
      return;
    }

    try {
      setLoading(true);
      
      const submitData: any = {
        name: formData.name,
        type: formData.type,
        isActive: formData.isActive,
        featured: formData.featured,
        sortOrder: formData.sortOrder,
        products: selectedProducts,
      };
      
      if (formData.maxProducts) {
        submitData.maxProducts = formData.maxProducts;
      }

      if (formData.productFilters) {
        submitData.productFilters = formData.productFilters;
      }

      console.log('📤 Final submitData being sent to API:', JSON.stringify(submitData, null, 2));

      const endpoint = collection 
        ? API_ENDPOINTS.COLLECTION_BY_ID(collection._id!) 
        : API_ENDPOINTS.COLLECTIONS;
      const method = collection ? 'PUT' : 'POST';

      const response = await apiCall(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      console.log('📥 API Response received:', response);
      console.log('📊 Response data:', response.data);
      console.log('🔢 Response productsCount:', response.data?.productsCount);

      if (response.success) {
        smartToast.dashboard.success(collection ? 'تم تحديث المجموعة بنجاح!' : 'تم إنشاء المجموعة بنجاح!');
        console.log('🎯 About to call onSuccess callback...');
        try {
          onSuccess();
          console.log('✅ onSuccess callback called successfully');
        } catch (error) {
          console.error('❌ Error in onSuccess callback:', error);
        }
        onClose();
      } else {
        smartToast.dashboard.error(response.message || 'حدث خطأ أثناء حفظ المجموعة');
      }
    } catch (error) {
      console.error('Error saving collection:', error);
      smartToast.dashboard.error('حدث خطأ أثناء حفظ المجموعة');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name_ar.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.name_en.toLowerCase().includes(productSearch.toLowerCase())
  );

  console.log('🔍 All products:', products);
  console.log('🔍 Filtered products:', filteredProducts);
  console.log('🔍 Product search:', productSearch);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white border-2 border-gray-200 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Black Header */}
        <div className="bg-black text-white p-8 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              {collection ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-600 transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Collection Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  اسم المجموعة (عربي) *
                </label>
                <input
                  type="text"
                  value={formData.name.ar}
                  onChange={(e) => handleInputChange('name', e.target.value, 'ar')}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 transition-all"
                  placeholder="أدخل اسم المجموعة بالعربية"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  اسم المجموعة (إنجليزي) *
                </label>
                <input
                  type="text"
                  value={formData.name.en}
                  onChange={(e) => handleInputChange('name', e.target.value, 'en')}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500 transition-all"
                  placeholder="Enter collection name in English"
                  required
                />
              </div>
            </div>

            {/* Collection Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ترتيب العرض
                </label>
                <select
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-black"
                >
                  <option value="created_desc">الأحدث أولاً</option>
                  <option value="created_asc">الأقدم أولاً</option>
                  <option value="price_asc">السعر من الأقل للأعلى</option>
                  <option value="price_desc">السعر من الأعلى للأقل</option>
                  <option value="name_asc">الاسم أ-ي</option>
                  <option value="name_desc">الاسم ي-أ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  الحد الأقصى للمنتجات
                </label>
                <input
                  type="number"
                  value={formData.maxProducts || ''}
                  onChange={(e) => handleInputChange('maxProducts', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500"
                  placeholder="غير محدود"
                  min="1"
                />
              </div>
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-5 h-5 text-black bg-white border-2 border-gray-300 rounded focus:ring-black focus:ring-2"
                  />
                  <span className="text-gray-700 font-medium">مجموعة نشطة</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-5 h-5 text-black bg-white border-2 border-gray-300 rounded focus:ring-black focus:ring-2"
                  />
                  <span className="text-gray-700 font-medium">مجموعة مميزة</span>
                </label>
              </div>
            </div>

            {/* Product Selection */}
            <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-black">
                <div className="p-2 bg-black rounded-lg">
                  <Search className="w-5 h-5 text-white" />
                </div>
                اختيار المنتجات
              </h3>

              {/* Product Filters */}
              <div className="mb-6 border-2 border-gray-300 rounded-xl p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    فلاتر المنتجات
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-black hover:text-gray-700 text-sm font-medium transition-colors border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-100"
                  >
                    {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
                  </button>
                </div>

                {showFilters && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.productFilters?.showLatest || false}
                          onChange={(e) => handleFilterChange('showLatest', e.target.checked)}
                          className="w-4 h-4 text-black bg-white border-2 border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-gray-700 text-sm">الأحدث</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.productFilters?.showDiscounted || false}
                          onChange={(e) => handleFilterChange('showDiscounted', e.target.checked)}
                          className="w-4 h-4 text-black bg-white border-2 border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-gray-700 text-sm">المخفضة</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.productFilters?.showFeatured || false}
                          onChange={(e) => handleFilterChange('showFeatured', e.target.checked)}
                          className="w-4 h-4 text-black bg-white border-2 border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-gray-700 text-sm">المميزة</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.productFilters?.showAvailable || false}
                          onChange={(e) => handleFilterChange('showAvailable', e.target.checked)}
                          className="w-4 h-4 text-black bg-white border-2 border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-gray-700 text-sm">المتوفرة</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          فئة محددة
                        </label>
                        <select
                          value={formData.productFilters?.categoryFilter || ''}
                          onChange={(e) => handleFilterChange('categoryFilter', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                        >
                          <option value="" className="text-black">جميع الفئات</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id} className="text-black font-medium">
                              {category.name_ar}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الحد الأدنى للسعر
                        </label>
                        <input
                          type="number"
                          value={formData.productFilters?.priceRange?.min || ''}
                          onChange={(e) => handleFilterChange('priceRange', {
                            ...formData.productFilters?.priceRange,
                            min: e.target.value ? parseFloat(e.target.value) : undefined
                          })}
                          className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الحد الأقصى للسعر
                        </label>
                        <input
                          type="number"
                          value={formData.productFilters?.priceRange?.max || ''}
                          onChange={(e) => handleFilterChange('priceRange', {
                            ...formData.productFilters?.priceRange,
                            max: e.target.value ? parseFloat(e.target.value) : undefined
                          })}
                          className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                          placeholder="غير محدود"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={fetchFilteredProducts}
                        disabled={filtersLoading}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
                      >
                        {filtersLoading ? 'جاري التطبيق...' : 'تطبيق الفلاتر'}
                      </button>
                      
                      {/* زر تطبيق الفلتر على المنتجات المختارة */}
                      {filterResults.length > 0 && (
                        <button
                          type="button"
                          onClick={applyFilterToSelection}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          إضافة نتائج الفلتر ({filterResults.length})
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500"
                    placeholder="البحث في المنتجات..."
                  />
                </div>
              </div>

              {/* Selected Products Count */}
              {selectedProducts.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    تم اختيار {selectedProducts.length} منتج
                  </p>
                </div>
              )}

              {/* Filter Results Info */}
              {filterResults.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm font-medium">
                    نتائج الفلتر: {filterResults.length} منتج
                  </p>
                </div>
              )}

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {(filterResults.length > 0 ? filterResults : filteredProducts).map(product => (
                  <div
                    key={product._id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedProducts.includes(product._id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleProductSelection(product._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.mainImage ? (
                          <img
                            src={buildImageUrl(product.mainImage)}
                            alt={product.name_ar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-black truncate">{product.name_ar}</h4>
                        <p className="text-sm text-gray-600 truncate">{product.name_en}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-black font-semibold">{product.price} ر.س </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-gray-500 line-through text-sm">{product.originalPrice} ر.س.م</span>
                          )}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedProducts.includes(product._id)
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-400'
                      }`}>
                        {selectedProducts.includes(product._id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(filterResults.length > 0 ? filterResults : filteredProducts).length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">لا توجد منتجات متاحة</p>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-black transition-colors font-medium border border-gray-300 rounded-xl hover:bg-gray-100"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors font-semibold flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    {collection ? 'تحديث المجموعة' : 'إنشاء المجموعة'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;