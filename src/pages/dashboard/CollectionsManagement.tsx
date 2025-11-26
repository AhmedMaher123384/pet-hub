import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../config/api';
import CollectionModal from '../../components/modals/CollectionModal';
import DeleteModal from '../../components/modals/DeleteModal';

interface Collection {
  _id: string;
  id?: number;
  name: {
    ar: string;
    en: string;
  };
  type: 'manual' | 'automated';
  products?: string[];
  productsCount?: number; // Backend calculated product count
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

interface CollectionsManagementProps {
  onClose?: () => void;
}

const CollectionsManagement: React.FC<CollectionsManagementProps> = ({ onClose }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showCollectionModal, setShowCollectionModal] = useState<boolean>(false);
  const [selectedCollectionForEdit, setSelectedCollectionForEdit] = useState<Collection | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<{
    id: string;
    name: string;
  }>({ id: '', name: '' });

  // جلب المجموعات
  const fetchCollections = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching collections from API...');
      const response = await apiCall(API_ENDPOINTS.COLLECTIONS);
      console.log('📥 Raw API response:', response);
      const data = response.data || response; // Handle both response formats
      console.log('📋 Processed collections data:', data);
      console.log('🔢 Number of collections:', Array.isArray(data) ? data.length : 0);
      
      // Log product counts for each collection
      if (Array.isArray(data)) {
        data.forEach((collection, index) => {
          console.log(`📊 Collection ${index + 1} (${collection.name?.ar || collection.name?.en}):`, {
            type: collection.type,
            productsCount: collection.productsCount,
            products: collection.products?.length || 0
          });
        });
      }
      
      const collectionsArray = Array.isArray(data) ? data : [];
      setCollections(collectionsArray);
      setFilteredCollections(collectionsArray);
      
      // حفظ المجموعات في localStorage
      localStorage.setItem('collections', JSON.stringify(collectionsArray));
    } catch (error) {
      console.error('Error fetching collections:', error);
      smartToast.dashboard.error('حدث خطأ في تحميل المجموعات');
    } finally {
      setLoading(false);
    }
  };

  // البحث في المجموعات
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredCollections(collections);
    } else {
      const filtered = collections.filter(collection =>
        collection.name.ar.toLowerCase().includes(term.toLowerCase()) ||
        collection.name.en.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCollections(filtered);
    }
  };

  // فتح modal الحذف
  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ id, name });
    setShowDeleteModal(true);
  };

  // حذف المجموعة
  const handleDelete = async () => {
    try {
      await apiCall(API_ENDPOINTS.COLLECTION_BY_ID(deleteModal.id), {
        method: 'DELETE'
      });
      
      const updatedCollections = collections.filter(item => item._id !== deleteModal.id);
      setCollections(updatedCollections);
      setFilteredCollections(updatedCollections);
      
      // تحديث localStorage
      localStorage.setItem('collections', JSON.stringify(updatedCollections));
      
      smartToast.dashboard.success('تم حذف المجموعة بنجاح');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting collection:', error);
      smartToast.dashboard.error('حدث خطأ في حذف المجموعة');
    }
  };

  // تحديث المجموعات بعد الحفظ
  const handleCollectionSuccess = () => {
    console.log('✅ Collection success callback triggered - refreshing collections...');
    setShowCollectionModal(false);
    setSelectedCollectionForEdit(null);
    console.log('🔄 About to call fetchCollections...');
    fetchCollections(); // سيقوم بتحديث localStorage تلقائياً
  };

  useEffect(() => {
    // تحميل المجموعات من localStorage عند بدء تشغيل المكون
    const savedCollections = localStorage.getItem('collections');
    if (savedCollections) {
      try {
        const parsedCollections = JSON.parse(savedCollections);
        setCollections(parsedCollections);
        setFilteredCollections(parsedCollections);
        console.log('📦 Loaded collections from localStorage:', parsedCollections.length);
      } catch (error) {
        console.error('Error parsing collections from localStorage:', error);
      }
    }
    
    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8" />
              إدارة المجموعات
            </h1>
            <p className="text-gray-200 mt-2">إدارة وتنظيم مجموعات المنتجات</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCollectionForEdit(null);
                setShowCollectionModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة مجموعة جديدة
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث في المجموعات..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'لا توجد نتائج' : 'لا توجد مجموعات'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإضافة مجموعة جديدة'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setSelectedCollectionForEdit(null);
                setShowCollectionModal(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة أول مجموعة
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredCollections.map((collection) => (
            <div key={collection._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                {collection.image ? (
                  <img 
                    src={buildImageUrl(collection.image)}
                    alt={collection.name.ar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <Package className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{collection.name.ar}</h3>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                    {(() => {
                      console.log(`🔍 DETAILED DEBUG for "${collection.name.ar}" (${collection.type}):`, {
                        fullCollection: collection,
                        productsCount: collection.productsCount,
                        productsCountType: typeof collection.productsCount,
                        productsCountUndefined: collection.productsCount === undefined,
                        productsArray: collection.products,
                        productsLength: collection.products?.length,
                        hasProductsProperty: 'products' in collection,
                        hasProductsCountProperty: 'productsCount' in collection
                      });
                      
                      // Fix: Use productsCount if it exists and is a number, otherwise fallback to products length
                      let count = 0;
                      if (typeof collection.productsCount === 'number') {
                        count = collection.productsCount;
                        console.log(`✅ Using productsCount: ${count}`);
                      } else if (collection.products && Array.isArray(collection.products)) {
                        count = collection.products.length;
                        console.log(`⚠️ Fallback to products.length: ${count}`);
                      } else {
                        count = 0;
                        console.log(`❌ No valid count found, using 0`);
                      }
                      
                      console.log(`🔢 Final count for "${collection.name.ar}": ${count}`);
                      return count;
                    })()} منتج
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {collection.type === 'manual' ? 'مجموعة يدوية' : 'مجموعة تلقائية'}
                  {collection.maxProducts && ` - حد أقصى ${collection.maxProducts} منتج`}
                </p>
                
                {/* Status badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    collection.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {collection.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                  {collection.featured && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      مميز
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCollectionForEdit(collection);
                      setShowCollectionModal(true);
                    }}
                    className="flex-1 bg-black/10 text-black px-3 py-2 rounded-lg text-xs font-medium hover:bg-black/20 transition-all duration-300"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => openDeleteModal(collection._id, collection.name.ar)}
                    className="flex-1 bg-red-500/20 text-red-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-all duration-300"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المجموعات</p>
              <p className="text-2xl font-bold text-gray-900">{collections.length}</p>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المجموعات النشطة</p>
              <p className="text-2xl font-bold text-green-600">
                {collections.filter(c => c.isActive).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المجموعات المميزة</p>
              <p className="text-2xl font-bold text-yellow-600">
                {collections.filter(c => c.featured).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المجموعات اليدوية</p>
              <p className="text-2xl font-bold text-blue-600">
                {collections.filter(c => c.type === 'manual').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Modal */}
      {showCollectionModal && (
        <CollectionModal
          isOpen={showCollectionModal}
          onClose={() => {
            setShowCollectionModal(false);
            setSelectedCollectionForEdit(null);
          }}
          onSuccess={handleCollectionSuccess}
          collection={selectedCollectionForEdit}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="حذف المجموعة"
          message={`هل أنت متأكد من حذف المجموعة "${deleteModal.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
          type="collection"
        />
      )}
    </div>
  );
};

export default CollectionsManagement;