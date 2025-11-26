import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Mail, Package, Clock, 
  CreditCard, FileText, Printer, Copy, CheckCircle, AlertCircle, Star, Eye, Edit, Save, 
  ChevronsLeftRightEllipsisIcon, Gift,
  HandshakeIcon} from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { buildImageUrl } from '../../config/api';
import PriceDisplay from '../ui/PriceDisplay';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
  productImage?: string;
  addOns?: Array<{ name: string; price: number; description?: string }>;
  basePrice?: number;
  addOnsPrice?: number;
  productOptions?: Array<{
    optionId: string;
    optionName: { ar: string; en: string };
    value: string | string[];
    priceModifier: number;
  }>;
  productOptionsPriceModifier?: number;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  couponDiscount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
  customerAddress?: string;
  shippingPrice?: number;
  shippingRegion?: string;
}

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: number, newStatus: string) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ order, isOpen, onClose, onStatusUpdate }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'invoice'>('details');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Debug: Log order data to see what we're receiving
  React.useEffect(() => {
    if (order && isOpen) {
      console.log('🔍 OrderModal - Full order data:', order);
      console.log('🔍 OrderModal - Order items:', order.items);
      order.items.forEach((item, index) => {
        console.log(`🔍 OrderModal - Item ${index}:`, {
          productName: item.productName,
          selectedOptions: item.selectedOptions,
          optionsPricing: item.optionsPricing,
          productOptions: item.productOptions,
          productOptionsPriceModifier: item.productOptionsPriceModifier,
          addOns: item.addOns
        });
      });
    }
  }, [order, isOpen]);



  // Helper function to get localized content for add-ons
  const getLocalizedAddOnContent = (field: 'name' | 'description', addOn: any) => {
    if (!addOn) return '';
    
    // For Arabic, prefer Arabic content, fallback to English or default
    return addOn[`${field}_ar`] || addOn[`${field}_en`] || addOn[field] || '';
  };

  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'confirmed': return 'bg-gray-200 text-gray-900 border-gray-400';
      case 'preparing': return 'bg-gray-300 text-gray-900 border-gray-500';
      case 'delivered': return 'bg-black text-white border-gray-800';
      case 'cancelled': return 'bg-gray-600 text-white border-gray-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '   قيد المراجعة ';
      case 'confirmed': return 'مؤكد';
      case 'preparing': return 'قيد التحضير';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-black text-white border-gray-800';
      case 'pending': return 'bg-gray-300 text-gray-900 border-gray-400';
      case 'failed': return 'bg-gray-600 text-white border-gray-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(order.id, newStatus);
      smartToast.dashboard.success(`تم تحديث حالة الطلب إلى: ${getStatusText(newStatus)}`);
    } catch (error) {
      smartToast.dashboard.error('فشل في تحديث حالة الطلب');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      smartToast.dashboard.success(`تم نسخ ${label}`);
    });
  };

  const formatOptionName = (optionName: string): string => {
    const optionNames: { [key: string]: string } = {
      nameOnSash: 'الاسم على الوشاح',
      embroideryColor: 'لون التطريز',
      capFabric: 'قماش الكاب',
      size: 'التفاصيل',
      color: 'اللون',
      capColor: 'لون الكاب',
      dandoshColor: 'لون الدندوش'
    };
    return optionNames[optionName] || optionName;
  };

 const printInvoice = () => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>فاتورة الطلب #${order.id}</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body { 
            font-family: 'PingARLT', Arial, sans-serif !important; 
            margin: 0;
            padding: 20px;
            direction: rtl; 
            line-height: 1.6;
            color: #1a202c;
            background: #f8f9fa;
          }

          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #d1d5db;
            overflow: hidden;
          }

          .header {
            background: #1a202c;
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }

          .header h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 5px;
          }

          .header p {
            font-size: 1rem;
            opacity: 0.8;
          }

          .content {
            padding: 30px;
          }

          .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            background: #f1f3f5;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #d1d5db;
          }

          .order-info div {
            text-align: center;
            flex: 1;
          }

          .order-info strong {
            font-weight: 600;
            color: #111827;
          }

          .customer-section {
            margin-bottom: 30px;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
          }

          .customer-header {
            background: #374151;
            color: #ffffff;
            padding: 15px;
            font-weight: 600;
            text-align: center;
          }

          .customer-content {
            padding: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .customer-item {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            border-left: 3px solid #1a202c;
          }

          .customer-item strong {
            display: block;
            margin-bottom: 4px;
            font-weight: 600;
            color: #111827;
          }

          .customer-item span {
            color: #4b5563;
            font-size: 1rem;
          }

          .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }

          .products-table th, .products-table td {
            padding: 12px 10px;
            border: 1px solid #d1d5db;
            text-align: center;
            font-size: 1rem;
          }

          .products-table th {
            background: #1a202c;
            color: #ffffff;
            font-weight: 600;
          }

          .products-table tbody tr:nth-child(even) {
            background-color: #f1f3f5;
          }



          .totals-section {
            padding: 20px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: #f8f9fa;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 1rem;
            border-bottom: 1px solid #d1d5db;
          }

          .total-row:last-child {
            font-weight: 700;
            font-size: 1.1rem;
            color: #111827;
            border-bottom: none;
            margin-top: 10px;
          }

          .footer {
            margin-top: 40px;
            text-align: center;
            padding: 20px;
            background: #374151;
            color: #ffffff;
            border-radius: 8px;
            font-size: 0.95rem;
          }

          @media print {
            body { 
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .invoice-container {
              border: 1px solid #d1d5db;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1>فاتورة الطلب</h1>
            <p>📄 رقم الفاتورة: INV-${order.id}-${new Date().getFullYear()}</p>
          </div>

          <div class="content">
            <div class="order-info">
              <div>
                <strong>📅 تاريخ الطلب</strong><br>
                ${new Date(order.createdAt).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div>
                <strong>🕐 وقت الطلب</strong><br>
                ${new Date(order.createdAt).toLocaleTimeString('ar-SA')}
              </div>
            </div>

            <div class="customer-section">
              <div class="customer-header">👤 بيانات العميل</div>
              <div class="customer-content">
                <div class="customer-item">
                  <strong>🏷️ اسم العميل:</strong>
                  <span>${order.customerName}</span>
                </div>
                <div class="customer-item">
                  <strong>📱 رقم الهاتف:</strong>
                  <span>${order.customerPhone}</span>
                </div>
                <div class="customer-item">
                  <strong>📧 البريد الإلكتروني:</strong>
                  <span>${order.customerEmail}</span>
                </div>
                ${order.customerAddress ? `
                <div class="customer-item" style="grid-column: 1 / -1;">
                  <strong>📍 عنوان التوصيل:</strong>
                  <span>${order.customerAddress}</span>
                </div>
                ` : ''}

              </div>
            </div>

            <table class="products-table">
              <thead>
                <tr>
                  <th>اسم المنتج</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>المواصفات</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)} ر.س</td>
                    <td>${item.selectedOptions ? Object.entries(item.selectedOptions).map(([key, value]) => 
                      `<div>${key}: ${value}</div>`).join(' ') : 'بدون مواصفات إضافية'}</td>
                    <td>${(item.quantity * item.price).toFixed(2)} ر.س</td>
                  </tr>`).join('')}
              </tbody>
            </table>

            <div class="totals-section">
              <div class="total-row"><span>📦 المجموع الفرعي:</span><span>${(order.subtotal || order.total).toFixed(2)} ر.س</span></div>
              ${order.couponDiscount ? `<div class="total-row"><span>🎫 خصم الكوبون:</span><span>-${order.couponDiscount.toFixed(2)} ر.س</span></div>` : ''}
              <div class="total-row"><span>🏆 المجموع النهائي:</span><span>${order.total.toFixed(2)} ر.س</span></div>
            </div>

            <div class="footer">
              <p>🙏 شكراً لك على ثقتك في after ads</p>
              <p>📞 للاستفسارات: 966501234567+</p>
              <p>📧 البريد الإلكتروني: support@afterads.com</p>
              <p>🌐 الموقع الإلكتروني: www.afterads.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};


  const statusOptions = [
    { value: 'pending', label: 'قيد المراجعة', icon: Clock },
    { value: 'confirmed', label: 'مؤكد', icon: CheckCircle },
    { value: 'preparing', label: 'قيد التحضير', icon: ChevronsLeftRightEllipsisIcon },
    { value: 'delivered', label: 'تم التسليم', icon: HandshakeIcon },
    { value: 'cancelled', label: 'ملغي', icon: X }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white border-b border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">الطلب #{order.id}</h2>
                <p className="text-gray-300 text-sm sm:text-base">
                  {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
 <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end gap-x-6">
  <span
    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border-2 ${getStatusColor(order.status)}`}
  >
    {getStatusText(order.status)}
  </span>
  <button
    onClick={onClose}
    className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-all border border-gray-600"
  >
    <X className="w-4 h-4 sm:w-5 sm:h-5" />
  </button>
</div>

          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 bg-gray-50">
          <div className="flex overflow-x-auto">
            {[
              { id: 'details', label: 'تفاصيل الطلب', icon: Eye },
              { id: 'timeline', label: 'تتبع الطلب', icon: Clock },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-max px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-black border-b-2 border-black bg-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-300">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  إجراءات سريعة
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 justify-end pl1">
                
                  <button
                    onClick={() => copyToClipboard(order.customerPhone, 'رقم الهاتف')}
                    className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border-2 border-gray-300 hover:border-black hover:shadow-lg transition-all"
                  >
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-black mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">نسخ الرقم</span>
                  </button>
                  <button
                    onClick={printInvoice}
                    className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border-2 border-gray-300 hover:border-black hover:shadow-lg transition-all"
                  >
                    <Printer className="w-6 h-6 text-black mb-2" />
                    <span className="text-sm font-medium text-gray-700">طباعة فاتورة</span>
                  </button>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex flex-col items-center p-4 bg-white rounded-xl border-2 border-gray-300 hover:border-black hover:shadow-lg transition-all"
                  >
                    <Phone className="w-6 h-6 text-black mb-2" />
                    <span className="text-sm font-medium text-gray-700">اتصال مباشر</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Customer Information */}
                <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <MapPin className="w-6 h-6 text-black ml-3" />
                    معلومات العميل والتوصيل
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center ml-4">
                        <span className="text-white font-bold">👤</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">اسم العميل</p>
                        <p className="font-bold text-lg text-gray-800">{order.customerName}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center ml-4">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">رقم الهاتف</p>
                        <p className="font-bold text-lg text-gray-800 dir-ltr">{order.customerPhone}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center ml-4">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                        <p className="font-bold text-gray-800">{order.customerEmail}</p>
                      </div>
                    </div>



                    {order.customerAddress && (
                      <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center ml-4 mt-1">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-2">عنوان التوصيل</p>
                          <p className="font-bold text-gray-800 leading-relaxed">{order.customerAddress}</p>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <CreditCard className="w-6 h-6 text-black ml-3" />
                    ملخص الطلب والدفع
                  </h3>
                  <div className="space-y-4">
                    {/* Additional Services Summary */}
                    {order.items.some(item => item.addOns && item.addOns.length > 0) && (
                      <div className="bg-gray-300  rounded-xl border-2 border-gray-200 p-4">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center ml-2">
                            <span className="text-white text-xs font-bold">+</span>
                          </div>
                          المنتجات الإضافية المختارة
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item, itemIndex) => 
                            item.addOns && item.addOns.length > 0 ? (
                              <div key={itemIndex} className="bg-white rounded-lg p-3 border border-gray-300">
                                <p className="text-sm font-semibold text-gray-700 mb-2">{item.productName}:</p>
                                <div className="space-y-2">
                                  {item.addOns.map((addOn, addOnIndex) => (
                                    <div key={addOnIndex} className="flex justify-between items-center">
                                      <span className="text-gray-700 text-sm">{getLocalizedAddOnContent('name', addOn)}</span>
                                      <span className="font-bold text-gray-600">{addOn.price.toLocaleString()} ر.س</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}

                    {/* Product Options Summary */}
                    {order.items.some(item => item.productOptions && item.productOptions.length > 0) && (
                      <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4">
                        <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                            <span className="text-white text-xs font-bold">⚙</span>
                          </div>
                          خيارات المنتج المختارة
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item, itemIndex) => 
                            item.productOptions && item.productOptions.length > 0 ? (
                              <div key={itemIndex} className="bg-white rounded-lg p-3 border border-blue-300">
                                <p className="text-sm font-semibold text-blue-700 mb-2">{item.productName}:</p>
                                <div className="space-y-2">
                                  {item.productOptions.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex justify-between items-center">
                                      <div className="flex-1">
                                        <span className="text-blue-700 text-sm font-medium">{option.optionName.ar}:</span>
                                        <span className="text-blue-600 text-sm mr-2">
                                          {Array.isArray(option.value) ? option.value.join(', ') : option.value}
                                        </span>
                                      </div>
                                      {option.priceModifier !== 0 && (
                                        <span className={`font-bold text-sm ${
                                          option.priceModifier > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {option.priceModifier > 0 ? '+' : ''}{option.priceModifier.toLocaleString()} ر.س
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Base Price */}
                    {order.items.some(item => item.basePrice) && (
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">السعر الأساسي</span>
                        <span className="font-bold text-lg">
                          {order.items.reduce((total, item) => total + (item.basePrice || 0) * item.quantity, 0).toLocaleString()} ر.س
                        </span>
                      </div>
                    )}
                    

                    
                    {/* Total Add-ons Price */}
                    {order.items.some(item => item.addOnsPrice && item.addOnsPrice > 0) && (
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-gray-600">إجمالي المنتجات الإضافية</span>
                        <span className="font-bold text-lg text-gray-600">
                          {order.items.reduce((total, item) => total + (item.addOnsPrice || 0) * item.quantity, 0).toLocaleString()} ر.س
                        </span>
                      </div>
                    )}

                    {/* Total Product Options Price */}
                    {order.items.some(item => item.productOptionsPriceModifier && item.productOptionsPriceModifier !== 0) && (
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <span className="text-blue-600">إجمالي خيارات المنتج</span>
                        <span className={`font-bold text-lg ${
                          order.items.reduce((total, item) => total + (item.productOptionsPriceModifier || 0) * item.quantity, 0) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {order.items.reduce((total, item) => total + (item.productOptionsPriceModifier || 0) * item.quantity, 0) > 0 ? '+' : ''}
                          {order.items.reduce((total, item) => total + (item.productOptionsPriceModifier || 0) * item.quantity, 0).toLocaleString()} ر.س
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center p-4 bg-gray-100 rounded-xl border border-gray-300">
                      <span className="text-gray-800 font-semibold">المجموع الفرعي</span>
                      <span className="font-bold text-lg text-gray-800">{(order.subtotal || order.total).toLocaleString()} ر.س</span>
                    </div>
                    {(order.couponDiscount ?? 0) > 0 && (
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <span className="text-green-800 font-semibold flex items-center">
                          <Gift className="w-4 h-4 ml-2" />
                          خصم الكوبون
                        </span>
                        <span className="font-bold text-lg text-green-800">
                          -{order.couponDiscount?.toLocaleString()} ر.س
                        </span>
                      </div>
                    )}
                    {order.shippingPrice && order.shippingPrice > 0 && (
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <span className="text-blue-800 font-semibold flex items-center">
                          <Package className="w-4 h-4 ml-2" />
                          رسوم الشحن ({order.shippingRegion})
                        </span>
                        <span className="font-bold text-lg text-blue-800">
                          +{order.shippingPrice?.toLocaleString()} ر.س
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center p-6 bg-black rounded-xl border-2 border-black">
                      <span className="text-white font-bold text-lg">المجموع النهائي</span>
                      <span className="font-bold text-3xl text-white">{order.total.toLocaleString()} ر.س</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-sm text-gray-500 mb-1">طريقة الدفع</p>
                        <p className="font-bold text-gray-800">{order.paymentMethod || 'الدفع عند الاستلام'}</p>
                      </div>
                      <div className="p-4 rounded-xl text-center">
                        <p className="text-sm text-gray-500 mb-2">حالة الدفع</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus === 'paid' ? 'مدفوع' : order.paymentStatus === 'pending' ? 'معلق' : 'فشل'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Package className="w-6 h-6 text-black ml-3" />
                  تفاصيل المنتجات ({order.items.length} منتج)
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="border-2 border-gray-300 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start space-x-4">
                        {item.productImage && (
                          <img
                            src={buildImageUrl(item.productImage)}
                            alt={item.productName}
                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-gray-800 mb-2">{item.productName}</h4>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500">الكمية</p>
                              <p className="font-bold text-black">{item.quantity}</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500">السعر</p>
                              <p className="font-bold text-black">{item.price.toLocaleString()} ر.س</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500">الإجمالي</p>
                              <p className="font-bold text-black">{(item.quantity * item.price).toLocaleString()} ر.س</p>
                            </div>
                          </div>

                          {/* Product Options - Old System (selectedOptions) */}
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">🎨</span>
                                </div>
                                <p className="text-base font-bold text-blue-800">المواصفات المختارة</p>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(item.selectedOptions).map(([optionName, value]) => (
                                  <div key={optionName} className="bg-white p-3 rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="font-bold text-blue-900 text-sm">{formatOptionName(optionName)}</p>
                                        <p className="text-blue-700 text-sm mt-1">{value}</p>
                                      </div>
                                      {item.optionsPricing?.[optionName] && item.optionsPricing[optionName] > 0 && (
                                        <div className="text-right ml-3">
                                          <span className="bg-green-100 text-green-700 font-bold text-sm px-2 py-1 rounded-md">
                                            +{item.optionsPricing[optionName].toLocaleString()} ر.س
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Product Options - New System */}
                          {item.productOptions && item.productOptions.length > 0 && (
                            <div className="mt-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">⚙</span>
                                </div>
                                <p className="text-base font-bold text-green-800">خيارات المنتج المختارة</p>
                              </div>
                              
                              <div className="space-y-3">
                                {item.productOptions.map((option, optionIndex) => (
                                  <div key={optionIndex} className="bg-white p-3 rounded-lg border border-green-300 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="font-bold text-green-900 text-sm">{option.optionName.ar}</p>
                                        <p className="text-green-700 text-sm mt-1">
                                          {Array.isArray(option.value) ? option.value.join(', ') : option.value}
                                        </p>
                                      </div>
                                      {option.priceModifier !== 0 && (
                                        <div className="text-right ml-3">
                                          <span className={`font-bold text-sm px-2 py-1 rounded-md ${
                                            option.priceModifier > 0 
                                              ? 'bg-green-100 text-green-700' 
                                              : 'bg-red-100 text-red-700'
                                          }`}>
                                            {option.priceModifier > 0 ? '+' : ''}{option.priceModifier.toLocaleString()} ر.س
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Product Options Price Summary */}
                              {item.productOptionsPriceModifier && item.productOptionsPriceModifier !== 0 && (
                                <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                                  <div className="flex justify-between items-center">
                                    <span className="text-green-700 font-medium">إجمالي خيارات المنتج:</span>
                                    <span className={`font-bold ${
                                      item.productOptionsPriceModifier > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {item.productOptionsPriceModifier > 0 ? '+' : ''}{item.productOptionsPriceModifier.toLocaleString()} ر.س
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Additional Services - Enhanced UI */}
                          {item.addOns && item.addOns.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">+</span>
                                </div>
                                <p className="text-base font-bold text-gray-800">المنتجات الإضافية المختارة</p>
                              </div>
                              
                              <div className="space-y-3">
                                {item.addOns.map((addOn, addOnIndex) => (
                                  <div key={addOnIndex} className="bg-white p-3 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="font-bold text-gray-900 text-sm">{getLocalizedAddOnContent('name', addOn)}</p>
                                        {getLocalizedAddOnContent('description', addOn) && (
                                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{getLocalizedAddOnContent('description', addOn)}</p>
                                        )}
                                      </div>
                                      <div className="text-right ml-3">
                                        <span className="bg-gray-100 text-gray-700 font-bold text-sm px-2 py-1 rounded-md">+{addOn.price.toLocaleString()} ر.س</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Enhanced Price Breakdown */}
                              {(item.basePrice || item.addOnsPrice || item.productOptionsPriceModifier) && (
                                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                                  <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">₹</span>
                                    </span>
                                    تفصيل الأسعار
                                  </p>
                                  <div className="space-y-2">
                                    {item.basePrice && (
                                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="text-gray-700 font-medium">السعر الأساسي:</span>
                                        <span className="font-bold text-gray-900">{item.basePrice.toLocaleString()} ر.س</span>
                                      </div>
                                    )}
                                    {item.addOnsPrice && item.addOnsPrice > 0 && (
                                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="text-gray-700 font-medium">إجمالي المنتجات الإضافية:</span>
                                        <span className="font-bold text-gray-600">+{item.addOnsPrice.toLocaleString()} ر.س</span>
                                      </div>
                                    )}
                                    {item.productOptionsPriceModifier && item.productOptionsPriceModifier !== 0 && (
                                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                        <span className="text-blue-700 font-medium">إجمالي خيارات المنتج:</span>
                                        <span className={`font-bold ${
                                          item.productOptionsPriceModifier > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {item.productOptionsPriceModifier > 0 ? '+' : ''}{item.productOptionsPriceModifier.toLocaleString()} ر.س
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded border-t-2 border-gray-200">
                                      <span className="text-gray-800 font-bold">السعر الإجمالي للقطعة:</span>
                                      <span className="font-bold text-gray-600 text-lg">
                                        {((item.basePrice || 0) + (item.addOnsPrice || 0) + (item.productOptionsPriceModifier || 0)).toLocaleString()} ر.س
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}






                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-5 h-5 ml-2" />
                    ملاحظات العميل
                  </h3>
                  <p className="text-gray-700 bg-white p-4 rounded-lg">{order.notes}</p>
                </div>
              )}

              {/* Status Management */}
              <div className="bg-gray-50 border-2 border-gray-300 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 ml-2" />
                  إدارة حالة الطلب
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {statusOptions.map(status => {
                    const Icon = status.icon;
                    const isCurrentStatus = order.status === status.value;
                    return (
                      <button
                        key={status.value}
                        onClick={() => !isCurrentStatus && handleStatusChange(status.value)}
                        disabled={isCurrentStatus || isUpdatingStatus}
                        className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          isCurrentStatus
                            ? 'bg-black border-gray-800 text-white cursor-default'
                            : 'bg-white border-gray-300 hover:border-black hover:shadow-lg text-gray-700 hover:text-black'
                        } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Icon className="w-5 h-5 ml-2" />
                        <span className="font-medium">{status.label}</span>
                        {isCurrentStatus && <CheckCircle className="w-4 h-4 mr-2 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">تتبع مراحل الطلب</h3>
              <div className="relative">
                {statusOptions.map((status, index) => {
                  const Icon = status.icon;
                  const isCompleted = statusOptions.findIndex(s => s.value === order.status) >= index;
                  const isCurrent = order.status === status.value;
                  
                  return (
                    <div key={status.value} className={`flex items-center mb-8 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCurrent ? 'bg-black text-white shadow-lg scale-110' :
                        isCompleted ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-500'
                      } transition-all duration-300`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="mr-4">
                        <h4 className={`font-bold ${isCurrent ? 'text-black' : isCompleted ? 'text-gray-700' : 'text-gray-500'}`}>
                          {status.label}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {isCurrent ? 'الحالة الحالية' : isCompleted ? 'تم إنجازها' : 'في الانتظار'}
                        </p>
                      </div>
                      {index < statusOptions.length - 1 && (
                        <div className={`absolute right-6 top-12 w-0.5 h-8 ${isCompleted ? 'bg-gray-600' : 'bg-gray-300'}`} 
                             style={{ marginTop: `${index * 64}px` }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
};

export default OrderModal;