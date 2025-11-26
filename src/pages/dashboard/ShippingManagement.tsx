import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { apiCall, API_ENDPOINTS } from '../../config/api';

interface ShippingMethod {
  _id: string;
  regionName: string;
  price: number;
  isActive: boolean;
}

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ShippingMethod, '_id'>) => void;
  editingShipping: ShippingMethod | null;
}

const ShippingModal: React.FC<ShippingModalProps> = ({ isOpen, onClose, onSave, editingShipping }) => {
  const [formData, setFormData] = useState({
    regionName: '',
    price: 0,
    isActive: true
  });

  useEffect(() => {
    if (editingShipping) {
      setFormData({
        regionName: editingShipping.regionName,
        price: editingShipping.price,
        isActive: editingShipping.isActive
      });
    } else {
      setFormData({
        regionName: '',
        price: 0,
        isActive: true
      });
    }
  }, [editingShipping, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.regionName.trim()) {
      smartToast.dashboard.error('يرجى إدخال اسم المنطقة');
      return;
    }

    if (formData.price < 0) {
      smartToast.dashboard.error('يرجى إدخال سعر صحيح');
      return;
    }

    onSave({
      regionName: formData.regionName.trim(),
      price: formData.price,
      isActive: formData.isActive
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {editingShipping ? 'تعديل منطقة الشحن' : 'إضافة منطقة شحن جديدة'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المنطقة *
            </label>
            <input
              type="text"
              value={formData.regionName}
              onChange={(e) => setFormData(prev => ({ ...prev, regionName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              required
              placeholder="مثال: الرياض، جدة، الدمام..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سعر الشحن (ريال) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-700">منطقة نشطة</span>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              {editingShipping ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ShippingManagement: React.FC = () => {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingShipping, setEditingShipping] = useState<ShippingMethod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    setLoading(true);
    try {
      const data = await apiCall('shipping/admin');
      setShippingMethods(data);
    } catch (error) {
      smartToast.dashboard.error('فشل في تحميل طرق الشحن');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Omit<ShippingMethod, '_id'>) => {
    try {
      if (editingShipping) {
        await apiCall(`shipping/${editingShipping._id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        smartToast.dashboard.success('تم تحديث منطقة الشحن بنجاح');
      } else {
        await apiCall('shipping', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        smartToast.dashboard.success('تم إضافة منطقة الشحن بنجاح');
      }
      
      fetchShippingMethods();
      setShowModal(false);
      setEditingShipping(null);
    } catch (error: any) {
      smartToast.dashboard.error(error.message || 'فشل في حفظ منطقة الشحن');
    }
  };

  const handleEdit = (method: ShippingMethod) => {
    setEditingShipping(method);
    setShowModal(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiCall(`shipping/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      smartToast.dashboard.success(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} منطقة الشحن بنجاح`);
      fetchShippingMethods();
    } catch (error: any) {
      smartToast.dashboard.error(error.message || 'فشل في تحديث حالة منطقة الشحن');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف منطقة الشحن هذه؟')) return;

    try {
      await apiCall(`shipping/${id}`, {
        method: 'DELETE',
      });
      smartToast.dashboard.success('تم حذف منطقة الشحن بنجاح');
      fetchShippingMethods();
    } catch (error: any) {
      smartToast.dashboard.error(error.message || 'فشل في حذف منطقة الشحن');
    }
  };

  const handleAddNew = () => {
    setEditingShipping(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة مناطق الشحن</h1>
          <p className="text-gray-600 mt-1">إدارة مناطق الشحن وأسعارها</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة منطقة جديدة
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {shippingMethods.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">لا توجد مناطق شحن</div>
            <p className="text-gray-500 mb-4">ابدأ بإضافة منطقة شحن جديدة</p>
            <button
              onClick={handleAddNew}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
            >
              إضافة منطقة شحن
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-700">اسم المنطقة</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">السعر</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {shippingMethods.map((method) => (
                  <tr key={method._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-gray-900">{method.regionName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">{method.price} ريال</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        method.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {method.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(method)}
                          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(method._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ShippingModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingShipping(null);
        }}
        onSave={handleSave}
        editingShipping={editingShipping}
      />
    </div>
  );
};

export default ShippingManagement;