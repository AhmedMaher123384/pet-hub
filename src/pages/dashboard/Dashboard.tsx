import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { smartToast } from '../../utils/toastConfig';
import { 
  Package, Users, ShoppingCart, DollarSign, TrendingUp, Calendar, 
  Eye, Edit, Trash2, Plus, Search, Filter, Download, RefreshCw,
  BarChart3, PieChart, Activity, Clock, CheckCircle, XCircle,
  AlertTriangle, Star, Heart, MessageSquare, Truck, Gift, Tag, Settings,
  LogOut, Home, Menu, X, Bell,Zap,
  FileText, Globe, Briefcase,
  Grid, List, MoreVertical, AlertCircle as AlertIcon,
  Circle, UserCheck, Shield, Key, LogIn, User, ShoppingBag, MessageCircle, Check,
  BookCheck, Monitor, Smartphone, EyeOff, ExternalLink  
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { apiCall, API_ENDPOINTS, buildImageUrl, buildApiUrl } from '../../config/api';
import { getCategoryImage } from '../../assets/categoryImages';
import { 
  getPortfolios, 
  getPortfolioCategories,  
  createPortfolio, 
  updatePortfolio,  
  deletePortfolio, 
  createPortfolioCategory, 
  updatePortfolioCategory, 
  deletePortfolioCategory 
} from '../../utils/api';
import OrderModal from '../../components/modals/OrderModal';
import DeleteModal from '../../components/modals/DeleteModal';
import InvoiceManagement from './InvoiceManagement';
import StaticPageModal from '../StaticPageModal';
import BlogModal from '../../components/modals/BlogModal';
import TestimonialModal from '../../components/modals/TestimonialModal';
import ClientModal from '../../components/modals/ClientModal';
import CommentsManagement from './CommentsManagement';
import CouponModal from '../../components/modals/CouponModal';
import CategoryModal from '../../components/modals/CategoryModal';
import SubcategoryModal from '../../components/modals/SubcategoryModal';
import ProductModal from '../../components/modals/ProductModal';
import CollectionModal from '../../components/modals/CollectionModal';

import PortfolioModal from '../../components/modals/PortfolioModal';
import PortfolioCategoryModal from '../../components/modals/PortfolioCategoryModal';
import AddOnsManagement from './AddOnsManagement';
import ShippingManagement from './ShippingManagement';
import CollectionsManagement from './CollectionsManagement';

import logo from '../../assets/logo.webp';
import { commentService, Comment, CommentsQuery } from '../../services/commentService';

// تعريف الأنواع
interface Service {
  id: number;
  name: string;
  homeShortDescription: string;
  detailsShortDescription: string;
  description: string;
  mainImage: string;
  detailedImages: string[];
  imageDetails: string[];
  createdAt?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId: number | null;
  subcategoryId: number | null;
  mainImage: string;
  detailedImages: string[];
  faqs?: { question: string; answer: string }[];
  addOns?: { name: string; price: number; description?: string }[];
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  isActive?: boolean;
  createdAt?: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  selectedOptions?: { [key: string]: string };
  optionsPricing?: { [key: string]: number };
  productImage?: string;
  attachments?: {
    images?: string[];
    text?: string;
  }; 
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  couponDiscount?: number;
  shippingCost?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
}

interface Customer {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  city?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  lastLogin?: string;
  createdAt: string;
  status?: 'active' | 'inactive';
  // إضافة الإحصائيات الجديدة
  cartItemsCount?: number;
  wishlistItemsCount?: number;
  hasCart?: boolean;
  hasWishlist?: boolean;
}

interface SalesData {
  month: string;
  sales: number;
  orders: number;
}

interface DailySalesData {
  date: string;
  sales: number;
  orders: number;
  visitors?: number;
}

interface VisitorStats {
  totalVisitors: number;
  dailyVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  uniqueVisitors: number;
  returningVisitors: number;
}



interface StaticPage {
  id: string | number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  isActive: boolean;
  showInFooter: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  categories: string[];
  createdAt: string;
}

interface Testimonial {
  id: number;
  name: string;
  image?: string;
  position?: string;
  testimonial: string;
  createdAt: string;
  updatedAt: string;
  _id?: string;
  __v?: number;
}

interface Client {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  _id?: string;
  __v?: number;
}

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff';
  password?: string;
  isActive?: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  action: string;
  orderId?: number;
  orderNumber?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  notes?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface LoginLog {
  id: number;
  userId?: number;
  userName?: string;
  userRole?: string;
  success: boolean;
  failureReason?: string;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // معلومات المستخدم الحالي
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // تحديد التبويب الافتراضي بناءً على دور المستخدم
  const getDefaultTab = () => {
    const urlTab = searchParams.get('tab');
    if (urlTab) return urlTab;
    
    // إذا كان المستخدم موظف (staff)، توجيهه إلى الطلبات
    if (currentUser?.role === 'staff') {
      return 'orders';
    }
    
    // إذا كان مسؤول أو لم يتم تحديد الدور، عرض نظرة عامة
    return 'overview';
  };
  
  const [currentTab, setCurrentTab] = useState<string>(getDefaultTab());
  
  // الحالات المشتركة
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // تحميل معلومات المستخدم من localStorage
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        setCurrentUser(user);
        
        // إذا كان المستخدم موظف ولا يوجد tab في URL، توجيهه إلى الطلبات
        if (user.role === 'staff' && !searchParams.get('tab')) {
          setSearchParams({ tab: 'orders' });
        }
      } catch (error) {
        console.error('Error parsing admin user data:', error);
      }
    }
  }, [searchParams, setSearchParams]);

  // تحديث currentTab عند تغيير searchParams
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab) {
      setCurrentTab(urlTab);
    } else {
      // إذا لم يكن هناك tab في URL، استخدم التبويب الافتراضي
      const defaultTab = currentUser?.role === 'staff' ? 'orders' : 'overview';
      setCurrentTab(defaultTab);
    }
  }, [searchParams, currentUser]);

  // حالات نظام PIN
  const [isPinAuthenticated, setIsPinAuthenticated] = useState<boolean>(() => {
    const savedPinAuth = sessionStorage.getItem('pinAuthenticated');
    const savedPinTime = sessionStorage.getItem('pinAuthTime');
    if (savedPinAuth === 'true' && savedPinTime) {
      const timeDiff = Date.now() - parseInt(savedPinTime);
      return timeDiff < 30 * 60 * 1000; // 30 دقيقة
    }
    return false;
  });
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [pinLoading, setPinLoading] = useState<boolean>(false);
  const [pinAuthTime, setPinAuthTime] = useState<number | null>(() => {
    const savedPinTime = sessionStorage.getItem('pinAuthTime');
    return savedPinTime ? parseInt(savedPinTime) : null;
  });
  
  // PIN الافتراضي (يمكن تغييره لاحقاً)
  const STAFF_PIN = '1234';
  
  // مدة انتهاء جلسة PIN (30 دقيقة بالميلي ثانية)
  const PIN_SESSION_DURATION = 30 * 60 * 1000;

  // حالات سجلات النشاط وسجلات الدخول
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [activeLogsTab, setActiveLogsTab] = useState<'activity' | 'login'>('activity');
  const [logsSearchTerm, setLogsSearchTerm] = useState<string>('');
  const [activityFilter, setActivityFilter] = useState<string>('all'); // 'all', 'order_status', 'notes_updated'
  const [logsTotal, setLogsTotal] = useState<number>(0);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrderForLogs, setSelectedOrderForLogs] = useState<Order | null>(null);
  
  // Logs popup state
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);
  
  // Coupon modal state
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
  const [selectedCouponForEdit, setSelectedCouponForEdit] = useState<any>(null);

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<any>(null);

  // Subcategory modal state
  const [showSubcategoryModal, setShowSubcategoryModal] = useState<boolean>(false);
  const [selectedSubcategoryForEdit, setSelectedSubcategoryForEdit] = useState<any>(null);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<number | null>(null);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<any>(null);



  // دالة جلب تفاصيل الطلب
  const fetchOrderDetails = async (orderNumber: string) => {
    try {
      // البحث عن الطلب باستخدام رقم الطلب
      const response = await apiCall(`/api/orders?search=${orderNumber}`, {
        method: 'GET'
      });
      
      // التحقق من أن الاستجابة تحتوي على مصفوفة من الطلبات
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        const order = response.data.find((o: any) => o.id.toString() === orderNumber || o.orderNumber === orderNumber);
        if (order) {
          setSelectedOrderForLogs(order);
          setShowOrderModal(true);
        } else {
          smartToast.dashboard.error('لم يتم العثور على الطلب');
        }
      } else {
        smartToast.dashboard.error('لم يتم العثور على الطلب');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      smartToast.dashboard.error('حدث خطأ أثناء جلب تفاصيل الطلب');
    }
  };

  const getFilteredActivityLogs = () => {
    let filtered = activityLogs;
    
    if (activityFilter === 'order_status') {
      filtered = filtered.filter(log => 
        log.action === 'status_updated' ||
        log.action.includes('status') ||
        log.details.includes('تحويل الطلب') ||
        log.details.includes('حالة الطلب')
      );
    } else if (activityFilter === 'order_notes') {
      filtered = filtered.filter(log => 
        log.action === 'notes_updated' ||
        log.action.includes('notes') ||
        log.details.includes('ملاحظات الطلب') ||
        log.details.includes('تحديث ملاحظات')
      );
    }
    
    return filtered.filter(log => 
      log.userName.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(logsSearchTerm.toLowerCase())
    );
  };

  // دوال جلب السجلات
  const fetchActivityLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await apiCall('/api/logs/activity?orderOnly=true', {
        method: 'GET'
      });
      setActivityLogs(response.data?.logs || []);
      setLogsTotal(response.data?.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      smartToast.dashboard.error('خطأ في تحميل سجلات النشاط');
      setActivityLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchLoginLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await apiCall('/api/logs/login', {
        method: 'GET'
      });
      setLoginLogs(response.data?.logs || []);
      setLogsTotal(response.data?.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Error fetching login logs:', error);
      smartToast.dashboard.error('خطأ في تحميل سجلات الدخول');
      setLoginLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // دالة لترجمة الأكشن إلى نص مفهوم مع التفاصيل
  const getActionText = (log: ActivityLog) => {
    const { action, details, previousValue, newValue, orderNumber } = log;
    
    switch (action) {
      case 'view_reports':
        return 'دخل على صفحة التقارير';
      case 'manage_user':
        return 'دخل على صفحة إدارة المستخدمين';
      case 'user_login':
        return 'سجل دخول للنظام';
      case 'order_update':
        if (orderNumber && previousValue && newValue) {
          return `عدل طلب #${orderNumber} من "${previousValue}" إلى "${newValue}"`;
        }
        return `عدل طلب ${orderNumber ? '#' + orderNumber : ''}`;
      case 'order_create':
        return `أنشأ طلب جديد ${orderNumber ? '#' + orderNumber : ''}`;
      case 'order_delete':
        return `حذف طلب ${orderNumber ? '#' + orderNumber : ''}`;
      case 'product_update':
        if (previousValue && newValue) {
          return `عدل منتج من "${previousValue}" إلى "${newValue}"`;
        }
        return 'عدل منتج';
      case 'product_create':
        return 'أضاف منتج جديدة';
      case 'product_delete':
        return 'حذف منتج';
      case 'customer_update':
        return 'عدل بيانات عميل';
      case 'customer_create':
        return 'أضاف عميل جديد';
      case 'settings_update':
        return 'عدل الإعدادات';
      default:
        // إذا كان التفصيل يحتوي على معلومات مفيدة، اعرضه
        if (details && !details.includes('عرض') && !details.includes('الصفحة')) {
          return details;
        }
        return action;
    }
  };

  const fetchLogs = async () => {
    if (activeLogsTab === 'activity') {
      await fetchActivityLogs();
    } else {
      await fetchLoginLogs();
    }
  };

  // دالة مسح السجلات
  const clearLogs = async () => {
    if (!window.confirm('هل أنت متأكد من مسح جميع السجلات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      setLogsLoading(true);
      
      if (activeLogsTab === 'activity') {
        await apiCall('/api/logs/activity', {
          method: 'DELETE'
        });
        setActivityLogs([]);
        smartToast.dashboard.success('تم مسح جميع سجلات النشاط بنجاح');
      } else {
        await apiCall('/api/logs/login', {
          method: 'DELETE'
        });
        setLoginLogs([]);
        smartToast.dashboard.success('تم مسح جميع سجلات الدخول بنجاح');
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      smartToast.dashboard.error('خطأ في مسح السجلات');
    } finally {
      setLogsLoading(false);
    }
  };

  // دالة التحقق من PIN
  const handlePinSubmit = async () => {
    if (!pinInput.trim()) {
      setPinError('يرجى إدخال رمز PIN');
      return;
    }

    setPinLoading(true);
    setPinError('');

    try {
      const response = await apiCall(API_ENDPOINTS.ADMIN_PIN_VERIFY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pin: pinInput })
      });

      if (response.success) {
        const authTime = Date.now();
        setIsPinAuthenticated(true);
        setShowPinModal(false);
        setPinInput('');
        setPinAuthTime(authTime); // تسجيل وقت المصادقة
        
        // حفظ حالة PIN في sessionStorage
        sessionStorage.setItem('pinAuthenticated', 'true');
        sessionStorage.setItem('pinAuthTime', authTime.toString());
        
        smartToast.dashboard.success('تم التحقق من الهوية بنجاح - الجلسة ستنتهي خلال 30 دقيقة من عدم النشاط');
      } else {
        setPinError(response.message || 'رمز PIN غير صحيح');
        setPinInput('');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setPinError('خطأ في التحقق من رمز PIN');
      setPinInput('');
    } finally {
      setPinLoading(false);
    }
  };

  // دالة إعادة تعيين PIN
  const resetPinAuthentication = () => {
    setIsPinAuthenticated(false);
    setPinInput('');
    setPinError('');
    setPinLoading(false);
    setPinAuthTime(null);
    
    // مسح بيانات PIN من sessionStorage
    sessionStorage.removeItem('pinAuthenticated');
    sessionStorage.removeItem('pinAuthTime');
  };

  // دالة تحديث وقت آخر نشاط للـ PIN
  const updatePinActivity = useCallback(() => {
    if (isPinAuthenticated) {
      const currentTime = Date.now();
      setPinAuthTime(currentTime);
      sessionStorage.setItem('pinAuthTime', currentTime.toString());
    }
  }, [isPinAuthenticated]);

  // التحقق من الحاجة لطلب PIN عند تغيير التبويب
  useEffect(() => {
    if (currentTab === 'employees' && currentUser?.role === 'admin' && !isPinAuthenticated) {
      setShowPinModal(true);
    }
    // تحديث وقت النشاط عند تغيير التبويب
    updatePinActivity();
  }, [currentTab, currentUser, isPinAuthenticated, updatePinActivity]);

  // إعادة تعيين PIN عند تغيير المستخدم
  useEffect(() => {
    resetPinAuthentication();
  }, [currentUser]);

  // إضافة مستمعات الأحداث لتحديث وقت النشاط
  useEffect(() => {
    if (!isPinAuthenticated) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updatePinActivity();
    };

    // إضافة مستمعات الأحداث
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      // إزالة مستمعات الأحداث عند التنظيف
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isPinAuthenticated, updatePinActivity]);

  // مراقبة انتهاء جلسة PIN
  useEffect(() => {
    if (!isPinAuthenticated || !pinAuthTime) return;

    const checkPinExpiry = () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - pinAuthTime;
      
      if (timeDiff >= PIN_SESSION_DURATION) {
        resetPinAuthentication();
        smartToast.dashboard.warning('انتهت جلسة PIN بسبب عدم النشاط - يرجى إعادة المصادقة');
        setSearchParams({ tab: 'overview' });
      }
    };

    // فحص كل دقيقة
    const interval = setInterval(checkPinExpiry, 60000);
    
    // فحص فوري عند التحميل
    checkPinExpiry();

    return () => clearInterval(interval);
  }, [isPinAuthenticated, pinAuthTime, PIN_SESSION_DURATION, setSearchParams]);

  // حالات المنتجات والتصنيفات
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<{ [categoryId: number]: Category[] }>({});
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>('');
  const [collectionSearchTerm, setCollectionSearchTerm] = useState<string>('');  

  // Portfolio states
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [portfolioCategories, setPortfolioCategories] = useState<any[]>([]);
  const [filteredPortfolios, setFilteredPortfolios] = useState<any[]>([]);
  const [portfolioSearchTerm, setPortfolioSearchTerm] = useState<string>('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState<boolean>(false);
  const [portfolioCategorySearchTerm, setPortfolioCategorySearchTerm] = useState<string>('');
  const [showPortfolioCategoryModal, setShowPortfolioCategoryModal] = useState<boolean>(false);
  const [selectedPortfolioCategory, setSelectedPortfolioCategory] = useState<any>(null);

  // حالات التعليقات
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [commentsSearchTerm, setCommentsSearchTerm] = useState<string>('');
  const [commentsPage, setCommentsPage] = useState<number>(1);
  const [commentsTotal, setCommentsTotal] = useState<number>(0);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showCommentDetail, setShowCommentDetail] = useState<boolean>(false);

  // حالات الكوبونات والـ Wishlist
  const [coupons, setCoupons] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<any[]>([]);
  const [couponSearchTerm, setCouponSearchTerm] = useState<string>('');

  // حالات المجموعات
  const [showCollectionModal, setShowCollectionModal] = useState<boolean>(false);
  const [selectedCollectionForEdit, setSelectedCollectionForEdit] = useState<any>(null);

  // حالات الشحن
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);

  // حالات الطلبات والإحصائيات
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [dailySalesData, setDailySalesData] = useState<DailySalesData[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    totalVisitors: 0,
    dailyVisitors: 0,
    weeklyVisitors: 0,
    monthlyVisitors: 0,
    uniqueVisitors: 0,
    returningVisitors: 0
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  
  // حالات تحرير ملاحظات الطلبات
  const [editingOrderNotes, setEditingOrderNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  // حالات العملاء
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState<boolean>(false);
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);

  // حالات إدارة الموظفين
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);

  


  // Static Pages states
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [isStaticPageModalOpen, setIsStaticPageModalOpen] = useState(false);
  const [editingStaticPage, setEditingStaticPage] = useState<StaticPage | null>(null);

  // Blog states
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredBlogPosts, setFilteredBlogPosts] = useState<BlogPost[]>([]);
  const [blogSearchTerm, setBlogSearchTerm] = useState<string>('');
  const [blogStatusFilter, setBlogStatusFilter] = useState<string>('all');
  const [isBlogModalOpen, setIsBlogModalOpen] = useState<boolean>(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [newBlogPost, setNewBlogPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    author: '',
    categories: [],
    createdAt: new Date().toISOString()
  });
  const [isStaticPagesLoading, setIsStaticPagesLoading] = useState(false);

  // Testimonials states
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [testimonialSearchTerm, setTestimonialSearchTerm] = useState<string>('');
  const [testimonialStatusFilter, setTestimonialStatusFilter] = useState<string>('all');
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState<boolean>(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    name: '',
    image: '',
    position: '',
    testimonial: ''
  });

  // Clients states
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState<string>('');
  
  // Monthly Target states
  const [monthlyTarget, setMonthlyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('monthlyTarget');
    return saved ? Number(saved) : 50000;
  }); // التارجت الافتراضي
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [tempTarget, setTempTarget] = useState<number>(() => {
    const saved = localStorage.getItem('monthlyTarget');
    return saved ? Number(saved) : 50000;
  });
  const [clientStatusFilter, setClientStatusFilter] = useState<string>('all');
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    logo: '',
    website: ''
  });

  // Delete Modal States
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'product' as 'product' | 'category' | 'subcategory' | 'order' | 'customer' | 'user' | 'coupon' | 'static-page' | 'blog-post' | 'testimonial' | 'client' | 'portfolio' | 'portfolioCategory' | 'collection',
    id: 0 as number | string,
    name: '',
    loading: false
  });

  // Staff Management States
  const [users, setUsers] = useState<User[]>([]);

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  // Fetch users from server
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Check if user is authenticated
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.warn('⚠️ No admin token found. User needs to login first.');
        smartToast.dashboard.error('يجب تسجيل الدخول أولاً للوصول لإدارة المستخدمين');
        setIsLoadingUsers(false);
        return;
      }

      // Check if user has admin role
      const adminUser = localStorage.getItem('adminUser');
      if (adminUser) {
        try {
          const user = JSON.parse(adminUser);
          if (user.role !== 'admin') {
            console.warn('⚠️ User does not have admin privileges.');
            // إخفاء القسم بدلاً من عرض رسالة خطأ
            setIsLoadingUsers(false);
            return;
          }
        } catch (parseError) {
          console.error('Error parsing admin user data:', parseError);
          smartToast.dashboard.error('خطأ في بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.');
          setIsLoadingUsers(false);
          return;
        }
      }

      const response = await apiCall(API_ENDPOINTS.USERS);
      if (response.success) {
        const usersData = response.data.users.map((user: any) => ({
          id: user._id, // Use MongoDB _id
          username: user.email, // Use email as username
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin || ''
        }));
        setUsers(usersData);
        setFilteredUsers(usersData);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.message && error.message.includes('401')) {
        smartToast.dashboard.error('انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('adminUser');
      } else if (error.message && error.message.includes('403')) {
        // إخفاء رسالة الخطأ للموظفين
        console.warn('Access denied for current user role');
      } else {
        smartToast.dashboard.error('فشل في جلب المستخدمين');
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Initialize with default admin user if no users exist
  const initializeDefaultUsers = () => {
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        name: 'أحمد محمد',
        email: 'admin@example.com',
        phone: '01234567890',
        role: 'admin' as 'admin' | 'staff',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    ];
    setUsers(defaultUsers);
    setFilteredUsers(defaultUsers);
  };

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: true,
    user: {
      id: 1,
      username: 'admin',
      name: 'أحمد محمد',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    token: 'demo-token'
  });
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({ username: '', name: '', email: '', phone: '', role: 'staff', password: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState<boolean>(false);
  
  // PIN System States
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  const [pinData, setPinData] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [isLoadingPin, setIsLoadingPin] = useState<boolean>(false);
  
  // Comments state - removed duplicate
  




  // دالة جلب PIN الحالي من قاعدة البيانات
  const fetchCurrentPin = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.ADMIN_PIN_CURRENT, {
        method: 'GET'
      });
      
      if (response.success && response.data) {
        // لا نحتاج لحفظ PIN الفعلي، فقط نتحقق من وجوده
        console.log('PIN status:', response.data);
      }
    } catch (error) {
      console.error('Error fetching current PIN:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPortfolios();
    fetchCategories();
    fetchCollections();  

    fetchCoupons();
    fetchWishlistItems();
    fetchShippingMethods();
    fetchOrders();
    fetchCustomers();
    fetchCustomerStats();
    fetchTestimonials();
    fetchClients();
    fetchUsers();
    fetchComments();
    fetchLogs();
    fetchCurrentPin();
    
    // Load static pages from localStorage on dashboard startup
    const savedStaticPages = localStorage.getItem('staticPages');
    if (savedStaticPages) {
      try {
        const parsedPages = JSON.parse(savedStaticPages);
        setStaticPages(parsedPages);
      } catch (error) {
        console.error('Error parsing static pages from localStorage:', error);
      }
    }
    
    // Generate sales data for charts
    generateSalesData();
    generateDailySalesData();
    generateVisitorStats();
    
    // Initialize blog posts with sample data
    initializeBlogPosts();
    
    // Listen for updates
    const handleCategoriesUpdate = () => {
      fetchCategories();
    };
    
    const handleProductsUpdate = () => {
      fetchProducts();
    };
    
    const handleCouponsUpdate = () => {
      fetchCoupons();
    };
    
    const handleBlogPostsUpdate = () => {
      initializeBlogPosts();
    };
    
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    window.addEventListener('productsUpdated', handleProductsUpdate);
    window.addEventListener('couponsUpdated', handleCouponsUpdate);
    window.addEventListener('blogPostsChanged', handleBlogPostsUpdate);
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('productsUpdated', handleProductsUpdate);
      window.removeEventListener('couponsUpdated', handleCouponsUpdate);
      window.removeEventListener('blogPostsChanged', handleBlogPostsUpdate);
    };
  }, []);

  // Update filtered orders when orders change or when switching to orders tab
  useEffect(() => {
    if (currentTab === 'orders') {
      filterOrders(orderSearchTerm, orderStatusFilter);
    }
  }, [orders, currentTab, orderSearchTerm, orderStatusFilter]);

  // Auto-refresh orders every 30 seconds when on orders tab
  useEffect(() => {
    if (currentTab === 'orders') {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing orders...');
        fetchOrders();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentTab]);

  // Filter blog posts when search term or status filter changes
  useEffect(() => {
    filterBlogPosts();
  }, [blogPosts, blogSearchTerm, blogStatusFilter]);

  // Filter testimonials when search term or status filter changes
  useEffect(() => {
    filterTestimonials();
  }, [testimonials, testimonialSearchTerm, testimonialStatusFilter]);

  // Filter clients when search term or status filter changes
  useEffect(() => {
    filterClients();
  }, [clients, clientSearchTerm, clientStatusFilter]);

  // Filter comments when search term changes
  useEffect(() => {
    filterComments();
  }, [comments, commentsSearchTerm]);

  // وظائف المنتجات
  const fetchProducts = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.PRODUCTS);
      // The API returns products in the 'products' property
      const data = response?.products || [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      smartToast.dashboard.error('فشل في جلب المنتجات');
      // Set empty arrays as fallback
      setProducts([]);
      setFilteredProducts([]);
    }
  };



  // وظائف التصنيفات
  const fetchCategories = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);
      setCategories(data);
      setFilteredCategories(data);
      // جلب التصنيفات الفرعية لكل تصنيف
      fetchSubcategoriesForAllCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      smartToast.dashboard.error('فشل في جلب التصنيفات');
    }
  };

  // وظائف المجموعات
  const fetchCollections = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.COLLECTIONS);
      // Match the products pattern: use collections property or fallback to response
      const data = response?.collections || response?.data || response || [];
      setCollections(Array.isArray(data) ? data : []);
      setFilteredCollections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      smartToast.dashboard.error('فشل في جلب المجموعات');
      // Set empty arrays as fallback
      setCollections([]);
      setFilteredCollections([]);
    }
  };

  // دالة جلب التصنيفات الفرعية لجميع التصنيفات
  const fetchSubcategoriesForAllCategories = async (categoriesList: Category[]) => {
    try {
      const subcategoriesData: { [categoryId: number]: Category[] } = {};
      
      for (const category of categoriesList) {
        try {
          // جلب الصب كاتيجوري النشطة فقط
          const response = await apiCall(`/api/subcategories/by-parent/${category.id}?active=true`);
          subcategoriesData[category.id] = response.data || [];
        } catch (error) {
          console.error(`Error fetching subcategories for category ${category.id}:`, error);
          subcategoriesData[category.id] = [];
        }
      }
      
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };



  // وظائف الكوبونات
  const fetchCoupons = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.COUPONS);
      setCoupons(data);
      setFilteredCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      smartToast.dashboard.error('فشل في جلب الكوبونات');
    }
  };

  // وظائف قائمة الأمنيات
  const fetchWishlistItems = async () => {
    try {
      // Note: This might need user ID - for now using a placeholder
      const data = await apiCall('wishlist');
      setWishlistItems(data);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      // Don't show error toast for wishlist as it might not be critical
    }
  };

  // وظائف الشحن
  const fetchShippingMethods = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.SHIPPING.GET_ALL);
      setShippingMethods(data);
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      // Don't show error toast for shipping as it might not be critical for stats
    }
  };

  // وظائف الطلبات
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await apiCall(API_ENDPOINTS.ORDERS);
      setOrders(data);
      
      // تطبيق الفلاتر الحالية على البيانات الجديدة
      let filtered = data;
      
      if (orderStatusFilter !== 'all' && orderStatusFilter !== '') {
        filtered = filtered.filter((order: Order) => order.status === orderStatusFilter);
      }
      
      if (orderSearchTerm) {
        filtered = filtered.filter((order: Order) =>
          order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
          order.customerPhone.includes(orderSearchTerm) ||
          order.customerEmail.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
          order.id.toString().includes(orderSearchTerm)
        );
      }
      
      setFilteredOrders(filtered);
    } catch (error) {
      console.error('Error fetching orders:', error);
      smartToast.dashboard.error('فشل في جلب الطلبات');
    } finally {
      setLoadingOrders(false);
    }
  };

  // وظائف تحرير ملاحظات الطلبات
  const handleEditOrderNotes = (orderId: number, currentNotes: string) => {
    setEditingOrderNotes(orderId);
    setNoteText(currentNotes);
  };

  const handleSaveOrderNotes = async (orderId: number) => {
    try {
      const response = await apiCall(`/api/orders/${orderId}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ notes: noteText })
      });

      // تحديث البيانات المحلية
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, notes: noteText } : order
      ));
      setFilteredOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, notes: noteText } : order
      ));

      // إنهاء وضع التحرير
      setEditingOrderNotes(null);
      setNoteText('');

      smartToast.dashboard.success('تم تحديث ملاحظات الطلب بنجاح');
    } catch (error) {
      console.error('Error updating order notes:', error);
      smartToast.dashboard.error('فشل في تحديث ملاحظات الطلب');
    }
  };

  

  const handleCancelEditNotes = () => {
    setEditingOrderNotes(null);
    setNoteText('');
  };

  // وظائف العملاء
  const fetchCustomers = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CUSTOMERS);
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      smartToast.dashboard.error('فشل في جلب العملاء');
    }
  };

  const updateCustomer = async (customerId: number, updatedData: Partial<Customer>) => {
    try {
      await apiCall(API_ENDPOINTS.CUSTOMER_BY_ID(customerId), {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      
      // تحديث البيانات المحلية
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId ? { ...customer, ...updatedData } : customer
      ));
      setFilteredCustomers(prev => prev.map(customer => 
        customer.id === customerId ? { ...customer, ...updatedData } : customer
      ));
      setSelectedCustomer(prev => prev ? { ...prev, ...updatedData } : null);
      
      smartToast.dashboard.success('تم تحديث بيانات العميل بنجاح');
      return true;
    } catch (error) {
      console.error('Error updating customer:', error);
      smartToast.dashboard.error('فشل في تحديث بيانات العميل');
      return false;
    }
  };

  // وظائف التعليقات
  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const data = await apiCall(API_ENDPOINTS.COMMENTS);
      // التأكد من أن البيانات في الشكل الصحيح
      const commentsArray = data.comments || data || [];
      setComments(commentsArray);
      setFilteredComments(commentsArray);
    } catch (error) {
      console.error('Error fetching comments:', error);
      smartToast.dashboard.error('فشل في جلب التعليقات');
      setComments([]);
      setFilteredComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const filterComments = () => {
    if (!Array.isArray(comments)) {
      setFilteredComments([]);
      return;
    }
    
    const filtered = comments.filter((comment: Comment) => {
      const matchesSearch = comment.content?.toLowerCase().includes(commentsSearchTerm.toLowerCase()) ||
                           comment.userName?.toLowerCase().includes(commentsSearchTerm.toLowerCase()) ||
                           comment.productName?.toLowerCase().includes(commentsSearchTerm.toLowerCase());
      return matchesSearch;
    });
    setFilteredComments(filtered);
  };

  // دوال إدارة التعليقات
  const handleViewComment = (comment: Comment) => {
    // يمكن إضافة مودال لعرض تفاصيل التعليق
    console.log('عرض تعليق:', comment);
    smartToast.dashboard.info(`عرض تعليق من: ${comment.userName}`);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    try {
      await commentService.deleteComment(commentId);
      smartToast.dashboard.success('تم حذف التعليق بنجاح');
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      smartToast.dashboard.error('خطأ في حذف التعليق');
    }
  };

  // تم إزالة وظائف سجلات الدخول والأنشطة

  // إضافة useEffect لتحديث العملاء كل 30 ثانية
  useEffect(() => {
    if (currentTab === 'customers') {
      fetchCustomers();
      
      // تحديث تلقائي كل 30 ثانية
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing customers...');
        fetchCustomers();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentTab]);

  // جلب إحصائيات العملاء
  const [customerStats, setCustomerStats] = useState<any>(null);

  const fetchCustomerStats = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CUSTOMER_STATS);
      return data;
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      return null;
    }
  };

  useEffect(() => {
    if (currentTab === 'customers') {
      fetchCustomerStats();
    }
  }, [currentTab]);

  // تصفية المستخدمين
  useEffect(() => {
    const filtered = users.filter((user: any) => {
      const matchesSearch = user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                           user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                           user.username?.toLowerCase().includes(userSearchTerm.toLowerCase());
      
      const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
      
      return matchesSearch && matchesRole;
    });
    setFilteredUsers(filtered);
  }, [users, userSearchTerm, userRoleFilter]);

  // تحديث البيانات التحليلية عند تغيير البيانات الأساسية
  useEffect(() => {
    if (orders.length > 0 && products.length > 0) {
      generateSalesData();
      generateDailySalesData();
    }
    if (orders.length > 0 && customers.length > 0) { 
      generateVisitorStats();
    }
  }, [orders, products, customers]);

  const generateSalesData = () => {
    // إنشاء بيانات شهرية واقعية بدءاً من أغسطس 2025
    const monthlyData: { [key: string]: { sales: number; orders: number } } = {};
    
    // أسماء الشهور الميلادية بالعربية
    const gregorianMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // إنشاء بيانات واقعية لكل شهر بدءاً من أغسطس 2025
    gregorianMonths.forEach((month, index) => {
      // بيانات واقعية متنوعة حسب الشهر
      let baseOrders, baseSales;
      
      if (index >= 7) { // من أغسطس فما بعد (2025)
        // موسم العودة للمدارس والتسوق
        baseOrders = Math.floor(Math.random() * 200) + 150; // 150-350 طلب
        baseSales = baseOrders * (Math.random() * 150 + 200); // متوسط 200-350 ر.س للطلب
      } else if (index >= 5 && index <= 7) { // يونيو-أغسطس (موسم الصيف)
        baseOrders = Math.floor(Math.random() * 180) + 120;
        baseSales = baseOrders * (Math.random() * 120 + 180);
      } else if (index >= 2 && index <= 4) { // مارس-مايو (موسم الربيع)
        baseOrders = Math.floor(Math.random() * 160) + 100;
        baseSales = baseOrders * (Math.random() * 100 + 160);
      } else { // باقي الشهور
        baseOrders = Math.floor(Math.random() * 140) + 80;
        baseSales = baseOrders * (Math.random() * 80 + 140);
      }
      
      monthlyData[month] = {
        sales: Math.round(baseSales),
        orders: baseOrders
      };
    });
    
    // إضافة بيانات الطلبات الحقيقية إذا وجدت
    orders.forEach(order => {
      if (order.status === 'delivered' || order.status === 'confirmed') {
        const orderDate = new Date(order.createdAt);
        const monthIndex = orderDate.getMonth();
        const monthName = gregorianMonths[monthIndex];
        
        if (monthlyData[monthName]) {
          monthlyData[monthName].sales += order.total;
          monthlyData[monthName].orders += 1;
        }
      }
    });

    // تحويل البيانات إلى مصفوفة مرتبة
    const salesData: SalesData[] = gregorianMonths.map(month => ({
      month,
      sales: monthlyData[month]?.sales || 0,
      orders: monthlyData[month]?.orders || 0
    }));
    
    setSalesData(salesData);

    // حساب أفضل المنتجات مبيعاً من البيانات الحقيقية
    if (products.length > 0) {
      const productSales: { [key: string]: { quantity: number; revenue: number; name: string } } = {};
      
      orders.forEach(order => {
        if (order.status === 'delivered' || order.status === 'confirmed') {
          order.items.forEach(item => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                quantity: 0,
                revenue: 0,
                name: item.productName
              };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.totalPrice;
          });
        }
      });

      const topProductsData = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(product => ({
          name: product.name,
          sales: product.quantity,
          revenue: product.revenue
        }));
      
      setTopProducts(topProductsData);
    }
  };

  // حساب المبيعات اليومية من البيانات الحقيقية فقط
  const generateDailySalesData = () => {
    const dailyData: { [key: string]: { sales: number; orders: number } } = {};
    
    // إنشاء قائمة بآخر 30 يوم من اليوم الحالي
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (29 - i)); // العد من 29 يوم مضت إلى اليوم
      return date.toISOString().split('T')[0];
    });

    // تهيئة البيانات لآخر 30 يوم بقيم صفر
    last30Days.forEach(date => {
      dailyData[date] = {
        sales: 0,
        orders: 0
      };
    });

    // إضافة بيانات الطلبات الحقيقية فقط
    orders.forEach(order => {
      if (order.status === 'delivered' || order.status === 'confirmed') {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (dailyData[orderDate]) {
          dailyData[orderDate].sales += order.total;
          dailyData[orderDate].orders += 1;
        }
      }
    });

    const dailySales: DailySalesData[] = last30Days.map(date => {
      const dateObj = new Date(date);
      const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      return {
        date: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`, // تنسيق التاريخ بشكل مبسط
        sales: dailyData[date].sales,
        orders: dailyData[date].orders
      };
    });

    setDailySalesData(dailySales);
  };

  // نظام تتبع الزوار الجديد - يبدأ العد من اليوم
  const initializeVisitorTracking = () => {
    const today = new Date().toISOString().split('T')[0];
    const visitorData = localStorage.getItem('visitorTracking');
    
    if (!visitorData) {
      // إنشاء نظام تتبع جديد
      const newTracking = {
        startDate: today,
        dailyVisitors: {},
        totalVisitors: 0,
        uniqueVisitors: new Set(),
        returningVisitors: 0
      };
      localStorage.setItem('visitorTracking', JSON.stringify(newTracking));
      return newTracking;
    }
    
    const parsedData = JSON.parse(visitorData);
    
    // تحويل البيانات المحفوظة إلى الشكل الصحيح
    // التأكد من أن البيانات صالحة
    const safeUniqueVisitors = Array.isArray(parsedData.uniqueVisitors) ? parsedData.uniqueVisitors : [];
    const safeDailyVisitors = parsedData.dailyVisitors && typeof parsedData.dailyVisitors === 'object' ? parsedData.dailyVisitors : {};
    
    const tracking = {
      ...parsedData,
      uniqueVisitors: new Set(safeUniqueVisitors),
      dailyVisitors: {}
    };
    
    // تحويل dailyVisitors من Arrays إلى Sets
    Object.entries(safeDailyVisitors).forEach(([date, visitors]) => {
      if (Array.isArray(visitors)) {
        tracking.dailyVisitors[date] = new Set(visitors as string[]);
      } else {
        tracking.dailyVisitors[date] = new Set();
      }
    });
    
    return tracking;
  };

  // تسجيل زيارة جديدة
  const trackVisitor = () => {
    const today = new Date().toISOString().split('T')[0];
    const visitorId = localStorage.getItem('visitorId') || `visitor_${Date.now()}_${Math.random()}`;
    
    if (!localStorage.getItem('visitorId')) {
      localStorage.setItem('visitorId', visitorId);
    }
    
    const tracking = initializeVisitorTracking();
    
    // تسجيل الزيارة اليومية
    if (!tracking.dailyVisitors[today]) {
      tracking.dailyVisitors[today] = new Set();
    }
    
    // التأكد من أن uniqueVisitors هو Set
    if (!(tracking.uniqueVisitors instanceof Set)) {
      tracking.uniqueVisitors = new Set(tracking.uniqueVisitors || []);
    }
    
    // التأكد من أن dailyVisitors[today] هو Set
    if (!(tracking.dailyVisitors[today] instanceof Set)) {
      tracking.dailyVisitors[today] = new Set(tracking.dailyVisitors[today] || []);
    }
    
    const wasReturning = tracking.uniqueVisitors.has(visitorId);
    tracking.dailyVisitors[today].add(visitorId);
    tracking.uniqueVisitors.add(visitorId);
    
    if (wasReturning) {
      tracking.returningVisitors++;
    }
    
    tracking.totalVisitors++;
    
    // تحويل Set إلى Array للحفظ في localStorage
    const trackingToSave = {
      ...tracking,
      dailyVisitors: Object.fromEntries(
        Object.entries(tracking.dailyVisitors).map(([date, visitors]) => [
          date, 
          Array.from(visitors as Set<string>)
        ])
      ),
      uniqueVisitors: Array.from(tracking.uniqueVisitors)
    };
    
    localStorage.setItem('visitorTracking', JSON.stringify(trackingToSave));
  };

  // حساب إحصائيات الزوار من البيانات المحفوظة
  const generateVisitorStats = () => {
    const tracking = initializeVisitorTracking();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // تحويل البيانات المحفوظة إلى Sets
    const dailyVisitorsData: { [key: string]: Set<string> } = {};
    Object.entries(tracking.dailyVisitors || {}).forEach(([date, visitors]) => {
      dailyVisitorsData[date] = new Set(visitors as string[]);
    });
    
    // حساب الزوار لفترات مختلفة
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // زوار اليوم
    const todayVisitors = dailyVisitorsData[today]?.size || 0;
    
    // زوار الأسبوع
    let weeklyVisitors = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      weeklyVisitors += dailyVisitorsData[date]?.size || 0;
    }
    
    // زوار الشهر
    let monthlyVisitors = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      monthlyVisitors += dailyVisitorsData[date]?.size || 0;
    }
    
    // إجمالي الزوار منذ بداية التتبع
    const totalVisitors = tracking.totalVisitors || 0;
    
    // الزوار الفريدين
    const uniqueVisitors = Array.isArray(tracking.uniqueVisitors) 
      ? tracking.uniqueVisitors.length 
      : tracking.uniqueVisitors?.size || 0;
    
    // الزوار العائدين
    const returningVisitors = tracking.returningVisitors || 0;
    
    setVisitorStats({
      totalVisitors: totalVisitors,
      dailyVisitors: todayVisitors,
      weeklyVisitors: weeklyVisitors,
      monthlyVisitors: monthlyVisitors,
      uniqueVisitors: uniqueVisitors,
      returningVisitors: returningVisitors
    });
  };

  // تسجيل زيارة عند تحميل الصفحة
  useEffect(() => {
    trackVisitor();
  }, []);

  const handleOrderSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setOrderSearchTerm(term);
    filterOrders(term, orderStatusFilter);
  };

  const handleOrderStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setOrderStatusFilter(status);
    filterOrders(orderSearchTerm, status);
  };

  const filterOrders = (searchTerm: string, statusFilter: string) => {
    let filtered = orders;

    if (statusFilter !== 'all' && statusFilter !== '') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  };

  // Order update handler
  const handleOrderStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setLoading(true);
      
      await apiCall(API_ENDPOINTS.ORDER_STATUS(orderId), {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      // تحديث الطلب في الحالة المحلية
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as Order['status'] }
            : order
        )
      );
      
      // تحديث الطلبات المفلترة أيضاً
      setFilteredOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as Order['status'] }
            : order
        )
      );

      // تحديث الطلب المحدد في النافذة المنبثقة
      setSelectedOrder(prevOrder => 
        prevOrder && prevOrder.id === orderId 
          ? { ...prevOrder, status: newStatus as Order['status'] }
          : prevOrder
      );

      smartToast.dashboard.success(`تم تحديث حالة الطلب إلى: ${getOrderStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      smartToast.dashboard.error('فشل في تحديث حالة الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      setLoading(true);
      
      await apiCall(API_ENDPOINTS.ORDER_BY_ID(orderId), {
        method: 'DELETE',
      });

      // إزالة الطلب من الحالة المحلية
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setFilteredOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      smartToast.dashboard.success('تم حذف الطلب بنجاح');
    } catch (error) {
      console.error('Error deleting order:', error);
      smartToast.dashboard.error('فشل في حذف الطلب');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-black border-gray-300';
      case 'confirmed': return 'bg-gray-200 text-black border-gray-400';
      case 'preparing': return 'bg-gray-300 text-black border-gray-500';
      case 'shipped': return 'bg-gray-400 text-white border-gray-600';
      case 'delivered': return 'bg-black text-white border-black';
      case 'cancelled': return 'bg-gray-600 text-white border-gray-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'confirmed': return 'مؤكد';
      case 'preparing': return 'قيد التحضير';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getOrderPriorityColor = (order: any) => {
    const orderDate = new Date(order.createdAt);
    const hoursAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
    
    if (order.status === 'pending' && hoursAgo > 24) return 'border-l-4 border-red-500 bg-red-50';
    if (order.status === 'pending' && hoursAgo > 12) return 'border-l-4 border-orange-500 bg-orange-50';
    if (order.status === 'pending') return 'border-l-4 border-yellow-500 bg-yellow-50';
    return 'border-l-4 border-gray-300';
  };

  

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setIsOrderModalOpen(false);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(id), {
        method: 'DELETE',
      });
      
      setProducts(products.filter(p => p.id !== id));
      setFilteredProducts(Array.isArray(filteredProducts) ? filteredProducts.filter(p => p.id !== id) : []);
      smartToast.dashboard.success('تم حذف المنتج بنجاح');
    } catch (error) {
      console.error('Error deleting product:', error);
      smartToast.dashboard.error('فشل في حذف المنتج');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    try {
      await apiCall(API_ENDPOINTS.COUPON_BY_ID(id), {
        method: 'DELETE',
      });
      
      setCoupons(coupons.filter(c => c.id !== id));
      setFilteredCoupons(filteredCoupons.filter(c => c.id !== id));
      smartToast.dashboard.success('تم حذف الكوبون بنجاح');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      smartToast.dashboard.error('فشل في حذف الكوبون');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiCall(API_ENDPOINTS.CATEGORY_BY_ID(id), {
        method: 'DELETE',
      });
      
      setCategories(categories.filter(c => c.id !== id));
      setFilteredCategories(filteredCategories.filter(c => c.id !== id));
      smartToast.dashboard.success('تم حذف التصنيف بنجاح');
      
      // Trigger categories update event
      window.dispatchEvent(new Event('categoriesUpdated'));
    } catch (error) {
      console.error('Error deleting category:', error);
      smartToast.dashboard.error('فشل في حذف التصنيف');
    }
  };

  const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setProductSearchTerm(term);
    
    // Ensure products is an array before filtering
    const productsArray = Array.isArray(products) ? products : [];
    
    if (term) {
      const filtered = productsArray.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(productsArray);
    }
  };

  const handleCollectionSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCollectionSearchTerm(term);
    
    // Ensure collections is an array before filtering
    const collectionsArray = Array.isArray(collections) ? collections : [];
    
    if (term) {
      const filtered = collectionsArray.filter(collection =>
        (collection.name?.ar && collection.name.ar.toLowerCase().includes(term.toLowerCase())) ||
        (collection.name?.en && collection.name.en.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredCollections(filtered);
    } else {
      setFilteredCollections(collectionsArray);
    }
  };

  const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCategorySearchTerm(term);

    if (term) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(term.toLowerCase()) ||
        category.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  };

  const handleCouponSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCouponSearchTerm(term);

    if (term) {
      const filtered = coupons.filter(coupon =>
        coupon.name.toLowerCase().includes(term.toLowerCase()) ||
        coupon.code.toLowerCase().includes(term.toLowerCase()) ||
        coupon.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCoupons(filtered);
    } else {
      setFilteredCoupons(coupons);
    }
  };

  const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCustomerSearchTerm(term);
    
    if (!term) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => {
        const searchTerm = term.toLowerCase();
        const customerName = (customer.name || customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()).toLowerCase();
        const customerEmail = (customer.email || '').toLowerCase();
        const customerPhone = (customer.phone || '').toLowerCase();
        
        return customerName.includes(searchTerm) || 
               customerEmail.includes(searchTerm) || 
               customerPhone.includes(searchTerm);
      });
      setFilteredCustomers(filtered);
    }
  };

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearchTerm(e.target.value);
  };

  const handleLogout = () => {
    // مسح جميع بيانات المصادقة
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    smartToast.dashboard.success('تم تسجيل الخروج بنجاح');
    navigate('/login');
  };

  const switchTab = (tab: string) => {
    setSearchParams({ tab });
    setIsMobileMenuOpen(false); // Close mobile menu when switching tabs
  };

  // إحصائيات المتجر المحسنة
  const getStoreStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const outOfStockProducts = products.filter(p => !p.isAvailable).length;
    const lowStockProducts = 0;
    const unavailableProducts = products.filter(p => !p.isAvailable).length;
    const availableProducts = products.filter(p => p.isAvailable).length;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(coupon => coupon.isActive).length;
    const wishlistItemsCount = wishlistItems.length;
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const inProgressOrders = orders.filter(order => ['preparing', 'shipped'].includes(order.status)).length;
    // || order.status === 'confirmed'
    // إحصائيات الطلبات حسب الفترة الزمنية
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    }).length;
    
    const weekOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= weekStart;
    }).length;
    
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= monthStart;
    }).length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const monthRevenue = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= monthStart;
    }).reduce((sum, order) => sum + order.total, 0);
    
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // إضافة عدادات للمدونة والشهادات والعملاء
    const totalBlogPosts = blogPosts.length;
    const totalTestimonials = testimonials.length;
    const totalClients = clients.length;
    const totalComments = comments.length;
    const totalPortfolios = portfolios.length;
    
    // عدد المنتجات المفعلة (المنتجات المتاحة)
    const activeProducts = products.filter(p => p.isAvailable).length;
    
    // إحصائيات الشحن
    const totalShippingMethods = shippingMethods.length;
    
    // إحصائيات البانرز
    
    // إحصائيات المجموعات
    const totalCollections = collections.length;

    return {
      totalProducts,
      activeProducts,
      totalCategories,
      outOfStockProducts,
      lowStockProducts,
      unavailableProducts,
      availableProducts,
      totalValue,
      totalCoupons,
      activeCoupons,
      wishlistItemsCount,
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingOrders,
      completedOrders,
      inProgressOrders,
      totalRevenue,
      monthRevenue,
      averageOrderValue,
      totalBlogPosts,
      totalTestimonials,
      totalClients,
      totalComments,
      totalPortfolios,
      totalShippingMethods,
      totalCollections
    };
  };

  const [stats, setStats] = useState(() => getStoreStats());

  // Update stats when comments change
  useEffect(() => {
    const newStats = getStoreStats();
    setStats(newStats);
  }, [comments, products, categories, collections, orders, customers, coupons, wishlistItems, blogPosts, testimonials, clients, portfolios, shippingMethods]);

  // Refresh categories when returning from add/edit
  useEffect(() => {
    if (currentTab === 'categories') {
      fetchCategories();
    }
  }, [currentTab]);

  // Delete Modal Functions
  const openDeleteModal = (type: 'product' | 'category' | 'subcategory' | 'order' | 'customer' | 'user' | 'coupon' | 'static-page' | 'blog-post' | 'testimonial' | 'client' | 'portfolio' | 'portfolioCategory', id: number | string, name: string) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      name,
      loading: false
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
  };

  const confirmDelete = async (forceDelete = false) => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {


      // التعامل مع باقي الأنواع عبر API
      let endpoint = '';
      let successMessage = '';
      
      switch (deleteModal.type) {
        case 'product':
          endpoint = API_ENDPOINTS.PRODUCT_BY_ID(deleteModal.id.toString());
          successMessage = 'تم حذف المنتج بنجاح!';
          break;
        case 'category':
          endpoint = API_ENDPOINTS.CATEGORY_BY_ID(deleteModal.id.toString());
          successMessage = 'تم حذف التصنيف بنجاح!';
          break;
        case 'subcategory':
          endpoint = `/api/subcategories/${deleteModal.id}${forceDelete ? '?force=true' : ''}`;
          successMessage = 'تم حذف التصنيف الفرعي بنجاح!';
          break;

        case 'order':
          endpoint = `orders/${deleteModal.id}`;
          successMessage = 'تم حذف الطلب بنجاح!';
          break;
        case 'customer':
          endpoint = `customers/${deleteModal.id}`;
          successMessage = 'تم حذف العميل بنجاح!';
          break;
        case 'user':
          endpoint = `users/${deleteModal.id}`;
          successMessage = 'تم حذف الموظف بنجاح!';
          break;
        case 'coupon':
          endpoint = API_ENDPOINTS.COUPON_BY_ID(deleteModal.id.toString());
          successMessage = 'تم حذف الكوبون بنجاح!';
          break;
        case 'static-page':
          endpoint = API_ENDPOINTS.STATIC_PAGE_BY_ID(deleteModal.id.toString());
          successMessage = 'تم حذف الصفحة بنجاح!';
          break;
        case 'blog-post':
          await apiCall(API_ENDPOINTS.BLOG_POST_BY_ID(Number(deleteModal.id)), {
            method: 'DELETE'
          });
          const updatedBlogPosts = blogPosts.filter(post => post.id !== deleteModal.id);
          setBlogPosts(updatedBlogPosts);
          setFilteredBlogPosts(updatedBlogPosts);
          console.log('📡 Dashboard.tsx: Dispatching blogPostsChanged event after deletion');
          window.dispatchEvent(new CustomEvent('blogPostsChanged'));
          console.log('✅ Dashboard.tsx: blogPostsChanged event dispatched successfully');
          smartToast.dashboard.success('تم حذف المقال بنجاح!');
          closeDeleteModal();
          return;
        case 'testimonial':
          endpoint = API_ENDPOINTS.TESTIMONIAL_BY_ID(deleteModal.id.toString());
          successMessage = 'تم حذف الرأي بنجاح!';
          break;
        case 'client':
          endpoint = API_ENDPOINTS.CLIENT_BY_ID(deleteModal.id.toString());
          successMessage = 'تم حذف العميل بنجاح!';
          break;
        case 'portfolio':
          endpoint = API_ENDPOINTS.PORTFOLIO.DELETE(deleteModal.id.toString());
          successMessage = 'تم حذف العمل بنجاح!';
          break;
        case 'portfolioCategory':
          await deletePortfolioCategory(deleteModal.id.toString());
          setPortfolioCategories(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          // Update portfolios that had this category
          const updatedPortfolios = portfolios.map(portfolio => 
            portfolio.categoryId === Number(deleteModal.id) ? { ...portfolio, categoryId: null } : portfolio
          );
          setPortfolios(updatedPortfolios);
          setFilteredPortfolios(filteredPortfolios.map(portfolio => 
            portfolio.categoryId === Number(deleteModal.id) ? { ...portfolio, categoryId: null } : portfolio
          ));
          smartToast.dashboard.success('تم حذف تصنيف البورتفوليو بنجاح!');
          closeDeleteModal();
          return;
        case 'collection':
          // Handle both _id (string) and id (number) formats for collections
          const collectionId = deleteModal.id;
          if (!collectionId) {
            throw new Error('معرف المجموعة غير صحيح');
          }
          endpoint = API_ENDPOINTS.COLLECTION_BY_ID(collectionId.toString());
          successMessage = 'تم حذف المجموعة بنجاح!';
          break;
      }

      await apiCall(endpoint, { method: 'DELETE' });

      // Update local state
      switch (deleteModal.type) {
        case 'product':
          setProducts(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          setFilteredProducts(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          break;
        case 'category':
          setCategories(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          setFilteredCategories(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          // Update products that had this category
          const updatedProducts = products.map(product => 
            product.categoryId === Number(deleteModal.id) ? { ...product, categoryId: null } : product
          );
          setProducts(updatedProducts);
          setFilteredProducts(Array.isArray(filteredProducts) ? filteredProducts.map(product => 
            product.categoryId === Number(deleteModal.id) ? { ...product, categoryId: null } : product
          ) : []);
          window.dispatchEvent(new Event('categoriesUpdated'));
          break;
        case 'subcategory':
          // Update subcategories state by removing the deleted subcategory from all categories
          setSubcategories(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(categoryId => {
              updated[Number(categoryId)] = updated[Number(categoryId)].filter(
                sub => sub.id !== Number(deleteModal.id)
              );
            });
            return updated;
          });
          break;
        case 'order':
          setOrders(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          setFilteredOrders(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          break;
        case 'customer':
          setCustomers(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          setFilteredCustomers(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          break;
        case 'user':
          setUsers(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          setFilteredUsers(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          break;
        case 'coupon':
          setCoupons(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          setFilteredCoupons(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          break;

        case 'static-page':
          const filteredPages = staticPages.filter(item => item.id.toString() !== deleteModal.id.toString());
          setStaticPages(filteredPages);
          // Update localStorage
          localStorage.setItem('staticPages', JSON.stringify(filteredPages));
          break;
        case 'testimonial':
          setTestimonials(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          setFilteredTestimonials(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          break;
        case 'client':
          setClients(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          setFilteredClients(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          break;
        case 'portfolio':
          const updatedPortfoliosList = portfolios.filter(item => item.id !== Number(deleteModal.id));
          setPortfolios(updatedPortfoliosList);
          setFilteredPortfolios(prev => prev.filter(item => item.id !== Number(deleteModal.id)));
          // تحديث localStorage
          localStorage.setItem('portfoliosCount', updatedPortfoliosList.length.toString());
          break;
        case 'collection':
          // Handle both _id (string) and id (number) formats for collections
          setCollections(prev => prev.filter(item => 
            item._id !== deleteModal.id.toString() && item.id !== Number(deleteModal.id)
          ));
          setFilteredCollections(prev => prev.filter(item => 
            item._id !== deleteModal.id.toString() && item.id !== Number(deleteModal.id)
          ));
          break;
      }

      smartToast.dashboard.success(successMessage);
      closeDeleteModal();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      
      // Check if this is a subcategory with products that can be force deleted
      if (deleteModal.type === 'subcategory' && error?.response?.data?.canForceDelete) {
        const productsCount = error.response.data.productsCount;
        const confirmed = window.confirm(
          `هذا التصنيف الفرعي يحتوي على ${productsCount} منتج(ات). هل تريد حذف التصنيف الفرعي وإزالة ارتباطه بالمنتجات؟\n\nسيتم الاحتفاظ بالمنتجات ولكن سيتم إزالة التصنيف الفرعي منها.`
        );
        
        if (confirmed) {
          // Retry with force delete
          return confirmDelete(true);
        } else {
          setDeleteModal(prev => ({ ...prev, loading: false }));
          return;
        }
      }
      
      // Extract specific error message from the backend
      let errorMessage = 'فشل في الحذف';
      
      if (error?.message) {
        // Check for specific error patterns
        if (error.message.includes('product(s) are using this subcategory')) {
          errorMessage = 'لا يمكن حذف هذا التصنيف الفرعي لأن هناك منتجات مرتبطة به. يرجى حذف المنتجات أولاً أو تغيير تصنيفها.';
        } else if (error.message.includes('product(s) are using this category')) {
          errorMessage = 'لا يمكن حذف هذا التصنيف لأن هناك منتجات مرتبطة به. يرجى حذف المنتجات أولاً أو تغيير تصنيفها.';
        } else if (error.message.includes('Cannot delete')) {
          // Generic "Cannot delete" message - use the backend message
          errorMessage = error.message.includes('subcategory') 
            ? 'لا يمكن حذف هذا التصنيف الفرعي لوجود منتجات مرتبطة به'
            : 'لا يمكن حذف هذا العنصر لوجود عناصر مرتبطة به';
        } else if (error.message.includes('Not found') || error.message.includes('404')) {
          errorMessage = 'العنصر المطلوب حذفه غير موجود';
        } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          errorMessage = 'غير مصرح لك بحذف هذا العنصر';
        } else if (error.message.includes('Forbidden') || error.message.includes('403')) {
          errorMessage = 'ليس لديك صلاحية لحذف هذا العنصر';
        } else {
          // Use the backend error message if it's meaningful
          errorMessage = error.message.length > 5 ? error.message : 'فشل في الحذف';
        }
      }
      
      smartToast.dashboard.error(errorMessage);
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Blog functions
  const initializeBlogPosts = async () => {
    try {
      const response = await apiCall(`${API_ENDPOINTS.BLOG_POSTS}?page=1&limit=50`, {
        method: 'GET'
      });
      const posts = response.posts.map((post: any): BlogPost => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        author: post.author,
        categories: post.categories,
        createdAt: post.createdAt
      }));
      setBlogPosts(posts);
      setFilteredBlogPosts(posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setBlogPosts([]);
      setFilteredBlogPosts([]);
      smartToast.dashboard.error('فشل في تحميل مقالات المدونة');
    }
  };

  // Filter blog posts based on search
  const filterBlogPosts = () => {
    let filtered = blogPosts;
    
    if (blogSearchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(blogSearchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(blogSearchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(blogSearchTerm.toLowerCase())
      );
    }
    
    setFilteredBlogPosts(filtered);
  };

  // Filter testimonials based on search and status
  const filterTestimonials = () => {
    let filtered = testimonials;
    
    if (testimonialSearchTerm) {
      filtered = filtered.filter(testimonial =>
        testimonial.name.toLowerCase().includes(testimonialSearchTerm.toLowerCase()) ||
        testimonial.testimonial.toLowerCase().includes(testimonialSearchTerm.toLowerCase()) ||
        (testimonial.position && testimonial.position.toLowerCase().includes(testimonialSearchTerm.toLowerCase()))
      );
    }
    
    setFilteredTestimonials(filtered);
  };

  // Filter clients based on search and status
  const filterClients = () => {
    let filtered = clients;
    
    if (clientSearchTerm) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        (client.website && client.website.toLowerCase().includes(clientSearchTerm.toLowerCase()))
      );
    }
    
    setFilteredClients(filtered);
  };

  // Testimonials functions
  const fetchTestimonials = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.TESTIMONIALS);
      // Handle the correct API response format: {testimonials: [...], total: ...}
      const testimonialsArray = data?.testimonials || data || [];
      console.log('📋 Initial testimonials array:', testimonialsArray.length, 'items');
      
      setTestimonials(testimonialsArray);
      setFilteredTestimonials(testimonialsArray);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
      setFilteredTestimonials([]);
      smartToast.dashboard.error('فشل في جلب شهادات العملاء ');
    }
  };

  // Clients functions
  const fetchClients = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CLIENTS);
      // Handle the correct API response format: {clients: [...], total: ...}
      const clientsArray = data?.clients || data || [];
      console.log('📋 Initial clients array:', clientsArray.length, 'items');
      
      // تطبيع المعرفات لضمان عدم وجود معرفات مكررة أو غير صالحة
      const normalizedClients = clientsArray.map((client: any, index: number) => {
        // إذا كان المعرف موجود وفريد، نبقيه كما هو
        if (client.id && typeof client.id === 'number' && !Number.isNaN(client.id)) {
          return client;
        }
        // إنشاء معرف مؤقت بناءً على الفهرس إذا لم يكن هناك معرف صالح
        return { ...client, id: -(index + 1) };
      });
      
      // التحقق من عدم وجود معرفات مكررة وإصلاحها
      const seenIds = new Set();
      const finalClients = normalizedClients.map((client: any, index: number) => {
        if (seenIds.has(client.id)) {
          // إذا كان المعرف مكرر، أنشئ معرف جديد فريد
          let newId = -(index + normalizedClients.length + 1);
          while (seenIds.has(newId)) {
            newId--;
          }
          seenIds.add(newId);
          return { ...client, id: newId };
        }
        seenIds.add(client.id);
        return client;
      });
      
      setClients(finalClients);
      setFilteredClients(finalClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
      setFilteredClients([]);
      smartToast.dashboard.error('فشل في جلب العملاء');
    }
  };







  // Static Pages functions
  const fetchStaticPages = async () => {
    setIsStaticPagesLoading(true);
    try {
      const response = await apiCall(API_ENDPOINTS.STATIC_PAGES);
      // API returns array directly, not wrapped in data property
      const pages = Array.isArray(response) ? response : (response.data || response || []);
      setStaticPages(pages);
      // Update localStorage
      localStorage.setItem('staticPages', JSON.stringify(pages));
    } catch (error) {
      console.error('Error fetching static pages:', error);
      smartToast.dashboard.error('فشل في جلب الصفحات الثابتة');
    } finally {
      setIsStaticPagesLoading(false);
    }
  };

  const handleSaveStaticPage = async (pageData: any) => {
    try {
      console.log('🔥 Sending page data:', pageData);
      if (editingStaticPage) {
        // Update existing page
        const response = await apiCall(
          API_ENDPOINTS.STATIC_PAGE_BY_ID(editingStaticPage.id.toString()),
          {
            method: 'PUT',
            body: JSON.stringify(pageData)
          }
        );
        const updatedPages = staticPages.map(page => 
          page.id === editingStaticPage.id ? response : page
        );
        setStaticPages(updatedPages);
        // Update localStorage
        localStorage.setItem('staticPages', JSON.stringify(updatedPages));
        smartToast.dashboard.success('تم تحديث الصفحة بنجاح!');
      } else {
        // Create new page
        const response = await apiCall(API_ENDPOINTS.STATIC_PAGES, {
          method: 'POST',
          body: JSON.stringify(pageData)
        });
        const newPages = [...staticPages, response];
        setStaticPages(newPages);
        // Update localStorage
        localStorage.setItem('staticPages', JSON.stringify(newPages));
        smartToast.dashboard.success('تم إنشاء الصفحة بنجاح!');
      }
      setIsStaticPageModalOpen(false);
      setEditingStaticPage(null);
    } catch (error) {
      console.error('Error saving static page:', error);
      smartToast.dashboard.error('فشل في حفظ الصفحة');
    }
  };

  const handleEditStaticPage = (page: StaticPage) => {
    setEditingStaticPage(page);
    setIsStaticPageModalOpen(true);
  };

  const handleDeleteStaticPage = (page: StaticPage) => {
    openDeleteModal('static-page', page.id, page.title);
  };

  // Blog management functions
  const handleAddBlogPost = () => {
    setNewBlogPost({
      id: 0,
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      author: '',
      categories: [],
      createdAt: new Date().toISOString()
    });
    setEditingBlogPost(null);
    setIsBlogModalOpen(true);
  };

  const handleEditBlogPost = (post: BlogPost) => {
    setEditingBlogPost(post);
    setNewBlogPost(post);
    setIsBlogModalOpen(true);
  };

  const handleDeleteBlogPost = (post: BlogPost) => {
    openDeleteModal('blog-post', post.id, post.title);
  };

  const handleSaveBlogPost = async (postData?: Partial<BlogPost>) => {
    const updatedPost = postData || newBlogPost;
    
    if (!updatedPost.title || !updatedPost.content) {
      smartToast.dashboard.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      // Generate slug from title if not provided
      const finalPost = { ...updatedPost };
      if (!finalPost.slug && finalPost.title) {
        finalPost.slug = finalPost.title
          .toLowerCase()
          .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
          .replace(/\s+/g, '-');
      }

      if (editingBlogPost) {
        // Update existing post
        const saveData = {
          title: finalPost.title || editingBlogPost.title,
          slug: finalPost.slug || editingBlogPost.slug,
          excerpt: finalPost.excerpt || editingBlogPost.excerpt,
          content: finalPost.content || editingBlogPost.content,
          featuredImage: finalPost.featuredImage || editingBlogPost.featuredImage,
          author: finalPost.author || editingBlogPost.author,
          categories: finalPost.categories || editingBlogPost.categories
        };
        
        await apiCall(API_ENDPOINTS.BLOG_POSTS + '/' + editingBlogPost.id, {
          method: 'PUT',
          body: JSON.stringify(saveData)
        });
        smartToast.dashboard.success('تم تحديث المقال بنجاح');
      } else {
        // Add new post
        const saveData = {
          title: finalPost.title || '',
          slug: finalPost.slug || '',
          excerpt: finalPost.excerpt || '',
          content: finalPost.content || '',
          featuredImage: finalPost.featuredImage || '',
          author: finalPost.author || 'مدير الموقع',
          categories: finalPost.categories || []
        };
        
        await apiCall(API_ENDPOINTS.BLOG_POSTS, {
          method: 'POST',
          body: JSON.stringify(saveData)
        });
        smartToast.dashboard.success('تم إضافة المقال بنجاح');
      }
      
      // Refresh blog posts
      await initializeBlogPosts();
      console.log('🔄 Dashboard: Dispatching blogPostsChanged event after save/update');
      window.dispatchEvent(new CustomEvent('blogPostsChanged'));
      console.log('✅ Dashboard: blogPostsChanged event dispatched successfully');
      setIsBlogModalOpen(false);
      setEditingBlogPost(null); // تصفير البيانات فقط بعد الحفظ الناجح
    } catch (error) {
      console.error('Error saving blog post:', error);
      smartToast.dashboard.error('فشل في حفظ المقال');
    }
  };

  // Testimonial management functions
  const handleSaveTestimonial = async (formData: FormData, testimonialData: any) => {
    try {
      if (editingTestimonial) {
        // تحديث شهادة موجودة
        const response = await apiCall(
          API_ENDPOINTS.TESTIMONIAL_BY_ID(editingTestimonial.id.toString()),
          {
            method: 'PUT',
            body: formData
          }
        );
        // التأكد من أن الاستجابة تحتوي على البيانات الصحيحة
        const updatedTestimonial = response.testimonial || response;
        setTestimonials(testimonials.map(testimonial => 
          testimonial.id === editingTestimonial.id ? updatedTestimonial : testimonial
        ));
        smartToast.dashboard.success('تم تحديث الشهادة بنجاح');
      } else {
        // إضافة شهادة جديدة
        const response = await apiCall(API_ENDPOINTS.TESTIMONIALS, {
          method: 'POST',
          body: formData
        });
        // التأكد من أن الاستجابة تحتوي على البيانات الصحيحة
        const newTestimonial = response.testimonial || response;
        setTestimonials([...testimonials, newTestimonial]);
        smartToast.dashboard.success('تم إضافة الشهادة بنجاح');
      }
      setIsTestimonialModalOpen(false);
      setEditingTestimonial(null);
    } catch (error) {
      console.error('Error saving testimonial:', error);
      smartToast.dashboard.error('خطأ في حفظ الشهادة');
    }
  };

  // Client management functions
  const handleSaveClient = async (clientData: any) => {
    try {
      if (editingClient) {
        // تحديث عميل موجود
        const response = await apiCall(
          API_ENDPOINTS.CLIENT_BY_ID(editingClient.id.toString()),
          {
            method: 'PUT',
            body: JSON.stringify(clientData)
          }
        );
        // نضمن الحفاظ على المعرف حتى إذا لم يرجعه الخادم
        const updatedClient = { ...(response?.client || response), id: editingClient.id };
        setClients(clients.map(client => 
          client.id === editingClient.id ? updatedClient : client
        ));
        smartToast.dashboard.success('تم تحديث العميل بنجاح');
      } else {
        // إضافة عميل جديد
        const response = await apiCall(API_ENDPOINTS.CLIENTS, {
          method: 'POST',
          body: JSON.stringify(clientData)
        });
        const raw = response?.client || response;
        // إذا لم يُرجع الخادم معرفًا صالحًا أو رجع معرفًا مكررًا، ننشئ معرفًا محليًا سلبيًا وفريدًا لتفادي التعارض
        const existingIds = new Set(clients.map(c => c.id));
        const hasValidNumericId = raw && typeof raw.id === 'number' && !Number.isNaN(raw.id);
        let chosenId: number;
        if (hasValidNumericId && !existingIds.has(raw.id)) {
          chosenId = raw.id;
        } else {
          const minId = clients.length ? Math.min(...clients.map(c => (typeof c.id === 'number' ? c.id : Infinity))) : 0;
          let fallbackId = (Number.isFinite(minId) ? Math.min(0, minId) - 1 : -1);
          while (existingIds.has(fallbackId)) {
            fallbackId -= 1;
          }
          chosenId = fallbackId;
        }
        const newClient: any = {
          ...raw,
          id: chosenId,
        };
        setClients([...clients, newClient]);
        smartToast.dashboard.success('تم إضافة العميل بنجاح');
      }
      setIsClientModalOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
      smartToast.dashboard.error('خطأ في حفظ العميل');
    }
  };

  // Staff management functions

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات المطلوبة
    if (!newUser.username || !newUser.name || !newUser.role) {
      smartToast.dashboard.error('اسم المستخدم والاسم الكامل والدور مطلوبة');
      return;
    }
    
    // التحقق من كلمة المرور
    if (!editingUser && !newUser.password) {
      smartToast.dashboard.error('كلمة المرور مطلوبة للموظف الجديد');
      return;
    }
    
    if (newUser.password && newUser.password.length < 6) {
      smartToast.dashboard.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsLoadingUsers(true);
    
    try {
      if (editingUser) {
        // تحديث موظف موجود
        const updatedUser: User = {
          ...editingUser,
          username: newUser.username || editingUser.username,
          name: newUser.name,
          email: newUser.email || '',
          phone: newUser.phone || '',
          role: newUser.role,
          ...(newUser.password && { password: newUser.password })
        };
        
        setUsers(users.map(user => 
          user.id === editingUser.id ? updatedUser : user
        ));
        
        // تم تحديث بيانات الموظف
        smartToast.dashboard.success('تم تحديث الموظف بنجاح');
      } else {
        // إضافة موظف جديد
        const userData = {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role
        };
        
        // إرسال البيانات للخادم
        const response = await apiCall(API_ENDPOINTS.USERS, {
          method: 'POST',
          body: JSON.stringify(userData)
        });
        
        if (response.success) {
          const newUserData: User = {
            id: response.data.user.id,
            username: newUser.username,
            name: response.data.user.name,
            email: response.data.user.email,
            phone: newUser.phone || '',
            role: response.data.user.role,
            password: '',
            isActive: response.data.user.isActive,
            createdAt: response.data.user.createdAt
          };
          
          setUsers([...users, newUserData]);
          // تم إضافة موظف جديد
          smartToast.dashboard.success('تم إضافة الموظف بنجاح');
        } else {
          throw new Error(response.message || 'فشل في إضافة الموظف');
        }
      }
      
      setShowUserModal(false);
      setEditingUser(null);
      setNewUser({ username: '', name: '', email: '', phone: '', role: 'staff', password: '' });
    } catch (error) {
      console.error('Error saving user:', error);
      smartToast.dashboard.error('خطأ في حفظ الموظف');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsLoadingUsers(true);
    
    try {
      // Send delete request to server
      const response = await apiCall(API_ENDPOINTS.USER_BY_ID(userToDelete.id), {
        method: 'DELETE'
      });
      
      if (response.success) {
        setUsers(users.filter(user => user.id !== userToDelete.id));
        smartToast.dashboard.success('تم حذف الموظف بنجاح');
      } else {
        smartToast.dashboard.error('فشل في حذف الموظف');
      }
      
      setShowDeleteUserModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      smartToast.dashboard.error('خطأ في حذف الموظف');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      smartToast.dashboard.error('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      smartToast.dashboard.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    setIsLoadingPassword(true);
    
    try {
      // إذا كان المستخدم الحالي أدمن ويريد تغيير كلمة مرور موظف آخر
      const isAdminChangingOtherPassword = currentUser?.role === 'admin' && selectedUser && selectedUser.id !== currentUser.id;
      
      let endpoint, requestBody;
      
      if (isAdminChangingOtherPassword) {
        // استخدام endpoint خاص للأدمن لتغيير كلمة مرور الموظفين
        endpoint = `/api/users/admin-change-password/${selectedUser.id}`;
        requestBody = {
          newPassword: passwordData.newPassword
        };
      } else {
        // تغيير كلمة المرور الشخصية - تم إزالة متطلب كلمة المرور الحالية
        endpoint = API_ENDPOINTS.CHANGE_PASSWORD;
        requestBody = {
          newPassword: passwordData.newPassword
        };
      }
      
      const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      smartToast.dashboard.success('تم تغيير كلمة المرور بنجاح');
      
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error?.message && error.message.includes('كلمة المرور الحالية غير صحيحة')) {
        smartToast.dashboard.error('كلمة المرور الحالية غير صحيحة');
      } else {
        smartToast.dashboard.error('خطأ في تغيير كلمة المرور');
      }
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleAddTestimonial = () => {
    setEditingTestimonial(null);
    setNewTestimonial({
      name: '',
      image: '',
      position: '',
      testimonial: ''
    });
    setIsTestimonialModalOpen(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setNewTestimonial({
      name: testimonial.name,
      image: testimonial.image || '',
      position: testimonial.position || '',
      testimonial: testimonial.testimonial
    });
    setIsTestimonialModalOpen(true);
  };

  const handleDeleteTestimonial = (testimonial: Testimonial) => {
    openDeleteModal('testimonial', testimonial.id, testimonial.name);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setNewClient({
      name: '',
      logo: '',
      website: ''
    });
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      logo: client.logo || '',
      website: client.website || ''
    });
    setIsClientModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    openDeleteModal('client', client.id, client.name);
  };



  // Add static pages to useEffect for fetching data
  useEffect(() => {
    if (currentTab === 'static-pages') {
      // Always fetch from API when switching to static pages tab to ensure data is up-to-date
      fetchStaticPages();
    }
  }, [currentTab]);

  // Add testimonials to useEffect for fetching data
  useEffect(() => {
    if (currentTab === 'testimonials') {
      fetchTestimonials();
    }
  }, [currentTab]);

  // Add clients to useEffect for fetching data
  useEffect(() => {
    if (currentTab === 'clients') {
      fetchClients();
    }
  }, [currentTab]);

  // Add blog to useEffect for fetching data
  useEffect(() => {
    if (currentTab === 'blog') {
      initializeBlogPosts();
    }
  }, [currentTab]);

  // Load logs when switching to logs tab
  useEffect(() => {
    if (currentTab === 'logs') {
      fetchLogs();
    }
  }, [currentTab]);

  // Add portfolio to useEffect for fetching data
  useEffect(() => {
    if (currentTab === 'portfolio') {
      fetchPortfolios();
      fetchPortfolioCategories();
    }
  }, [currentTab]);

  // Portfolio useEffect for search and filtering
  useEffect(() => {
    if (portfolioSearchTerm) {
      const filtered = portfolios.filter(portfolio =>
        portfolio.title?.toLowerCase().includes(portfolioSearchTerm.toLowerCase()) ||
        portfolio.description?.toLowerCase().includes(portfolioSearchTerm.toLowerCase())
      );
      setFilteredPortfolios(filtered);
    } else {
      setFilteredPortfolios(portfolios);
    }
  }, [portfolios, portfolioSearchTerm]);

  // Portfolio management functions
  const fetchPortfolios = async () => {
    try {
      const response = await getPortfolios();
      if (response.success) {
        const portfoliosData = response.data || [];
        setPortfolios(portfoliosData);
        // حفظ عدد البورتفوليو في localStorage
        localStorage.setItem('portfoliosCount', portfoliosData.length.toString());
      } else {
        setPortfolios([]);
        localStorage.setItem('portfoliosCount', '0');
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setPortfolios([]);
      localStorage.setItem('portfoliosCount', '0');
    }
  };

  const fetchPortfolioCategories = async () => {
    try {
      const response = await getPortfolioCategories();
      if (response.success) {
        setPortfolioCategories(response.data || []);
      } else {
        setPortfolioCategories([]);
      }
    } catch (error) {
      console.error('Error fetching portfolio categories:', error);
      setPortfolioCategories([]);
    }
  };

  const handleAddPortfolio = () => {
    setSelectedPortfolio(null);
    setShowPortfolioModal(true);
  };

  const handleEditPortfolio = (portfolio: any) => {
    setSelectedPortfolio(portfolio);
    setShowPortfolioModal(true);
  };

  const handleAddPortfolioCategory = () => {
    setSelectedPortfolioCategory(null);
    setShowPortfolioCategoryModal(true);
  };

  const handleEditPortfolioCategory = (category: any) => {
    setSelectedPortfolioCategory(category);
    setShowPortfolioCategoryModal(true);
  };

  // دالة للتمرير إلى قسم إدارة التصنيفات
  const scrollToPortfolioCategoriesSection = () => {
    const categoriesSection = document.getElementById('portfolio-categories-section');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };



  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden" dir="rtl">
      
      {/* Desktop Sidebar - Black Theme */}
      <aside className="hidden lg:flex flex-col w-64 bg-black border-r border-gray-800 shadow-2xl">
        {/* Logo Section */}
        <div className="flex flex-col items-center h-24 px-6 py-4 border-b border-gray-800">
  <img 
    src={logo} 
    alt="AfterAds" 
    className="h-10 w-auto filter brightness-0 invert mb-2 cursor-pointer hover:scale-105 transition-transform duration-200" 
    onClick={() => switchTab('overview')}
  />
  <h1 className="text-white font-semibold">لوحة تحكم</h1>
</div>


        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto hide-scrollbar">
          {/* Dashboard Overview - Admin Only */}
          {currentUser?.role === 'admin' && (
            <div className="mb-6">
              <button
                onClick={() => switchTab('overview')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentTab === 'overview' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-5 h-5 ml-3" />
                نظرة عامة
              </button>
            </div>
          )}



          {/* Products & Categories - Admin Only */}
          {currentUser?.role === 'admin' && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">الكتالوج</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('products')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'products' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Package className="w-5 h-5 ml-3" />
                  المنتجات
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.totalProducts}
                  </span>
                </button>
                
                <button
                  onClick={() => switchTab('categories')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'categories' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5 ml-3" />
                  التصنيفات
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.totalCategories}
                  </span>
                </button>

                <button
                  onClick={() => switchTab('collections')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'collections' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Package className="w-5 h-5 ml-3" />
                  المجموعات
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.totalCollections || 0}
                  </span>
                </button>
                
                <button
                  onClick={() => switchTab('blog')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'blog' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-5 h-5 ml-3" />
                  المدونة
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.totalBlogPosts}
                  </span>
                </button>
                
                <button
                  onClick={() => switchTab('portfolio')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'portfolio' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-5 h-5 ml-3" />
                  معرض الأعمال
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.totalPortfolios}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Orders & Customers */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">المبيعات </h3>
            <div className="space-y-1">
              {/* Orders - Available for both Admin and Staff */}
              <button
                onClick={() => switchTab('orders')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentTab === 'orders' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-5 h-5 ml-3" />
                الطلبات
                <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                  {stats.pendingOrders}
                </span>
              </button>
              
              {/* Shipping - Admin Only */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('shipping')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'shipping' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Truck className="w-5 h-5 ml-3" />
                  الشحن
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.totalShippingMethods || 0}
                  </span>
                </button>
              )}
              
              {/* Customers - Admin Only */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('customers')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'customers' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5 ml-3" />
                  العملاء
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {customers.length}
                  </span>
                </button>
              )}
              
              {/* Invoices - Admin Only */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => switchTab('invoices')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'invoices' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-5 h-5 ml-3" />
                  إدارة الفواتير
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {orders.length}
                  </span>
                </button>
              )}
            </div>
          </div>

         

          {/* Coupons - Admin Only */}
          {currentUser?.role === 'admin' && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">العروض</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('coupons')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'coupons' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Tag className="w-5 h-5 ml-3" />
                  الكوبونات
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.activeCoupons}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Content Management - Admin Only */}
          {currentUser?.role === 'admin' && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">إدارة المحتوى</h3>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('static-pages')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'static-pages' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-5 h-5 ml-3" />
                    إضافة صفحات ثابتة
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {staticPages.length}
                  </span>
                </button>
                
                <button
                  onClick={() => switchTab('testimonials')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'testimonials' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 ml-3" />
                  شهادات العملاء
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.totalTestimonials}
                  </span>
                </button>
                
                <button
                  onClick={() => switchTab('clients')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'clients' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5 ml-3" />
                  عملائنا
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.totalClients}
                  </span>
                </button>
                
                <button
                  onClick={() => switchTab('comments')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'comments' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 ml-3" />
                  التعليقات
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.totalComments}
                  </span>
                </button>
                
               
              </div>
            </div>
          )}




 {/* Advanced Settings - Admin Only */}
          {currentUser?.role === 'admin' && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">الإعدادات المتقدمة</h3>
              <div className="space-y-1">
                {/* Analytics */}
                <button
                  onClick={() => switchTab('analytics')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'analytics' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-5 h-5 ml-3" />
                  التحليلات
                </button>
                
                {/* Employee Management */}
                <button
                  onClick={() => switchTab('employees')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'employees' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5 ml-3" />
                  إدارة الموظفين
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {users.length}
                  </span>
                </button>
              </div>
            </div>
          )}
        </nav>



        {/* User Section */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-black text-xs font-bold ml-2">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-white">{currentUser?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">{currentUser?.role || 'User'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-3 h-3 ml-2" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-80 bg-black shadow-2xl flex flex-col z-50 transform transition-transform duration-300 lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Mobile Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex flex-col items-center">
  <img 
    src={logo} 
    alt="AfterAds" 
    className="h-5 w-auto filter brightness-0 invert mb-1 cursor-pointer hover:scale-105 transition-transform duration-200" 
    onClick={() => {
      switchTab('overview');
      setIsMobileMenuOpen(false);
    }}
  />
  <h1 className="text-white text-sm font-medium">لوحة تحكم</h1>
</div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-400 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto hide-scrollbar">
          <div className="space-y-4">
            {/* Dashboard Overview - Admin Only */}
            {currentUser?.role === 'admin' && (
              <div>
                <button
                  onClick={() => {
                    switchTab('overview');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'overview' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 ml-3" />
                  نظرة عامة
                </button>
              </div>
            )}

            {/* Products & Categories - Admin Only */}
            {currentUser?.role === 'admin' && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">الكتالوج</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      switchTab('products');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'products' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Package className="w-5 h-5 ml-3" />
                    المنتجات
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {stats.totalProducts}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      switchTab('categories');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'categories' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Grid className="w-5 h-5 ml-3" />
                    التصنيفات
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {stats.totalCategories}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      switchTab('blog');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'blog' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5 ml-3" />
                    المدونة
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {stats.totalBlogPosts}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      switchTab('portfolio');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'portfolio' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 ml-3" />
                    معرض الأعمال
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      0
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Orders & Customers */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">المبيعات</h3>
              <div className="space-y-1">
                {/* Orders - Available for both Admin and Staff */}
                <button
                  onClick={() => {
                    switchTab('orders');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentTab === 'orders' 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 ml-3" />
                  الطلبات
                  <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                    {stats.pendingOrders}
                  </span>
                </button>
                
                {/* Shipping - Admin Only */}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      switchTab('shipping');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'shipping' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Truck className="w-5 h-5 ml-3" />
                    الشحن
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {stats.totalShippingMethods || 0}
                    </span>
                  </button>
                )}
                
                {/* Customers - Admin Only */}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      switchTab('customers');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'customers' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Users className="w-5 h-5 ml-3" />
                    العملاء
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {customers.length}
                    </span>
                  </button>
                )}
                
                {/* Invoices - Admin Only */}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      switchTab('invoices');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'invoices' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5 ml-3" />
                    إدارة الفواتير
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {orders.length}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Coupons - Admin Only */}
            {currentUser?.role === 'admin' && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">العروض</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      switchTab('coupons');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'coupons' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Tag className="w-5 h-5 ml-3" />
                    الكوبونات
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {stats.activeCoupons}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Content Management - Admin Only */}
            {currentUser?.role === 'admin' && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">إدارة المحتوى</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      switchTab('static-pages');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'static-pages' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5 ml-3" />
                    إضافة صفحات ثابتة
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {staticPages.length}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      switchTab('testimonials');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'testimonials' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 ml-3" />
                    شهادات العملاء
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {stats.totalTestimonials}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      switchTab('clients');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'clients' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Users className="w-5 h-5 ml-3" />
                    عملائنا
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {stats.totalClients}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      switchTab('comments');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'comments' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 ml-3" />
                    التعليقات
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {stats.totalComments}
                    </span>
                  </button>
                  
                  
                </div>
              </div>
            )}

            {/* Advanced Settings - Admin Only */}
            {currentUser?.role === 'admin' && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">الإعدادات المتقدمة</h3>
                <div className="space-y-1">
                  {/* Analytics */}
                  <button
                    onClick={() => {
                      switchTab('analytics');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'analytics' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5 ml-3" />
                    التحليلات
                  </button>
                  
                  {/* Employee Management */}
                  <button
                    onClick={() => {
                      switchTab('employees');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentTab === 'employees' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Users className="w-5 h-5 ml-3" />
                    إدارة الموظفين
                    <span className="mr-auto bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                      {users.length}
                    </span>
                  </button>
                  
                
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile User Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black text-sm font-bold ml-3">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{currentUser?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">{currentUser?.role || 'User'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Only for Mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
            <span className="mr-2 font-medium">القائمة</span>
          </button>
          
          {/* Mobile User Info */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">
                {currentUser?.role === 'admin' ? 'مدير' : 'موظف'}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {currentUser?.name?.charAt(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Products Tab */}
          {currentTab === 'products' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Package className="w-8 h-8" />
                       نظام إدارة المنتجات
                    </h2>
                    <p className="text-gray-200 mt-2">إدارة وتنظيم منتجات الموقع بكفاءة عالية</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setSelectedProductForEdit(null);
                        setShowProductModal(true);
                      }}
                      className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
                    >
                      <Plus className="w-8 h-4 ml-2" />
                      إضافة منتج جديدة
                    </button>
                   
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                      <div className="text-sm text-gray-500">إجمالي المنتجات</div>
                    </div>
                  </div>
                </div> 
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">{stats.unavailableProducts}</div>
                      <div className="text-sm text-gray-500">غير متوفر</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{stats.availableProducts}</div>
                      <div className="text-sm text-gray-500">متوفر</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-black">{stats.totalValue.toFixed(0)}</div>
                      <div className="text-sm text-gray-500">قيمة المخزون (ر.س)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث عن منتج..."
                    value={productSearchTerm}
                    onChange={handleProductSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Products List - Mobile First Design */}
              {!Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة منتجات جديدة لمتجرك</p>
                  <Link
                    to="/admin/product/add"
                    className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول منتج
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">


                  {/* Desktop Table */}
                  <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-black">
                          <tr>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">المنتج</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">التصنيف</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">السعر</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">حالة التوفر</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">حالة المنتج</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Array.isArray(filteredProducts) && filteredProducts.map((product) => {
                            const categoryName = categories.find(cat => cat.id === product.categoryId)?.name || 'غير محدد';
                            const availabilityStatus = product.isAvailable ? 'متوفر' : 'غير متوفر';
                            const availabilityColor = product.isAvailable ? 'text-white bg-green-600' : 'text-white bg-red-600';
                            
                            return (
                              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 ml-4 flex-shrink-0">
                                      {product.mainImage ? (
                                        <img 
                                          src={buildImageUrl(product.mainImage)}
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                          <Package className="w-6 h-6 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">{product.name}</div>
                                      <div className="text-sm text-gray-500 max-w-xs truncate">{product.shortDescription || product.description}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {categoryName}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-bold text-black">{product.price.toFixed(2)} ر.س</div>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="text-sm text-gray-500 line-through">{product.originalPrice.toFixed(2)} ر.س</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${availabilityColor}`}>
                                    {availabilityStatus}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                    product.isActive !== false ? 'text-white bg-green-600' : 'text-white bg-red-600'
                                  }`}>
                                    {product.isActive !== false ? 'نشط' : 'غير نشط'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedProductForEdit(product);
                                        setShowProductModal(true);
                                      }}
                                      className="p-2 text-white bg-gray-800 hover:bg-black rounded-xl transition-all duration-300"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal('product', product.id, product.name)}
                                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-red-400/20"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {Array.isArray(filteredProducts) && filteredProducts.map((product) => {
                      const categoryName = categories.find(cat => cat.id === product.categoryId)?.name || 'غير محدد';
                      const availabilityStatus = product.isAvailable ? 'متوفر' : 'غير متوفر';
                      const availabilityColor = product.isAvailable ? 'text-white bg-green-600' : 'text-white bg-red-600';
                      
                      return (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-4 space-x-reverse">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {product.mainImage ? (
                                <img 
                                  src={buildImageUrl(product.mainImage)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                  <Package className="w-8 h-8 text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.name}</h3>
                              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.shortDescription || product.description}</p>
                              
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                  <span className="text-xs text-gray-500 block mb-1">التصنيف</span>
                                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {categoryName}
                                  </span>
                                </div>
                                
                                <div>
                                  <span className="text-xs text-gray-500 block mb-1">السعر</span>
                                  <div className="font-bold text-black text-lg">{product.price.toFixed(2)} ر.س</div>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="text-sm text-gray-500 line-through">{product.originalPrice.toFixed(2)} ر.س</div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${availabilityColor}`}>
                                    {availabilityStatus}
                                  </span>
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                    product.isActive !== false ? 'text-white bg-green-600' : 'text-white bg-red-600'
                                  }`}>
                                    {product.isActive !== false ? 'نشط' : 'غير نشط'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-end space-x-2 space-x-reverse">
                                <button
                                  onClick={() => {
                                    setSelectedProductForEdit(product);
                                    setShowProductModal(true);
                                  }}
                                  className="p-2 text-white bg-gray-800 hover:bg-black rounded-xl transition-all duration-300"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openDeleteModal('product', product.id, product.name)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {currentTab === 'customers' && (
            <div>
              {/* Header Actions */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Users className="w-8 h-8" />
                       نظام إدارة العملاء
                    </h2>
                    <p className="text-gray-200 mt-2">إدارة ومتابعة بيانات العملاء المسجلين ونشاطهم بكفاءة عالية</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="bg-white/10 rounded-lg px-4 py-2 border border-white/20">
                      <span className="text-gray-200 text-sm">إجمالي العملاء: </span>
                      <span className="font-bold text-white">{customers.length}</span>
                    </div>
                    {customerStats && (
                      <div className="bg-white/10 rounded-lg px-4 py-2 border border-white/20">
                        <span className="text-gray-200 text-sm">النشطين: </span>
                        <span className="font-bold text-white">{customerStats.activeCustomers}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Stats Cards */}
              {customerStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-black rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">👥</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{customerStats.totalCustomers}</div>
                        <div className="text-sm text-gray-300">عميل</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-300">إجمالي العملاء</div>
                  </div>

                  <div className="bg-black rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">🛒</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{customerStats.totalCartItems}</div>
                        <div className="text-sm text-gray-300">منتج</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-300">في العربات</div>
                  </div>

                  <div className="bg-black rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">❤️</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{customerStats.totalWishlistItems}</div>
                        <div className="text-sm text-gray-300">منتج</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-300">في المفضلة</div>
                  </div>

                  <div className="bg-black rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">📊</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{customerStats.avgCartItems}</div>
                        <div className="text-sm text-gray-300">متوسط</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-300">منتجات/عربة</div>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="البحث في العملاء..."
                    value={customerSearchTerm}
                    onChange={handleCustomerSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">جاري تحميل بيانات العملاء...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-16">
                  <div className="text-red-500 mb-4">❌</div>
                  <p className="text-red-600 font-medium">{error}</p>
                  <button 
                    onClick={fetchCustomers}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}

{/* Customers Grid */}
{!loading && !error && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    {filteredCustomers.length === 0 ? (
      <div className="col-span-full text-center py-16">
        <div className="text-gray-500">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-bold text-xl mb-2">لا يوجد عملاء مسجلين</p>
          <p className="text-gray-500 text-sm mb-6">سيظهر العملاء هنا عند التسجيل عبر النظام الجديد</p>
          <button 
            onClick={fetchCustomers}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            تحديث البيانات
          </button>
        </div>
      </div>
    ) : (
      filteredCustomers.map(customer => (
        <div key={customer.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="bg-black rounded-t-lg -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 p-3 sm:p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                  {customer.fullName?.[0] || customer.firstName?.[0] || customer.name?.[0] || '؟'}
                </div>
                <div className="mr-3 sm:mr-4">
                  <h3 className="font-bold text-lg sm:text-xl text-white tracking-tight">
                    {customer.fullName || 
                     (customer.firstName && customer.lastName 
                      ? `${customer.firstName} ${customer.lastName}`
                      : customer.name || 'غير محدد'
                     )}
                  </h3>
                </div>
              </div>
              <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-sm">
                {customer.status === 'active' ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{customer.email}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{customer.phone || 'غير محدد'}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              <span>
                تاريخ التسجيل: {new Date(customer.createdAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>

          {/* Customer Activity Stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">نشاط العميل</span>
              <div className="flex space-x-2">
                {customer.hasCart && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="لديه منتجات في العربة"></div>
                )}
                {customer.hasWishlist && (
                  <div className="w-2 h-2 bg-pink-500 rounded-full" title="لديه منتجات في المفضلة"></div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-600">{customer.cartItemsCount || 0}</div>
                <div className="text-xs text-gray-500">عربة التسوق</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-pink-600">{customer.wishlistItemsCount || 0}</div>
                <div className="text-xs text-gray-500">المفضلة</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{customer.totalOrders || 0}</div>
                <div className="text-xs text-gray-500">الطلبات</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-500">آخر دخول:</span>
              <span className="font-medium text-gray-700">
                {customer.lastLogin 
                  ? new Date(customer.lastLogin).toLocaleDateString('ar-SA')
                  : 'لم يسجل دخول'
                }
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button 
                onClick={() => {
                  setSelectedCustomer(customer);
                  setIsCustomerModalOpen(true);
                }}
                className="flex-1 bg-black/10 text-black px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-200 transition-all duration-300 backdrop-blur-sm border border-gray-200"
              >
                عرض التفاصيل
              </button>
              <button
                onClick={() => openDeleteModal('customer', customer.id, customer.fullName || customer.name || customer.email)}
                className="flex-1 bg-red-500/20 text-red-600 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-red-500/30 transition-all duration-300 backdrop-blur-sm border border-red-400/20"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
)}
            </div>
          )}

          {/* Portfolio Tab */}
          {currentTab === 'portfolio' && (
            <div>
              {/* Header Actions */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Briefcase className="w-8 h-8" />
                       نظام إدارة معرض الأعمال
                    </h2>
                    <p className="text-gray-200 mt-2">إدارة ومتابعة أعمالنا المنجزة وتصنيفاتها بكفاءة عالية</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedPortfolio(null);
                        setShowPortfolioModal(true);
                      }}
                      className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-lg"
                    >
                      <Plus className="w-5 h-5" />
                      إضافة عمل جديد
                    </button>
                    <button
                      onClick={scrollToPortfolioCategoriesSection}
                      className="bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2 border border-white/20"
                    >
                      <Grid className="w-5 h-5" />
                      إدارة التصنيفات
                    </button>
                  </div>
                </div>
              </div>

              {/* Portfolio Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                   <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center"> <BookCheck className="w-6 h-6 text-white" /> </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-black">{localStorage.getItem('portfoliosCount') || portfolios.length}</div>
                      <div className="text-sm text-black">عمل</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-black">إجمالي الأعمال</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center"> <Grid className="w-6 h-6 text-white" /> </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-black">{portfolioCategories.length}</div>
                      <div className="text-sm text-black">تصنيف</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-black">التصنيفات</div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="البحث في معرض الأعمال..."
                    value={portfolioSearchTerm}
                    onChange={(e) => setPortfolioSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Portfolio List */}
              {portfolios.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد أعمال بعد</h3>
                  <p className="text-gray-500 mb-6">ابدأ بإضافة أول عمل في معرض الأعمال</p>
                  <button
                    onClick={() => {
                      setSelectedPortfolio(null);
                      setShowPortfolioModal(true);
                    }}
                    className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة أول عمل
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Desktop Grid */}
                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPortfolios.map((portfolio) => {
                      const categoryName = portfolioCategories.find(cat => cat.id === portfolio.categoryId)?.name || 'غير محدد';
                      
                      return (
                        <div key={portfolio.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                          <div className="aspect-video bg-gray-100 overflow-hidden">
                            {portfolio.mainImage ? (
                              <img 
                                src={buildImageUrl(portfolio.mainImage)}
                                alt={portfolio.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                <Briefcase className="w-12 h-12 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 text-lg mb-2">{portfolio.title}</h3>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{portfolio.description}</p>
                            
                            <div className="flex items-center justify-between mb-3">
                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                {categoryName}
                              </span>
                            </div>
                            
                            {portfolio.projectUrl && (
                              <a 
                                href={portfolio.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
className="block w-full text-center bg-gray-100 text-black px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-300 mb-3"
                              >
                                عرض العمل
                              </a>
                            )}
                            
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedPortfolio(portfolio);
                                  setShowPortfolioModal(true);
                                }}
                               className="flex-1 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2" > <Edit className="w-4 h-4" /> تعديل
                              </button>
                              <button
                                onClick={() => openDeleteModal('portfolio', portfolio.id, portfolio.title)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-red-400/20"
                                    >
                                      <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile List */}
                  <div className="md:hidden space-y-4">
                    {filteredPortfolios.map((portfolio) => {
                      const categoryName = portfolioCategories.find(cat => cat.id === portfolio.categoryId)?.name || 'غير محدد';
                      
                      return (
                        <div key={portfolio.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-4 space-x-reverse">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {portfolio.mainImage ? (
                                <img 
                                  src={buildImageUrl(portfolio.mainImage)}
                                  alt={portfolio.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                  <Briefcase className="w-8 h-8 text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-lg mb-1">{portfolio.title}</h3>
                              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{portfolio.description}</p>
                              
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {categoryName}
                                  </span>
                                </div>
                              </div>
                              
                              {portfolio.projectUrl && (
                                <a 
                                  href={portfolio.projectUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
className="block w-full text-center bg-gray-100 text-black px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-300 mb-3"
                                >
                                  عرض العمل
                                </a>
                              )}
                              
                              <div className="flex items-center justify-end space-x-2 space-x-reverse">
                                <button
                                  onClick={() => {
                                    setSelectedPortfolio(portfolio);
                                    setShowPortfolioModal(true);
                                  }}
                                  className="flex-1 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2" > <Edit className="w-4 h-4" /> تعديل
                                </button>
                                <button
                                  onClick={() => openDeleteModal('portfolio', portfolio.id, portfolio.title)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Portfolio Categories Section */}
              <div id="portfolio-categories-section" className="mt-12">
                <div className="bg-black text-white rounded-xl p-6 mb-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Grid className="w-6 h-6" />
                        إدارة تصنيفات معرض الأعمال
                      </h3>
                      <p className="text-gray-200 mt-2">تنظيم وإدارة تصنيفات أعمال البورتفوليو</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPortfolioCategory(null);
                        setShowPortfolioCategoryModal(true);
                      }}
                      className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-lg"
                    >
                      <Plus className="w-5 h-5" />
                      إضافة تصنيف جديد
                    </button>
                  </div>
                </div>

                {/* Portfolio Categories Table */}
                {portfolioCategories.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Grid className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد تصنيفات بعد</h3>
                    <p className="text-gray-500 mb-6">ابدأ بإضافة أول تصنيف لمعرض الأعمال</p>
                    <button
                      onClick={() => {
                        setSelectedPortfolioCategory(null);
                        setShowPortfolioCategoryModal(true);
                      }}
                      className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      إضافة أول تصنيف
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-gray-700">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">اسم التصنيف</div>
                        <div className="col-span-2 text-center">عدد الأعمال</div>
                        <div className="col-span-2 text-center">الإجراءات</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                      {portfolioCategories.map((category, index) => {
                        const portfoliosCount = portfolios.filter(p => p.categoryId === category.id).length;
                        
                        return (
                          <div key={category.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="grid grid-cols-12 gap-4 items-center">
                              <div className="col-span-1">
                                <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                              </div>
                              <div className="col-span-3">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                  </div>
                                </div>
                              </div>
                           
                              <div className="col-span-2 text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-300 text-black">
                                  {portfoliosCount} عمل
                                </span>
                              </div>
                              <div className="col-span-2">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedPortfolioCategory(category);
                                      setShowPortfolioCategoryModal(true);
                                    }}
                                    className="p-2 text-white bg-gray-800 hover:bg-black rounded-xl transition-all duration-300"
                                    title="تعديل التصنيف"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal('portfolioCategory', category.id, category.name)}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300"
                                    title="حذف التصنيف"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {currentTab === 'categories' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Grid className="w-8 h-8" />
                       نظام إدارة التصنيفات
                    </h2>
                    <p className="text-gray-200 mt-2">تنظيم وإدارة فئات المنتجات بكفاءة عالية</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setShowCategoryModal(true);
                        setSelectedCategoryForEdit(null);
                      }}
                      className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة تصنيف جديد
                    </button>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث في التصنيفات..."
                    value={categorySearchTerm}
                    onChange={handleCategorySearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Categories Grid */}
              {filteredCategories.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد تصنيفات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة تصنيفات لتنظيم منتجاتك</p>
                  <Link
                    to="/admin/category/add"
                    className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول تصنيف
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredCategories.map(category => {
                    const categoryProductsCount = products.filter(p => p.categoryId === category.id).length;
                    
                    return (
                      <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 overflow-hidden">
                          {category.image || getCategoryImage(Number(category.id)) ? (
                            <img 
                              src={buildImageUrl(getCategoryImage(Number(category.id)) || category.image)}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                              <Grid className="w-16 h-16 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                              {categoryProductsCount} منتج
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedCategoryForEdit(category);
                                setShowCategoryModal(true);
                              }}
                              className="flex-1 bg-black/10 text-black px-3 py-2 rounded-lg text-xs font-medium hover:bg-black/20 transition-all duration-300"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => openDeleteModal('category', category.id, category.name)}
                              className="flex-1 bg-red-500/20 text-red-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-all duration-300"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subcategories Management Section */}
          {currentTab === 'categories' && (
            <div className="space-y-6 mt-8">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Tag className="w-8 h-8" />
                      إدارة التصنيفات الفرعية
                    </h2>
                    <p className="text-blue-100 mt-2">عرض وإدارة جميع التصنيفات الفرعية في النظام</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <select
                      value={selectedParentCategoryId || ''}
                      onChange={(e) => setSelectedParentCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                      className="px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 backdrop-blur-sm focus:ring-2 focus:ring-white/30 focus:outline-none min-w-[200px]"
                    >
                      <option value="">اختر التصنيف الرئيسي للإضافة</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id} className="text-gray-900 bg-white">
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="relative group">
                      <button
                        onClick={() => {
                          console.log('Button clicked, selectedParentCategoryId:', selectedParentCategoryId);
                          if (!selectedParentCategoryId) {
                            smartToast.dashboard.error('يرجى اختيار التصنيف الرئيسي أولاً');
                            return;
                          }
                          setSelectedSubcategoryForEdit(null);
                          setShowSubcategoryModal(true);
                          console.log('Modal should open now');
                        }}
                        disabled={!selectedParentCategoryId}
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 shadow-sm"
                        title={!selectedParentCategoryId ? "يرجى اختيار التصنيف الرئيسي أولاً" : "إضافة تصنيف فرعي جديد"}
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة تصنيف فرعي
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-blue-600 text-sm font-medium">إجمالي التصنيفات الفرعية</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {Object.values(subcategories).reduce((total, subs) => total + (subs?.length || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Grid className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-green-600 text-sm font-medium">المنتجات المرتبطة</p>
                        <p className="text-2xl font-bold text-green-900">
                          {Object.values(subcategories).reduce((total, subs) => {
                            return total + (Array.isArray(subs) ? subs.reduce((subTotal, sub) => {
                              return subTotal + products.filter(p => p.categoryId === sub.id).length;
                            }, 0) : 0);
                          }, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-purple-600 text-sm font-medium">التصنيفات الرئيسية</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {Object.keys(subcategories).filter(key => subcategories[parseInt(key, 10)]?.length > 0).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Subcategories Display */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900">
                        جميع التصنيفات الفرعية
                      </h3>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {Object.values(subcategories).reduce((total, subs) => total + (subs?.length || 0), 0)} تصنيف فرعي
                    </span>
                  </div>
                </div>

                {Object.values(subcategories).some(subs => subs && subs.length > 0) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Object.entries(subcategories).map(([parentCategoryId, subs]) => 
                      subs && subs.length > 0 ? subs.map((subcategory) => {
                        // تصحيح: استخدام subcategoryId بدلاً من categoryId لحساب عدد المنتجات
                        const subcategoryProductsCount = products.filter(p => p.subcategoryId === subcategory.id).length;
                        const parentCategory = categories.find(c => c.id === parseInt(parentCategoryId, 10));
                        return (
                          <div key={subcategory.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group">
                            <div className="flex items-start gap-4 mb-4">
                              {subcategory.image || getCategoryImage(Number(subcategory.id)) ? (
                                <img
                                  src={buildImageUrl(getCategoryImage(Number(subcategory.id)) || subcategory.image)}
                                  alt={subcategory.name}
                                  className="w-16 h-16 object-cover rounded-xl border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                                  <Tag className="w-8 h-8 text-indigo-600" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-bold text-gray-900 text-lg">{subcategory.name}</h4>
                                  <span className="px-2 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full">
                                    فرعي
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-2">{subcategory.description}</p>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {parentCategory?.name || 'غير محدد'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {subcategoryProductsCount} منتج
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    subcategory.isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {subcategory.isActive ? 'نشط' : 'غير نشط'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => {
                                  setSelectedSubcategoryForEdit(subcategory);
                                  setShowSubcategoryModal(true);
                                }}
                                className="flex-1 bg-indigo-600 text-white px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                              >
                                <Edit className="w-4 h-4" />
                                تعديل
                              </button>
                              <button
                                onClick={() => openDeleteModal('subcategory', subcategory.id, subcategory.name)}
                                className="flex-1 bg-red-600 text-white px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                حذف
                              </button>
                            </div>
                          </div>
                        );
                      }) : []
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Tag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">لا توجد تصنيفات فرعية</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">ابدأ بإضافة تصنيفات فرعية لتنظيم منتجاتك بشكل أفضل. اختر التصنيف الرئيسي من الأعلى ثم اضغط إضافة تصنيف فرعي</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Employee Management Tab - Admin Only */}
          {currentTab === 'employees' && currentUser?.role === 'admin' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Users className="w-8 h-8" />
                       إدارة الموظفين
                    </h2>
                    <p className="text-gray-200 mt-2">إدارة حسابات الموظفين وصلاحياتهم في النظام</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
                    >
                      <Plus className="w-5 h-5 ml-2" />
                      إضافة موظف جديد
                    </button>
              <button
  onClick={() => setShowPasswordModal(true)}
  className="inline-flex items-center justify-center px-6 py-3 bg-red-900 text-white rounded-xl hover:bg-red-800 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
>
  <Key className="w-5 h-5 ml-2" />
  تغيير كلمة مروري
</button>
<button
  onClick={() => setShowChangePinModal(true)}
  className="inline-flex items-center justify-center px-6 py-3 bg-purple-900 text-white rounded-xl hover:bg-purple-800 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
>
  <Shield className="w-5 h-5 ml-2" />
  تغيير رمز PIN
</button>



                    <button 
                      onClick={() => {
                        setActiveLogsTab('activity');
                        setShowLogsModal(true);
                        fetchActivityLogs();
                      }}
                      className="inline-flex items-center justify-center px-6 py-3 bg-blue-500/20 text-white rounded-xl hover:bg-blue-500/30 transition-all duration-300 font-medium backdrop-blur-sm border border-blue-300/20"
                    >
                      <Activity className="w-5 h-5 ml-2" />
                      سجلات النشاط
                    </button>
                    <button 
                      onClick={() => {
                        setActiveLogsTab('login');
                        setShowLogsModal(true);
                        fetchLoginLogs();
                      }}
                      className="inline-flex items-center justify-center px-6 py-3 bg-green-500/20 text-white rounded-xl hover:bg-green-500/30 transition-all duration-300 font-medium backdrop-blur-sm border border-green-300/20"
                    >
                      <LogIn className="w-5 h-5 ml-2" />
                      سجلات الدخول
                    </button>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="البحث في الموظفين..."
                      value={userSearchTerm}
                      onChange={handleUserSearch}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm min-w-[150px]"
                  >
                    <option value="all">جميع الأدوار</option>
                    <option value="admin">مدير</option>
                    <option value="employee">موظف</option>
                  </select>
                </div>
              </div>

              {/* Employee Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">إجمالي الموظفين</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{filteredUsers.length}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">المديرين</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{filteredUsers.filter(u => u.role === 'admin').length}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <Settings className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">الموظفين</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{filteredUsers.filter(u => u.role === 'staff').length}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="w-full">
                {/* Employees List */}
                <div className="w-full">
                  {filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد موظفين</h3>
                      <p className="text-gray-600 mb-6">ابدأ بإضافة موظفين للنظام</p>
                      <button
                        onClick={() => setShowUserModal(true)}
                        className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة أول موظف
                      </button>
                    </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-black border-b border-gray-200">
                        <tr>
                          <th className="text-right py-4 px-6 font-semibold text-white">الموظف</th>
                          <th className="text-right py-4 px-6 font-semibold text-white">البريد الإلكتروني</th>
                          <th className="text-right py-4 px-6 font-semibold text-white">الدور</th>
                          <th className="text-right py-4 px-6 font-semibold text-white">تاريخ الإنضمام</th>
                          <th className="text-right py-4 px-6 font-semibold text-white">الحالة</th>
                          <th className="text-right py-4 px-6 font-semibold text-white">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{user.name}</p>
                                  <p className="text-sm text-gray-600">{user.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-gray-900">{user.email}</td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role === 'admin' ? 'مدير' : 'موظف'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                نشط
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingUser(user);
                                    setNewUser({ ...user });
                                    setShowUserModal(true);
                                  }}
                                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10"
                                  title="تعديل"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowPasswordModal(true);
                                  }}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-green-400/20"
                                  title="تغيير كلمة المرور"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setShowDeleteUserModal(true);
                                  }}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-red-400/20"
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
                </div>
              )}
                </div>


              </div>
            </div>
          )}

          

          {/* Collections Tab */}    
          {currentTab === 'collections' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Package className="w-8 h-8" />
                       نظام إدارة المجموعات
                    </h2>
                    <p className="text-gray-200 mt-2">إدارة وتنظيم مجموعات المنتجات بكفاءة عالية</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setSelectedCollectionForEdit(null);
                        setShowCollectionModal(true);
                      }}
                      className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة مجموعة جديدة
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalCollections}</div>
                      <div className="text-sm text-gray-500">إجمالي المجموعات</div>
                    </div>
                  </div>
                </div> 
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{filteredCollections.length}</div>
                      <div className="text-sm text-gray-500">المجموعات المعروضة</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{stats.totalProducts}</div>
                      <div className="text-sm text-gray-500">إجمالي المنتجات</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث عن مجموعة..."
                    value={collectionSearchTerm}
                    onChange={handleCollectionSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Collections List */}
              {!Array.isArray(filteredCollections) || filteredCollections.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مجموعات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة مجموعات جديدة لمتجرك</p>
                  <button
                    onClick={() => {
                      setSelectedCollectionForEdit(null);
                      setShowCollectionModal(true);
                    }}
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-medium"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول مجموعة
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {Array.isArray(filteredCollections) && filteredCollections.map((collection) => (
                      <div key={collection._id || collection.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {collection.image ? (
                              <img 
                                src={collection.image} 
                                alt={collection.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{collection.name?.ar || collection.name?.en || 'مجموعة بدون اسم'}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {collection.type === 'manual' ? 'مجموعة يدوية' : 'مجموعة تلقائية'} • {collection._productsCount !== undefined ? collection._productsCount : (collection.products?.length || 0)} منتج
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {new Date(collection.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button
                                  onClick={() => {
                                    setSelectedCollectionForEdit(collection);
                                    setShowCollectionModal(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteModal({ 
                                      isOpen: true, 
                                      id: collection.id, 
                                      type: 'collection',
                                      name: collection.name,
                                      loading: false
                                    });
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-black">
                          <tr>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">المجموعة</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">عدد المنتجات</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">تاريخ الإنشاء</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Array.isArray(filteredCollections) && filteredCollections.map((collection) => (
                            <tr key={collection._id || collection.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 ml-4 flex-shrink-0">
                                    {collection.image ? (
                                      <img 
                                        src={collection.image} 
                                        alt={collection.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <Package className="w-4 h-4 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{collection.name?.ar || collection.name?.en || 'مجموعة بدون اسم'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {collection._productsCount !== undefined ? collection._productsCount : (collection.products?.length || 0)} منتج
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {new Date(collection.createdAt).toLocaleDateString('ar-SA')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                  <button
                                    onClick={() => {
                                      setSelectedCollectionForEdit(collection);
                                      setShowCollectionModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteModal({ 
                                        isOpen: true, 
                                        id: collection._id, 
                                        type: 'collection',
                                        name: collection.name,
                                        loading: false
                                      });
                                    }}
                                    className="text-red-600 hover:text-red-900 transition-colors"
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
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Blog Tab */}
          {currentTab === 'blog' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <FileText className="w-8 h-8" />
                       نظام إدارة المدونة
                    </h2>
                    <p className="text-gray-200 mt-2">إدارة مقالات ومحتوى المدونة</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleAddBlogPost}
                      className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة مقال جديد
                    </button>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث في المقالات..."
                      value={blogSearchTerm}
                      onChange={(e) => setBlogSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    عرض {filteredBlogPosts.length} من {blogPosts.length} مقال
                  </div>
                </div>
              </div>

              {/* Blog Posts Grid */}
              {filteredBlogPosts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مقالات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة مقالات لمدونتك</p>
                  <button
                    onClick={handleAddBlogPost}
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-medium"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول مقال
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlogPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Featured Image */}
                      <div className="aspect-video bg-gray-100 relative overflow-hidden">
                        {post.featuredImage ? (
                          <img
                            src={buildImageUrl(post.featuredImage)}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                            {post.title}
                          </h3>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>بواسطة {post.author}</span>
                          <span>{new Date(post.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>

                        {/* Categories */}
                        {post.categories && post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.categories.slice(0, 3).map((category, index) => (
                              <span key={`${post.id}-category-${category}-${index}`} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                                {category}
                              </span>
                            ))}
                            {post.categories.length > 3 && (
                              <span className="text-gray-500 text-xs">+{post.categories.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBlogPost(post)}
                            className="flex-1 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDeleteBlogPost(post)}
                            className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Testimonials Tab */}
          {currentTab === 'testimonials' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-2xl p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold">💬 نظام إدارة شهادات العملاء</h2>
                    <p className="text-gray-200 text-lg">إدارة شاملة لآراء وتقييمات العملاء وتجاربهم</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleAddTestimonial}
                      className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold backdrop-blur-sm border border-white/20"
                    >
                      <Plus className="w-5 h-5 ml-2" />
                      إضافة شهادة جديد
                    </button>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث في شهادات العملاء ..."
                      value={testimonialSearchTerm}
                      onChange={(e) => setTestimonialSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <select
                    value={testimonialStatusFilter}
                    onChange={(e) => setTestimonialStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm bg-white"
                  >
                    <option value="all">جميع الآراء</option>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="featured">مميز</option>
                  </select>
                  <div className="text-sm text-gray-600 flex items-center">
                    عرض {filteredTestimonials.length} من {testimonials.length} رأي
                  </div>
                </div>
              </div>

              {/* Testimonials Grid */}
              {filteredTestimonials.length === 0 ? (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد آراء</h3>
    <p className="text-gray-600 mb-6">ابدأ بإضافة شهادات العملاء</p>
    <button
      onClick={handleAddTestimonial}
      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      <Plus className="w-4 h-4 ml-2" />
      إضافة أول رأي
    </button>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {filteredTestimonials.map(testimonial => (
      <div key={testimonial.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <div className="bg-black text-white p-5 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {testimonial.image ? (
                <img
                  src={buildImageUrl(testimonial.image)}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-7 h-7 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-xl tracking-tight">{testimonial.name}</h3>
                {testimonial.position && (
                  <p className="text-gray-300 text-sm mt-1">{testimonial.position}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-green-500 text-white">
                نشط
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex justify-between">
          <div className="flex flex-col gap-4">
            {/* Testimonial Text */}
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-1">
              {testimonial.testimonial}
            </p>
            {/* Date */}
            <div className="text-sm text-gray-500 font-medium">
              {new Date(testimonial.createdAt).toLocaleDateString('ar-SA')}
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-row gap-3">
            <button
              onClick={() => {
                setEditingTestimonial(testimonial);
                setIsTestimonialModalOpen(true);
              }}
              className="p-3 bg-gradient-to-r from-gray-900 to-black text-white hover:from-gray-800 hover:to-gray-900 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="تعديل"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => openDeleteModal('testimonial', testimonial.id, testimonial.name)}
              className="p-3 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="حذف"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
            </div>
          )}

          {/* Clients Tab */}
          {currentTab === 'clients' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-2xl p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold">🏢 نظام إدارة العملاء المميزون</h2>
                    <p className="text-gray-200 text-lg">إدارة شاملة لقائمة العملاء والشركاء المميزين</p>
                  </div>
                  <div className="flex gap-4">
                    
                    <button
                      onClick={handleAddClient}
                      className="inline-flex items-center px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold backdrop-blur-sm border border-white/20"
                    >
                      <Plus className="w-5 h-5 ml-2" />
                      إضافة عميل جديد
                    </button>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="البحث في العملاء..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'featured')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">جميع العملاء</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="featured">مميز</option>
                </select>
              </div>

              {/* Clients Grid */}
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عملاء</h3>
                  <p className="text-gray-500 mb-6">ابدأ بإضافة عملائك الأوائل</p>
                  <button
                    onClick={handleAddClient}
                    className="inline-flex items-center px-6 py-3 bg-black/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm border border-white/20"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة عميل جديد
                  </button>
                </div>
              ) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {filteredClients.map((client, idx) => (
    <div
      key={(client as any).id ?? `${client.name}-${client.website ?? ''}-${(client as any).createdAt ?? ''}-${idx}`}
      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="bg-black text-white p-5 rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {client.logo ? (
              <img
                src={buildImageUrl(client.logo)}
                alt={client.name}
                className="w-14 h-14 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-xl tracking-tight">{client.name}</h3>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-green-500 text-white">
              نشط
            </span>
          </div>
        </div>
      </div>
      <div className="p-6 flex justify-between">
        <div className="flex flex-col gap-4">
          {/* Website Info */}
          {client.website && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Globe className="w-5 h-5" />
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                زيارة الموقع
              </a>
            </div>
          )}

          {/* Date */}
          <div className="text-sm text-gray-500 font-medium">
            {new Date(client.createdAt).toLocaleDateString('ar-SA')}
          </div>
        </div>
        {/* Actions */}
        <div className="flex flex-row gap-3">
          <button
            onClick={() => {
              setEditingClient(client);
              setIsClientModalOpen(true);
            }}
            className="p-3 bg-gradient-to-r from-gray-900 to-black text-white hover:from-gray-800 hover:to-gray-900 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            title="تعديل"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => openDeleteModal('client', client.id, client.name)}
            className="p-3 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            title="حذف"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  ))}
</div>   )}
            </div>
          )}

          {/* Orders Tab */}
          {currentTab === 'orders' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <ShoppingCart className="w-8 h-8" />
                       نظام إدارة الطلبات
                    </h2>
                    <p className="text-gray-200 mt-2">متابعة ومعالجة جميع طلبات العملاء بكفاءة عالية</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'في الانتظار', count: orders.filter(o => o.status === 'pending').length, color: 'bg-gray-50 border-gray-200 text-black' },
                  { label: 'مؤكد', count: orders.filter(o => o.status === 'confirmed').length, color: 'bg-gray-100 border-gray-300 text-black' },
                  { label: 'قيد التحضير', count: orders.filter(o => o.status === 'preparing').length, color: 'bg-gray-200 border-gray-400 text-black' },
                  { label: 'تم التسليم', count: orders.filter(o => o.status === 'delivered').length, color: 'bg-black border-black text-white' },
                  { label: 'ملغية', count: orders.filter(o => o.status === 'cancelled').length, color: 'bg-gray-600 border-gray-700 text-white' }
                ].map((stat, index) => (
                  <div key={`order-stat-${index}-${stat.label}`} className={`${stat.color} border rounded-xl p-4 text-center`}>
                    <div className="text-2xl font-bold mb-1">{stat.count}</div>
                    <div className="text-sm font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث في الطلبات..."
                      value={orderSearchTerm}
                      onChange={handleOrderSearch}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <select
                    value={orderStatusFilter}
                    onChange={handleOrderStatusFilter}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm bg-white"
                  >
                    <option value="all">جميع الطلبات</option>
                    <option value="pending">قيد المراجعة</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="preparing">قيد التحضير</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                  <div className="text-sm text-gray-600 flex items-center">
                    عرض {filteredOrders.length} من {orders.length} طلب
                  </div>
                </div>
              </div>

              {/* Orders List - Mobile First */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
                  <p className="text-gray-600">لم يتم العثور على طلبات تطابق معايير البحث</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile Cards */}
                  <div className="grid grid-cols-1 gap-4 lg:hidden">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-base sm:text-lg text-gray-900">طلب #{order.id}</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">{order.customerName}</p>
                          </div>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(order.status)}`}>
                            {getOrderStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-gray-600 text-sm">المبلغ الإجمالي</span>
                            <div className="font-bold text-lg text-black">{order.total.toFixed(2)} ر.س</div>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">عدد المنتجات</span>
                            <div className="font-bold text-lg text-black">{order.items.length}</div>
                          </div>
                        </div>

                        {/* Notes Section for Mobile */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm font-medium">الملاحظات</span>
                            <button
                              onClick={() => handleEditOrderNotes(order.id, order.notes || '')}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                              title="تحرير الملاحظات"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                          {editingOrderNotes === order.id ? (
                            <div className="flex items-center gap-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none"
                                rows={2}
                                placeholder="أضف ملاحظة..."
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleSaveOrderNotes(order.id)}
                                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                  title="حفظ"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEditNotes}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                  title="إلغاء"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-3">
                              {order.notes ? (
                                <p className="text-sm text-gray-700">{order.notes}</p>
                              ) : (
                                <p className="text-sm text-gray-400 italic">لا توجد ملاحظات</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="flex-1 bg-black text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 transition-all duration-300"
                          >
                            عرض التفاصيل
                          </button>
                          <button
                            onClick={() => openDeleteModal('order', order.id, `طلب #${order.id}`)}
                            className="flex-1 bg-red-500/20 text-red-600 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-red-500/30 transition-all duration-300 backdrop-blur-sm border border-red-400/20"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-black">
                          <tr>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">رقم الطلب</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">العميل</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">المبلغ</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">الحالة</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">الملاحظات</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">التاريخ</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-semibold text-gray-900">#{order.id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="font-medium text-gray-900">{order.customerName}</div>
                                  <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-bold text-black">{order.total.toFixed(2)} ر.س</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                  className={`text-sm font-medium px-3 py-1 rounded-full border ${getOrderStatusColor(order.status)}`}
                                >
                                  <option value="pending">قيد المراجعة</option>
                                  <option value="confirmed">مؤكد</option>
                                  <option value="preparing">قيد التحضير</option>
                                  <option value="delivered">تم التسليم</option>
                                  <option value="cancelled">ملغي</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <div className="max-w-xs">
                                  {editingOrderNotes === order.id ? (
                                    <div className="flex items-center gap-2">
                                      <textarea
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none"
                                        rows={2}
                                        placeholder="أضف ملاحظة..."
                                      />
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={() => handleSaveOrderNotes(order.id)}
                                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                          title="حفظ"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={handleCancelEditNotes}
                                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                          title="إلغاء"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1">
                                        {order.notes ? (
                                          <p className="text-sm text-gray-700 line-clamp-2">{order.notes}</p>
                                        ) : (
                                          <p className="text-sm text-gray-400 italic">لا توجد ملاحظات</p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleEditOrderNotes(order.id, order.notes || '')}
                                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                                        title="تحرير الملاحظات"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openOrderModal(order)}
                                    className="p-2 text-white bg-black hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-300"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal('order', order.id, `طلب #${order.id}`)}
                                    className="p-2 text-red-300 hover:text-red-300 hover:bg-red-500/30 rounded-xl transition-all duration-300 backdrop-blur-sm border border-red-400/20"
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
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {currentTab === 'invoices' && (
            <div className="space-y-6">
              <InvoiceManagement orders={orders} />
            </div>
          )}

          {/* Shipping Tab */}
          {currentTab === 'shipping' && (
            <div className="space-y-6">
              <ShippingManagement />
            </div>
          )}

          {/* Coupons Tab */}
          {currentTab === 'coupons' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Tag className="w-8 h-8" />
                       نظام إدارة الكوبونات
                    </h2>
                    <p className="text-gray-200 mt-2">إدارة كوبونات الخصم والعروض الترويجية بكفاءة عالية</p>
                  </div>
                  <button
                    onClick={() => setShowCouponModal(true)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium border border-white/20"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة كوبون جديد
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="البحث في الكوبونات..."
                    value={couponSearchTerm}
                    onChange={handleCouponSearch}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Coupons Grid */}
              {filteredCoupons.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد كوبونات</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة كوبونات خصم جديدة</p>
                  <button
                    onClick={() => setShowCouponModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول كوبون
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCoupons.map(coupon => (
                    <div key={coupon.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h3 className="font-bold text-base sm:text-lg text-gray-900">{coupon.name}</h3>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                            coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {coupon.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                        
                        <div className="mb-4 sm:mb-6">
                          <div className="bg-black text-white font-bold text-lg sm:text-xl px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-center">
                            {coupon.code}
                          </div>
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{coupon.description}</p>
                          
                          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs sm:text-sm text-gray-500">نوع الخصم:</span>
                              <span className="text-xs sm:text-sm font-medium">
                                {coupon.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs sm:text-sm text-gray-500">قيمة الخصم:</span>
                              <span className="text-xs sm:text-sm font-bold text-black">
                                {coupon.discountType === 'percentage' 
                                  ? `${coupon.discountValue}%` 
                                  : `${coupon.discountValue} ر.س`
                                }
                              </span>
                            </div>
                            {coupon.usageLimit && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">الاستخدام:</span>
                                <span className="text-sm">
                                  {coupon.usedCount || 0} / {coupon.usageLimit}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => {
                              setSelectedCouponForEdit(coupon);
                              setShowCouponModal(true);
                            }}
                            className="flex-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-200 transition-all duration-300 backdrop-blur-sm border border-gray-200"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => openDeleteModal('coupon', coupon.id, coupon.name)}
                            className="flex-1 bg-red-500/20 text-red-600 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-red-500/30 transition-all duration-300 backdrop-blur-sm border border-red-400/20"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Overview Tab */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="bg-black rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">مرحباً بك في لوحة تحكم AfterAds</h2>
                    <p className="text-gray-300 mb-4">إليك نظرة شاملة على أداء موقعك اليوم</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                        {new Date().toLocaleDateString('ar-SA')}
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
                        {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* نظام التنبيهات */}
              <div className="space-y-4">
                {/* تنبيهات الطلبات المعلقة */}
                {orders.filter(order => order.status === 'pending').length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center ml-3">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-800">طلبات معلقة تحتاج لمراجعة</h4>
                        <p className="text-yellow-700 text-sm">
                          لديك {orders.filter(order => order.status === 'pending').length} طلب معلق يحتاج للمراجعة والموافقة
                        </p>
                      </div>
                      <button 
                        onClick={() => switchTab('orders')}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                      >
                        مراجعة الطلبات
                      </button>
                    </div>
                  </div>
                )}

                {/* تنبيهات الطلبات المتأخرة */}
                {(() => {
                  const delayedOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    const daysDiff = Math.floor((new Date().getTime() - orderDate.getTime()) / (1000 * 3600 * 24));
                    return (order.status === 'confirmed' || order.status === 'preparing') && daysDiff > 3;
                  });
                  return delayedOrders.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center ml-3">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-800">طلبات متأخرة</h4>
                          <p className="text-red-700 text-sm">
                            لديك {delayedOrders.length} طلب متأخر أكثر من 3 أيام ويحتاج لمتابعة عاجلة
                          </p>
                        </div>
                        <button 
                          onClick={() => switchTab('orders')}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          متابعة الطلبات
                        </button>
                      </div>
                    </div>
                  );
                })()}



                {/* تنبيهات المنتجات غير المتوفرة */}
                {products.filter(product => !product.isAvailable).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center ml-3">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-800">منتجات غير متوفرة</h4>
                        <p className="text-red-700 text-sm">
                          لديك {products.filter(product => !product.isAvailable).length} المنتج غير متوفرة حالياً
                        </p>
                      </div>
                      <button 
                        onClick={() => switchTab('products')}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        تحديث التوفر
                      </button>
                    </div>
                  </div>
                )}

                {/* تنبيهات المنتجات الجديدة المضافة اليوم */}
                {(() => {
                  const today = new Date().toDateString();
                  const newProducts = products.filter(product => 
                    product.createdAt && new Date(product.createdAt).toDateString() === today
                  );
                  return newProducts.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center ml-3">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800">منتجات جديدة مضافة اليوم</h4>
                          <p className="text-green-700 text-sm">
                            تم إضافة {newProducts.length} منتج جديدة اليوم بواسطة فريق العمل
                          </p>
                        </div>
                        <button 
                          onClick={() => switchTab('products')}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          عرض المنتجات
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* البطاقات السريعة الجديدة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* إجمالي الطلبات */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                      <div className="text-sm text-gray-500">إجمالي الطلبات</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">اليوم:</span>
                      <span className="font-medium text-black">{stats.todayOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">هذا الأسبوع:</span>
                      <span className="font-medium text-black">{stats.weekOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">هذا الشهر:</span>
                      <span className="font-medium text-black">{stats.monthOrders}</span>
                    </div>
                  </div>
                </div>

                {/* إجمالي المبيعات */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.monthRevenue.toFixed(0)}</div>
                      <div className="text-sm text-gray-500">مبيعات الشهر (ر.س)</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600"> إجمالي المبيعات :</span>
                      <span className="font-medium text-black">{stats.totalRevenue.toFixed(0)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">متوسط الطلب :</span>
                      <span className="font-medium text-black">{stats.averageOrderValue.toFixed(0)} ر.س</span>
                    </div>
                  </div>
                </div>

                {/* عدد المنتجات المفعلة */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.activeProducts}</div>
                      <div className="text-sm text-gray-500">المنتجات المفعلة</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الإجمالي:</span>
                      <span className="font-medium">{stats.totalProducts}</span>
                    </div>
                    <div className={`flex justify-between ${stats.unavailableProducts > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  <span>غير متوفر:</span>
                  <span className="font-medium">{stats.unavailableProducts}</span>
                </div>
                  </div>
                </div>

                {/* عدد العملاء المسجلين */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
                      <div className="text-sm text-gray-500">العملاء المسجلين</div>
                    </div>
                  </div>
                  <div className="text-sm text-black font-medium">
                    عملاء نشطين
                  </div>
                </div>
              </div>

              {/* الصف الثاني من البطاقات */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* الطلبات قيد التنفيذ */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.inProgressOrders}</div>
                      <div className="text-sm text-gray-500">قيد التنفيذ</div>
                    </div>
                  </div>
                  <div className="text-sm text-black font-medium">
                    طلبات جاري تنفيذها
                  </div>
                </div>

                {/* الطلبات المكتملة */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.completedOrders}</div>
                      <div className="text-sm text-gray-500">مكتملة</div>
                    </div>
                  </div>
                  <div className="text-sm text-black font-medium">
                    طلبات مكتملة بنجاح
                  </div>
                </div>

                {/* عدد الزوار */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{visitorStats.monthlyVisitors}</div>
                      <div className="text-sm text-gray-500">زوار الشهر</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">اليوم:</span>
                      <span className="font-medium text-black">{visitorStats.dailyVisitors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الأسبوع:</span>
                      <span className="font-medium text-black">{visitorStats.weeklyVisitors}</span>
                    </div>
                  </div>
                </div>

                {/* التارجت الشهري */}
                <div className="bg-gradient-to-r from-gray-800 to-black rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      {isEditingTarget ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setMonthlyTarget(tempTarget);
                              localStorage.setItem('monthlyTarget', tempTarget.toString());
                              setIsEditingTarget(false);
                              smartToast.dashboard.success('تم تحديث التارجت بنجاح');
                            }}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 text-xs"
                          >
                            حفظ
                          </button>
                          <input
                            type="number"
                            value={tempTarget}
                            onChange={(e) => setTempTarget(Number(e.target.value))}
                            className="w-20 text-right bg-white bg-opacity-20 rounded px-2 py-1 text-sm"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">{monthlyTarget.toLocaleString()}</div>
                          <div className="text-sm opacity-90">التارجت الشهري (ر.س)</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setTempTarget(monthlyTarget);
                        setIsEditingTarget(!isEditingTarget);
                      }}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                    >
                      {isEditingTarget ? 'إلغاء' : 'تعديل التارجت'}
                    </button>
                    <div className="text-sm">
                      <div className="opacity-90">
                        التقدم: {((stats.monthRevenue / monthlyTarget) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* قسم المبيعات */}
              <div className="bg-gradient-to-r from-black to-black rounded-xl p-6 border border-black">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gray rounded-lg flex items-center justify-center ml-3">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">قسم المبيعات والإيرادات</h2>
                </div>
              </div>

              {/* الرسوم البيانية - المبيعات */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* رسم بياني للمبيعات خلال آخر 30 يوم */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <BarChart3 className="w-5 h-5 ml-2" />
                      المبيعات خلال آخر 30 يوم
                    </h3>
                    <div className="text-sm text-gray-500">
                      إجمالي: {dailySalesData.reduce((sum, day) => sum + day.sales, 0).toFixed(0)} ر.س
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailySalesData.slice(-30)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#666"
                          fontSize={10}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={"preserveStartEnd"}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'sales' ? `${value} ر.س` : value,
                            name === 'sales' ? 'المبيعات' : 'الطلبات'
                          ]}
                          labelFormatter={(value) => {
                            return `التاريخ: ${value}`;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#000000" 
                          strokeWidth={3}
                          dot={{ fill: '#000000', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#000000', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* رسم بياني للطلبات حسب الحالة */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* الهيدر */}
  <div className="bg-black text-white px-6 py-3 flex items-center">
    <PieChart className="w-5 h-5 ml-2" />
    <h3 className="text-lg font-bold">الطلبات حسب الحالة</h3>
  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'مكتملة', value: stats.completedOrders, color: '#000000' },
                            { name: 'قيد التنفيذ', value: stats.inProgressOrders, color: '#666666' },
                            { name: 'معلقة', value: stats.pendingOrders, color: '#999999' },
                            { name: 'جديدة', value: orders.filter(o => o.status === 'pending').length, color: '#cccccc' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: 'مكتملة', value: stats.completedOrders, color: '#000000' },
                            { name: 'قيد التنفيذ', value: stats.inProgressOrders, color: '#666666' },
                            { name: 'معلقة', value: stats.pendingOrders, color: '#999999' },
                            { name: 'جديدة', value: orders.filter(o => o.status === 'pending').length, color: '#cccccc' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          formatter={(value, entry) => (
                            <span style={{ color: entry.color, fontSize: '12px' }}>{value}</span>
                          )}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

             {/* أفضل 3 منتجات مبيعاً */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* الهيدر */}
  <div className="bg-black text-white px-6 py-3">
    <h3 className="text-lg font-bold flex items-center">
      <TrendingUp className="w-5 h-5 ml-2" />
      أفضل 3 منتجات مبيعاً
    </h3>
  </div>

  {/* المحتوى */}
  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
    {(() => {
      // حساب أفضل 3 منتجات من الطلبات
      interface ProductSalesData {
        name: string;
        quantity: number;
        revenue: number;
        image?: string;
      }

      const productSales: { [key: number]: ProductSalesData } = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (productSales[item.productId]) {
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.totalPrice;
          } else {
            productSales[item.productId] = {
              name: item.productName,
              quantity: item.quantity,
              revenue: item.totalPrice,
              image: item.productImage
            };
          }
        });
      });

      const topProducts: ProductSalesData[] = Object.values(productSales)
        .sort((a: ProductSalesData, b: ProductSalesData) => b.revenue - a.revenue)
        .slice(0, 3);

      return topProducts.length > 0 ? topProducts.map((product: ProductSalesData, index: number) => (
        <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center mb-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                index === 0 ? 'bg-black' : index === 1 ? 'bg-gray-600' : 'bg-gray-400'
              }`}
            >
              {index + 1}
            </div>
            <div className="mr-3 flex-1">
              <h4 className="font-bold text-gray-900 text-sm truncate">{product.name}</h4>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">المبيعات:</span>
              <span className="font-bold text-black">{product.revenue.toFixed(0)} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الكمية:</span>
              <span className="font-bold text-gray-700">{product.quantity}</span>
            </div>
          </div>
        </div>
      )) : (
        <div className="col-span-3 text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">لا توجد بيانات مبيعات بعد</p>
        </div>
      );
    })()}
  </div>
</div>


             {/* قسم الطلبات والمنتجات */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
  {/* الهيدر */}
  <div className="bg-black text-white px-6 py-3 flex items-center justify-between">
    <div className="flex items-center">
      <ShoppingCart className="w-6 h-6 ml-3" />
      <h2 className="text-lg font-bold">الطلبات والمنتجات</h2>
    </div>
    
  </div>

  {/* المحتوى */}
  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* إجمالي الطلبات */}
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black text-sm font-medium">إجمالي الطلبات</p>
          <p className="text-3xl font-bold text-gray-900">{(orders ?? []).length}</p>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-black" />
        </div>
      </div>
    </div>

    {/* الطلبات الجديدة */}
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700 text-sm font-medium">الطلبات الجديدة</p>
          <p className="text-3xl font-bold text-gray-900">
            {(orders ?? []).filter(order => order.status === 'pending').length}
          </p>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <Clock className="w-6 h-6 text-gray-700" />
        </div>
      </div>
    </div>


                  {/* الطلبات المكتملة */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">الطلبات المكتملة</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  {/* إجمالي المنتجات */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">إجمالي المنتجات</p>
                        <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* قسم الزوار والإحصائيات */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
  {/* الهيدر */}
  <div className="bg-black text-white px-6 py-3 flex items-center">
    <Eye className="w-6 h-6 ml-3 text-white" />
    <h2 className="text-lg font-bold">الزوار والإحصائيات</h2>
  </div>

  {/* المحتوى */}
  <div className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* إجمالي الزوار */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-black text-sm font-medium">إجمالي الزوار</p>
            <p className="text-3xl font-bold text-gray-900">{visitorStats.totalVisitors.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      {/* زوار اليوم */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700 text-sm font-medium">زوار اليوم</p>
            <p className="text-3xl font-bold text-gray-900">{visitorStats.dailyVisitors.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </div>

      {/* زوار الأسبوع */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">زوار الأسبوع</p>
            <p className="text-3xl font-bold text-gray-900">{visitorStats.weeklyVisitors.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>

      {/* زوار الشهر */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">زوار الشهر</p>
            <p className="text-3xl font-bold text-gray-900">{visitorStats.monthlyVisitors.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  </div>


              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                  
                 {/* آخر 5 طلبات جديدة */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* الهيدر */}
  <div className="bg-black text-white px-6 py-3 flex items-center justify-between">
    <h3 className="text-lg font-bold flex items-center">
      <ShoppingCart className="w-5 h-5 ml-2 text-white" />
      آخر 5 طلبات جديدة
    </h3>
    <button 
      onClick={() => switchTab('orders')}
      className="text-sm font-medium bg-white text-black px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
    >
      عرض الكل
    </button>
  </div>

  {/* المحتوى */}
  <div className="p-6">
    {orders.length === 0 ? (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">لا توجد طلبات بعد</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-4 font-semibold text-gray-700">اسم العميل</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">المنتج المطلوبة</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">الحالة</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map(order => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.customerPhone}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    {order.items.length > 0 ? (
                      <>
                        <p className="font-medium text-gray-900">{order.items[0].productName}</p>
                        {order.items.length > 1 && (
                          <p className="text-sm text-gray-500">+{order.items.length - 1} منتجات أخرى</p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500">لا توجد منتجات</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getOrderStatusText(order.status)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>


                 {/* Top Products */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* الهيدر */}
  <div className="bg-black text-white px-6 py-3 flex items-center justify-between">
    <h3 className="text-lg font-bold flex items-center">
      <Package className="w-5 h-5 ml-2 text-white" />
      المنتجات الأكثر مبيعاً
    </h3>
    <button 
      onClick={() => switchTab('products')}
      className="text-sm font-medium bg-white text-black px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
    >
      عرض الكل
    </button>
  </div>

  {/* المحتوى */}
  <div className="p-6 space-y-3">
    {products.length === 0 ? (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">لا توجد منتجات بعد</p>
      </div>
    ) : (
      products.slice(0, 5).map((product, index) => (
        <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
              #{index + 1}
            </div>
            <div className="mr-4">
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500">حالة التوفر: {product.isAvailable ? 'متوفر' : 'غير متوفر'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">{product.price.toFixed(2)} ر.س</p>
            <p className="text-sm text-gray-500">منتج</p>
          </div>
        </div>
      ))
    )}
  </div>
</div>

{/* أحدث التعليقات */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* الهيدر */}
  <div className="bg-black text-white px-6 py-3 flex items-center justify-between">
    <h3 className="text-lg font-bold flex items-center">
      <MessageCircle className="w-5 h-5 ml-2 text-white" />
      أحدث التعليقات
    </h3>
    <button 
      onClick={() => switchTab('comments')}
      className="text-sm font-medium bg-white text-black px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
    >
      عرض الكل
    </button>
  </div>

  {/* المحتوى */}
  <div className="p-6">
    {comments.length === 0 ? (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">لا توجد تعليقات بعد</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-4 font-semibold text-gray-700">اسم العميل</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">المنتج</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">التعليق</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {comments.slice(0, 5).map(comment => (
              <tr key={comment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center ml-3">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-medium text-gray-900">{comment.userName}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-gray-700 text-sm font-medium">
                    {comment.productName || 'منتج غير محدد'}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {comment.content.length > 80 
                      ? comment.content.substring(0, 80) + '...' 
                      : comment.content
                    }
                  </p>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="text-sm">
                    <p className="text-gray-900">{new Date(comment.createdAt).toLocaleDateString('ar-SA')}</p>
                    <p className="text-gray-500">{new Date(comment.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>
</div>



                {/* Right Column - Quick Stats and Actions */}
                <div className="space-y-6">
                  
              {/* Quick Actions */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200">
  {/* الهيدر */}
  <div className="flex items-center justify-between mb-6 bg-black text-white p-4 rounded-t-xl">
    <h3 className="text-xl font-bold flex items-center">
      <Zap className="w-5 h-5 ml-2 text-white" />
      إجراءات سريعة
    </h3>
  </div>

  {/* المحتوى */}
  <div className="p-6 grid grid-cols-1 gap-3">
    <button
      onClick={() => setShowProductModal(true)}
      className="flex items-center justify-center bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
    >
      <Plus className="w-5 h-5 ml-2" />
      إضافة منتج
    </button>    

    <button
      onClick={() => setShowCategoryModal(true)}
      className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
    >
      <Grid className="w-5 h-5 ml-2" />
      إضافة تصنيف
    </button>

    <button
      onClick={handleAddBlogPost}
      className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
    >
      <Plus className="w-5 h-5 ml-2" />
      إضافة مقال
    </button>

    <button
      onClick={() => setShowCouponModal(true)}
      className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
    >
      <Tag className="w-5 h-5 ml-2" />
      إضافة كوبون
    </button>
  </div>
</div>


{/* Inventory Alerts */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200">
  {/* الهيدر */}
  <div className="flex items-center justify-between mb-6 bg-black text-white p-4 rounded-t-xl">
    <h3 className="text-xl font-bold flex items-center">
      <AlertTriangle className="w-5 h-5 ml-2 text-white" />
      تنبيهات التوفر
    </h3>
  </div>

  {/* المحتوى */}
  <div className="p-6 space-y-3">
    {stats.unavailableProducts > 0 && (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-black ml-2" />
          <div>
            <p className="text-sm font-medium text-black">غير متوفر</p>
            <p className="text-xs text-gray-600">
              {stats.unavailableProducts} منتج غير متوفر
            </p>
          </div>
        </div>
      </div>
    )}

    {stats.unavailableProducts === 0 && (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-gray-600 ml-2" />
          <div>
            <p className="text-sm font-medium text-gray-600">جميع المنتجات متوفرة</p>
            <p className="text-xs text-gray-500">جميع المنتجات متاحة للعملاء</p>
          </div>
        </div>
      </div>
    )}
  </div>
</div>


{/* Store Performance */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200">
  {/* الهيدر */}
  <div className="flex items-center justify-between mb-6 bg-black text-white p-4 rounded-t-xl">
    <h3 className="text-xl font-bold flex items-center">
      <BarChart3 className="w-5 h-5 ml-2 text-white" />
      أداء المتجر
    </h3>
  </div>

  {/* المحتوى */}
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">معدل إتمام الطلبات</span>
      <span className="font-bold text-black">
        {stats.totalOrders > 0 
          ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) 
          : 0}%
      </span>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-black h-2 rounded-full transition-all duration-500"
        style={{ width: `${stats.totalOrders > 0 
          ? (stats.completedOrders / stats.totalOrders) * 100 
          : 0}%` }}
      ></div>
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">قيمة المنتجات الإجمالية</span>
      <span className="font-bold text-black">{stats.totalValue.toLocaleString('ar-SA')} ر.س</span>
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">عدد التصنيفات</span>
      <span className="font-bold text-gray-700">{stats.totalCategories}</span>
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">الكوبونات النشطة</span>
      <span className="font-bold text-gray-600">{stats.activeCoupons}</span>
    </div>
  </div>
</div>

</div>
</div>
</div>


          )}



          {/* Static Pages Tab */}
          {currentTab === 'static-pages' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <FileText className="w-8 h-8" />
                       نظام إدارة الصفحات الثابتة
                    </h2>
                    <p className="text-gray-200 mt-2">إنشاء وإدارة صفحات المحتوى الثابت للموقع بكفاءة عالية</p>
                  </div>
                  <button
                    onClick={() => setIsStaticPageModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-white/10 to-white/20 text-white px-6 py-3 rounded-xl hover:from-white/20 hover:to-white/30 transition-all duration-300 font-medium border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة صفحة جديدة
                  </button>
                </div>
              </div>

              {/* Static Pages List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {staticPages.length === 0 ? (
                  <div className="p-6">
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد صفحات ثابتة</h3>
                      <p className="text-gray-500 mb-6">ابدأ بإنشاء صفحة ثابتة جديدة لموقعك</p>
                      <button
                        onClick={() => setIsStaticPageModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black text-white px-6 py-3 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        إنشاء صفحة جديدة
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
  <table className="w-full rounded-lg overflow-hidden">
    <thead className="bg-black border-b border-gray-200">
      <tr>
        <th className="text-right py-3 px-6 text-sm font-medium text-white">العنوان</th>
        <th className="text-right py-3 px-6 text-sm font-medium text-white">الرابط</th>
        <th className="text-right py-3 px-6 text-sm font-medium text-white">الحالة</th>
        <th className="text-right py-3 px-6 text-sm font-medium text-white">تاريخ الإنشاء</th>
        <th className="text-center py-3 px-6 text-sm font-medium text-white">الإجراءات</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {staticPages && staticPages.length > 0 && staticPages.map((page) => (
        page && page.title ? (
          <tr key={page.id} className="hover:bg-gray-50">
            <td className="py-4 px-6">
              <div className="text-sm font-medium text-gray-900">{page.title}</div>
            </td>
            <td className="py-4 px-6">
              <div className="text-sm text-gray-600">/{page.slug}</div>
            </td>
            <td className="py-4 px-6">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                page.isActive ? 'bg-gray-100 text-gray-800' : 'bg-gray-200 text-gray-700'
              }`}>
                {page.isActive ? 'نشط' : 'غير نشط'}
              </span>
            </td>
            <td className="py-4 px-6">
              <div className="text-sm text-gray-600">
                {new Date(page.createdAt).toLocaleDateString('ar-SA')}
              </div>
            </td>
            <td className="py-4 px-6">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleEditStaticPage(page)}
                  className="p-2 bg-gradient-to-r from-gray-900 to-black text-white hover:from-gray-800 hover:to-gray-900 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteStaticPage(page)}
                  className="p-2 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ) : null
      ))}
    </tbody>
  </table>
</div>
                )}
              </div>
            </div>
          )}



          {currentTab === 'comments' && (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-black text-white p-5 rounded-t-2xl shadow-md border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">إدارة التعليقات</h1>
            <p className="text-gray-300 text-lg">عرض وإدارة جميع تعليقات العملاء على المنتجات</p>
          </div>
        </div>
      </div>
    </div>

    

    {/* Comments List */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-black text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">قائمة التعليقات</h3>
              <p className="text-gray-300 text-sm">إدارة تعليقات العملاء</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-white">{filteredComments.length} تعليق</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {commentsLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">جاري تحميل التعليقات...</p>
          </div>
        ) : filteredComments.length > 0 ? (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 hover:bg-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* User Header */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs sm:text-sm">
                          {(comment.userName || 'م').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-base sm:text-lg">{comment.userName || 'مجهول'}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm">{comment.userEmail}</p>
                      </div>
                    </div>
                    
                    {/* Comment Content */}
                    <div className="bg-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-gray-200">
                      <p className="text-gray-800 leading-relaxed text-sm sm:text-base">{comment.content}</p>
                    </div>
                    
                    {/* Comment Meta */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                        <span className="text-gray-600">المنتج:</span>
                        <span className="font-medium text-gray-900">{comment.productName}</span>
                      </div>
                      {comment.rating && (
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                          <span className="text-gray-600">التقييم:</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < (comment.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}>
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                        <span className="text-gray-600">التاريخ:</span>
                        <span className="font-medium text-gray-900">{new Date(comment.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mr-2 sm:mr-4">

                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                  className="p-2 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      title="حذف التعليق"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد تعليقات</h3>
            <p className="text-gray-600">لم يتم العثور على تعليقات حتى الآن</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

          {/* Analytics Tab */}
          {currentTab === 'analytics' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-black to-black text-white rounded-2xl p-8 mb-8 shadow-xl">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
    <div className="flex-1">
      <h1 className="text-3xl font-bold text-white mb-3">📊 نظام التحليلات والإحصائيات</h1>
      <p className="text-gray-200 text-lg leading-relaxed">
        تحليل شامل ومتقدم لأداء المتجر والمبيعات مع رؤى تفصيلية لاتخاذ قرارات مدروسة
      </p>
    </div>
   
  </div>
</div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Sales */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        {orders.reduce((total, order) => total + order.total, 0).toLocaleString('ar-SA')} ر.س
                      </div>
                      <div className="text-sm text-gray-600">إجمالي المبيعات</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-700 ml-1" />
                    <span className="text-gray-900 font-medium">
                      {(() => {
                        const currentMonth = orders.filter(order => {
                          const orderDate = new Date(order.createdAt);
                          const now = new Date();
                          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                        });
                        const lastMonth = orders.filter(order => {
                          const orderDate = new Date(order.createdAt);
                          const now = new Date();
                          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
                          return orderDate.getMonth() === lastMonthDate.getMonth() && orderDate.getFullYear() === lastMonthDate.getFullYear();
                        });
                        const currentTotal = currentMonth.reduce((total, order) => total + order.total, 0);
                        const lastTotal = lastMonth.reduce((total, order) => total + order.total, 0);
                        
                        if (lastTotal === 0 && currentTotal > 0) {
                          return '+100%';
                        } else if (lastTotal === 0 && currentTotal === 0) {
                          return '0%';
                        }
                        
                        const growth = ((currentTotal - lastTotal) / lastTotal * 100).toFixed(1);
                        return parseFloat(growth) >= 0 ? `+${growth}%` : `${growth}%`;
                      })()
                    }</span>
                    <span className="text-gray-600 mr-2">من الشهر الماضي</span>
                  </div>
                </div>

                {/* Products Sold */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        {orders.reduce((total, order) => total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">المنتجات المباعة</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-700 ml-1" />
                    <span className="text-black font-medium">
                      {(() => {
                        const currentMonth = orders.filter(order => {
                          const orderDate = new Date(order.createdAt);
                          const now = new Date();
                          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                        });
                        const lastMonth = orders.filter(order => {
                          const orderDate = new Date(order.createdAt);
                          const now = new Date();
                          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
                          return orderDate.getMonth() === lastMonthDate.getMonth() && orderDate.getFullYear() === lastMonthDate.getFullYear();
                        });
                        const currentItems = currentMonth.reduce((total, order) => total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0), 0);
                        const lastItems = lastMonth.reduce((total, order) => total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0), 0);
                        
                        if (lastItems === 0 && currentItems > 0) {
                          return '+100%';
                        } else if (lastItems === 0 && currentItems === 0) {
                          return '0%';
                        }
                        
                        const growth = ((currentItems - lastItems) / lastItems * 100).toFixed(1);
                        return parseFloat(growth) >= 0 ? `+${growth}%` : `${growth}%`;
                      })()
                    }</span>
                    <span className="text-gray-600 mr-2">من الشهر الماضي</span>
                  </div>
                </div>

                {/* Average Order Value */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {orders.length > 0 ? (orders.reduce((total, order) => total + order.total, 0) / orders.length).toFixed(0) : 0} ر.س
                      </div>
                      <div className="text-sm text-gray-600">متوسط قيمة الطلب</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-700 ml-1" />
                    <span className="text-gray-900 font-medium">
                      {(() => {
                        const currentMonth = orders.filter(order => {
                          const orderDate = new Date(order.createdAt);
                          const now = new Date();
                          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                        });
                        const lastMonth = orders.filter(order => {
                          const orderDate = new Date(order.createdAt);
                          const now = new Date();
                          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
                          return orderDate.getMonth() === lastMonthDate.getMonth() && orderDate.getFullYear() === lastMonthDate.getFullYear();
                        });
                        const currentAvg = currentMonth.length > 0 ? currentMonth.reduce((total, order) => total + order.total, 0) / currentMonth.length : 0;
                        const lastAvg = lastMonth.length > 0 ? lastMonth.reduce((total, order) => total + order.total, 0) / lastMonth.length : 0;
                        
                        if (lastAvg === 0 && currentAvg > 0) {
                          return '+100%';
                        } else if (lastAvg === 0 && currentAvg === 0) {
                          return '0%';
                        }
                        
                        const growth = ((currentAvg - lastAvg) / lastAvg * 100).toFixed(1);
                        return parseFloat(growth) >= 0 ? `+${growth}%` : `${growth}%`;
                      })()
                    }</span>
                    <span className="text-gray-600 mr-2">من الشهر الماضي</span>
                  </div>
                </div>

                {/* Visitors Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {visitorStats.monthlyVisitors.toLocaleString('ar-SA')}
                      </div>
                      <div className="text-sm text-gray-600">الزوار الشهريين</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-900 font-medium">
                      {visitorStats.dailyVisitors} يومياً
                    </span>
                    <span className="text-gray-600 mr-2">متوسط الزوار</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart - Enhanced to match Top Products card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center">
                      <BarChart3 className="w-5 h-5 ml-2" />
                      المبيعات الشهرية
                    </h3>
                    <div className="text-sm text-gray-300">
                      إجمالي: {dailySalesData.reduce((sum, day) => sum + day.sales, 0).toFixed(0)} ر.س
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="h-[30rem]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={dailySalesData.length > 0 ? dailySalesData : [
                            { date: 'لا توجد بيانات', sales: 0, orders: 0 }
                          ]}
                          margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#666"
                            fontSize={10}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={"preserveStartEnd"}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis 
                            stroke="#666" 
                            fontSize={12}
                            tickFormatter={(value) => {
                              if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}k`;
                              }
                              return value.toString();
                            }}
                          />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'sales' ? `${value} ر.س` : value,
                              name === 'sales' ? 'المبيعات' : 'الطلبات'
                            ]}
                            labelFormatter={(value) => {
                              return `التاريخ: ${value}`;
                            }}
                          />
                          <Bar 
                            dataKey="sales" 
                            fill="#000000" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold">🏆 أعلى المنتجات مبيعاً</h3>
                    <button className="text-sm text-gray-300 hover:text-white font-medium">عرض الكل</button>
                  </div>
                  <div className="p-6">
                  <div className="space-y-4">
                    {(() => {
                      const productSales: { [key: string]: number } = {};
                      orders.forEach(order => {
                        order.items.forEach(item => {
                          if (productSales[item.productName]) {
                            productSales[item.productName] += item.quantity;
                          } else {
                            productSales[item.productName] = item.quantity;
                          }
                        });
                      });
                      return Object.entries(productSales)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 5)
                        .map(([productName, quantity], index) => (
                          <div key={productName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{productName}</div>
                                <div className="text-sm text-gray-600">{quantity as number} قطعة مباعة</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-black h-2 rounded-full" 
                                  style={{ width: `${Math.min(((quantity as number) / Math.max(...Object.values(productSales))) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ));
                    })()}
                  </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Status Distribution 
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                */}

               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* العنوان */}
  <div className="bg-black text-white px-6 py-3">
    <h3 className="text-lg font-bold text-white">توزيع حالات الطلبات</h3>
  </div> 

  {/* المحتوى */}
  <div className="p-6 space-y-3">
    {[
      { status: 'delivered', label: 'مكتملة', count: orders.filter(o => o.status === 'delivered').length, color: 'bg-green-500' },
      { status: 'confirmed', label: 'مؤكدة', count: orders.filter(o => o.status === 'confirmed').length, color: 'bg-emerald-500' },
      { status: 'preparing', label: 'قيد التحضير', count: orders.filter(o => o.status === 'preparing').length, color: 'bg-orange-500' },
      { status: 'pending', label: 'معلقة', count: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-500' },
      { status: 'cancelled', label: 'ملغية', count: orders.filter(o => o.status === 'cancelled').length, color: 'bg-red-500' }
    ].map(item => (
      <div key={item.status} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
          <span className="text-sm text-gray-600">{item.label}</span>
        </div>
        <span className="font-medium text-gray-900">{item.count}</span>
      </div>
    ))}
  </div>
</div>


                {/* Customer Analytics */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* الهيدر */}
  <div className="bg-black text-white px-6 py-3">
    <h3 className="text-lg font-bold">تحليل العملاء</h3>
  </div>

  {/* المحتوى */}
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">إجمالي العملاء</span>
      <span className="font-bold text-gray-900">{customers.length}</span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">عملاء جدد هذا الشهر</span>
      <span className="font-bold text-green-600">
        +{customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">متوسط الطلبات لكل عميل</span>
      <span className="font-bold text-blue-600">
        {customers.length > 0 ? (orders.length / customers.length).toFixed(1) : 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">أعلى عميل إنفاقاً</span>
      <span className="font-bold text-purple-600">
        {(() => {
          const customerSpending: { [key: string]: number } = {};
          orders.forEach(order => {
            customerSpending[order.customerName] = (customerSpending[order.customerName] || 0) + order.total;
          });
          const topCustomer = Object.entries(customerSpending).sort(([,a], [,b]) => (b as number) - (a as number))[0];
          return topCustomer ? `${(topCustomer[1] as number).toFixed(0)} ر.س` : '0 ر.س';
        })()}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">العملاء المتكررين</span>
      <span className="font-bold text-indigo-600">
        {(() => {
          const customerOrderCounts: { [key: string]: number } = {};
          orders.forEach(order => {
            customerOrderCounts[order.customerName] = (customerOrderCounts[order.customerName] || 0) + 1;
          });
          return Object.values(customerOrderCounts).filter(count => count > 1).length;
        })()}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">نسبة العملاء المتكررين</span>
      <span className="font-bold text-teal-600">
        {(() => {
          const customerOrderCounts: { [key: string]: number } = {};
          orders.forEach(order => {
            customerOrderCounts[order.customerName] = (customerOrderCounts[order.customerName] || 0) + 1;
          });
          const returningCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
          const totalCustomersWithOrders = Object.keys(customerOrderCounts).length;
          return totalCustomersWithOrders > 0 ? `${((returningCustomers / totalCustomersWithOrders) * 100).toFixed(1)}%` : '0%';
        })()}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">عملاء لديهم عناصر في السلة</span>
      <span className="font-bold text-orange-600">
        {(() => {
          try {
            const customersWithActiveOrders = new Set();

            orders.forEach(order => {
              if (['pending', 'confirmed', 'preparing'].includes(order.status)) {
                customersWithActiveOrders.add(order.customerName);
              }
            });

            const userData = localStorage.getItem('user');
            if (userData) {
              const user = JSON.parse(userData);
              const cartData = localStorage.getItem('cart');
              if (cartData) {
                const cart = JSON.parse(cartData);
                if (Array.isArray(cart) && cart.length > 0) {
                  customersWithActiveOrders.add(user.name || user.email);
                }
              }
            }

            return customersWithActiveOrders.size;
          } catch (error) {
            console.warn('Error calculating customers with cart items:', error);
            return 'غير متاح';
          }
        })()}
      </span>
    </div>
  </div>
</div>


                {/* Coupon Performance */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* الهيدر */}
  <div className="bg-black text-white px-6 py-3">
    <h3 className="text-lg font-bold">أداء الكوبونات</h3>
  </div>

  {/* المحتوى */}
  <div className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">الكوبونات النشطة</span>
      <span className="font-bold text-gray-900">
        {coupons.filter(c => c.isActive).length}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">معدل الاستخدام</span>
      <span className="font-bold text-green-600">
        {orders.length > 0 
          ? ((orders.filter(o => o.couponDiscount && o.couponDiscount > 0).length / orders.length) * 100).toFixed(1) 
          : 0}%
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">إجمالي الخصم المطبق</span>
      <span className="font-bold text-red-600">
        {orders.reduce((total, order) => total + (order.couponDiscount || 0), 0).toFixed(0)} ر.س
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">متوسط قيمة الخصم</span>
      <span className="font-bold text-orange-600">
        {(() => {
          const ordersWithCoupons = orders.filter(o => o.couponDiscount && o.couponDiscount > 0);
          return ordersWithCoupons.length > 0 
            ? (ordersWithCoupons.reduce((total, order) => total + (order.couponDiscount || 0), 0) / ordersWithCoupons.length).toFixed(0) 
            : 0;
        })()} ر.س
      </span>
    </div>
  </div>
</div>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* Static Page Modal */}
      <StaticPageModal
        isOpen={isStaticPageModalOpen}
        onClose={() => {
          setIsStaticPageModalOpen(false);
          setEditingStaticPage(null);
        }}
        onSave={handleSaveStaticPage}
        editingPage={editingStaticPage}
      />

      {/* Order Modal */}
      {isOrderModalOpen && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          isOpen={isOrderModalOpen}
          onClose={closeOrderModal}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        title={`حذف ${
          deleteModal.type === 'product' ? 'المنتج' :
                deleteModal.type === 'category' ? 'التصنيف' :
                deleteModal.type === 'order' ? 'الطلب' :
                deleteModal.type === 'customer' ? 'العميل' :
                deleteModal.type === 'user' ? 'الموظف' :
                deleteModal.type === 'coupon' ? 'الكوبون' :
                deleteModal.type === 'static-page' ? 'الصفحة الثابتة' :
                deleteModal.type === 'blog-post' ? 'مقال المدونة' :
                deleteModal.type === 'portfolio' ? 'العمل' :
                deleteModal.type === 'portfolioCategory' ? 'تصنيف البورتفوليو' :
                deleteModal.type === 'testimonial' ? 'الرأي' :
                deleteModal.type === 'client' ? 'العميل' :
          'العنصر'
        }`}
        message={`هل أنت متأكد من حذف "${deleteModal.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        loading={deleteModal.loading}
      />



      {/* Blog Modal */}
      <BlogModal
        isOpen={isBlogModalOpen}
        onClose={() => {
          setIsBlogModalOpen(false);
          // لا نقوم بتصفير editingBlogPost هنا للاحتفاظ بالبيانات
        }}
        onSave={handleSaveBlogPost}
        editingPost={editingBlogPost}
      />

      {/* Testimonial Modal */}
      <TestimonialModal
        isOpen={isTestimonialModalOpen}
        onClose={() => {
          setIsTestimonialModalOpen(false);
          setEditingTestimonial(null);
        }}
        onSave={handleSaveTestimonial}
        editingTestimonial={editingTestimonial}
        initialData={newTestimonial}
      />

      {/* Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-black p-6">
              <h2 className="text-xl font-bold text-white mb-0">
                {editingUser ? 'تعديل موظف' : 'إضافة موظف جديد'}
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم *</label>
                  <input
                    type="text"
                    value={newUser.username || ''}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newUser.email || ''}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={newUser.phone || ''}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الدور *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'staff' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  >
                    <option value="staff">موظف</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingUser ? 'كلمة المرور الجديدة (اتركها فارغة للاحتفاظ بالحالية)' : 'كلمة المرور *'}
                  </label>
                  <input
                    type="password"
                    value={newUser.password || ''}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    required={!editingUser}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                      setNewUser({ username: '', name: '', email: '', phone: '', role: 'staff', password: '' });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isLoadingUsers}
                    className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isLoadingUsers ? 'جاري الحفظ...' : (editingUser ? 'تحديث' : 'إضافة')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteUserModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">حذف موظف</h2>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف الموظف <strong>{userToDelete.name}</strong>؟
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteUserModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isLoadingUsers}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoadingUsers ? 'جاري الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-black p-6">
              <h2 className="text-xl font-bold text-white mb-0">
                {currentUser?.role === 'admin' && selectedUser && selectedUser.id !== currentUser.id 
                  ? `تغيير كلمة مرور ${selectedUser.name}` 
                  : 'تغيير كلمة المرور'
                }
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* تم إزالة حقل كلمة المرور الحالية حسب طلب المستخدم */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                     type="submit"
                     disabled={isLoadingPassword}
                     className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                   >
                     {isLoadingPassword ? 'جاري التحديث...' : 'تحديث'}
                   </button>
                  </div>
               </form>
             </div>
           </div>
         </div>
       )}

      
      

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-black p-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-0">
                <Shield className="w-6 h-6" />
                تغيير رمز PIN
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز PIN الحالي
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinData.currentPin}
                    onChange={(e) => setPinData({ ...pinData, currentPin: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-center text-lg font-mono"
                    placeholder="••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز PIN الجديد
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinData.newPin}
                    onChange={(e) => setPinData({ ...pinData, newPin: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-center text-lg font-mono"
                    placeholder="••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد رمز PIN الجديد
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinData.confirmPin}
                    onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-center text-lg font-mono"
                    placeholder="••••"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowChangePinModal(false);
                    setPinData({ currentPin: '', newPin: '', confirmPin: '' });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={async () => {
                    if (pinData.newPin.length !== 4) {
                      smartToast.dashboard.error('رمز PIN يجب أن يكون 4 أرقام');
                      return;
                    }
                    if (pinData.newPin !== pinData.confirmPin) {
                      smartToast.dashboard.error('رمز PIN الجديد غير متطابق');
                      return;
                    }
                    setIsLoadingPin(true);
                    try {
                      const response = await apiCall(API_ENDPOINTS.ADMIN_PIN_UPDATE, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                          currentPin: pinData.currentPin, 
                          newPin: pinData.newPin 
                        })
                      });

                      if (response.success) {
                        smartToast.dashboard.success('تم تغيير رمز PIN بنجاح - يرجى إعادة المصادقة');
                        setShowChangePinModal(false);
                        setPinData({ currentPin: '', newPin: '', confirmPin: '' });
                        // إعادة تعيين المصادقة لتتطلب PIN الجديد
                        resetPinAuthentication();
                        setSearchParams({ tab: 'overview' });
                      } else {
                        smartToast.dashboard.error(response.message || 'فشل في تغيير رمز PIN');
                      }
                    } catch (error) {
                      console.error('Error updating PIN:', error);
                      smartToast.dashboard.error('خطأ في تغيير رمز PIN');
                    } finally {
                      setIsLoadingPin(false);
                    }
                  }}
                  disabled={isLoadingPin || !pinData.currentPin || !pinData.newPin || !pinData.confirmPin}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-black transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingPin ? 'جاري التغيير...' : 'تغيير PIN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Authentication Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all overflow-hidden">
            <div className="bg-black p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">التحقق من الهوية</h2>
                <p className="text-gray-300">يرجى إدخال رمز PIN للوصول إلى إدارة الموظفين</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPinInput(value);
                      if (pinError) setPinError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handlePinSubmit();
                      }
                    }}
                    className={`w-full px-4 py-4 border rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-black focus:border-black transition-all ${
                      pinError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="••••"
                    autoFocus
                  />
                  {pinError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {pinError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPinModal(false);
                      setPinInput('');
                      setPinError('');
                      // العودة للتبويب السابق
                      setSearchParams({ tab: 'overview' });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    disabled={pinLoading}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handlePinSubmit}
                    disabled={pinLoading || !pinInput.trim()}
                    className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {pinLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري التحقق...
                      </>
                    ) : (
                      'تأكيد'
                    )}
                  </button>
                </div>

                <div className="text-center">
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

     {/* Activity Logs Tab */}
{currentTab === 'activity-logs' && currentUser?.role === 'admin' && isPinAuthenticated && (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
      
      {/* الهيدر الأسود */}
      <div className="p-6 border-b border-gray-800 bg-black">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <div className="text-center sm:text-right">
              <h2 className="text-xl font-bold text-white">
                سجلات النشاط
              </h2>
              <span className="text-sm font-normal text-gray-300">
                عرض جميع أنشطة الموظفين والتغييرات.
              </span>
            </div>
          </div>
                <div className="flex gap-2 mx-auto sm:mx-0">
                  <button
                    onClick={() => fetchActivityLogs()}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-all duration-300"
                  >
                    <RefreshCw className="h-4 w-4" />
                    تحديث
                  </button>
                  <button
                    onClick={clearLogs}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    مسح الكل
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="البحث في سجلات النشاط..."
                    value={logsSearchTerm}
                    onChange={(e) => setLogsSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-center"
                  />
                </div>
              </div>

              {/* Activity Filters */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setActivityFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activityFilter === 'all'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    جميع الأنشطة
                  </button>
                  <button
                    onClick={() => setActivityFilter('order_status')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activityFilter === 'order_status'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    حالة الطلبات
                  </button>
                  <button
                    onClick={() => setActivityFilter('notes_updated')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activityFilter === 'notes_updated'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ملاحظات الطلبات
                  </button>
                </div>
              </div>

              {/* Activity Logs Content */}
              {logsLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 animate-spin text-black mx-auto mb-4" />
                  <p className="text-gray-700">جاري تحميل سجلات النشاط...</p>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد سجلات نشاط</h3>
                  <p className="text-gray-500">ستظهر هنا جميع أنشطة الموظفين</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="px-6 py-4 text-right text-sm font-semibold">اسم الموظف</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">النشاط</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">التفاصيل</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">الملاحظات</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">التاريخ والوقت</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activityLogs
                        .filter(log => {
                          // Apply search filter
                          const matchesSearch = log.userName.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
                            log.action.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
                            log.details.toLowerCase().includes(logsSearchTerm.toLowerCase());
                          
                          // Apply activity filter
                          let matchesActivityFilter = true;
                          if (activityFilter === 'order_status') {
                            matchesActivityFilter = log.action.includes('status_updated') || log.action.includes('order_updated');
                          } else if (activityFilter === 'notes_updated') {
                            matchesActivityFilter = log.action.includes('notes_updated');
                          }
                          
                          return matchesSearch && matchesActivityFilter;
                        })
                        .map((log, index) => (
                          <tr key={`activity-${log.id || index}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <span className="text-sm font-medium text-gray-900">{log.userName}</span>
                                <div className="w-2 h-2 bg-black rounded-full"></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm text-gray-700">{log.action}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm text-gray-600">
                                {log.orderId ? (
                                  `الطلب #${log.orderNumber}: ${log.details}`
                                ) : (
                                  log.details
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm text-gray-600">
                                {log.action === 'notes_updated' && log.newValue ? (
                                  <div className="max-w-xs">
                                    <div className="text-xs text-gray-500 mb-1">الملاحظة الجديدة:</div>
                                    <div className="text-sm bg-gray-50 p-2 rounded border">{log.newValue}</div>
                                    {log.previousValue && (
                                      <>
                                        <div className="text-xs text-gray-500 mt-2 mb-1">الملاحظة السابقة:</div>
                                        <div className="text-sm bg-red-50 p-2 rounded border text-gray-600">{log.previousValue}</div>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  log.notes || '-'
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm text-gray-500">
                                {log.createdAt ? new Date(log.createdAt).toLocaleString('ar-SA') : 'تاريخ غير متاح'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {log.orderId ? (
                                <button
                                  onClick={() => {
                                     const order = orders.find(o => o.id === log.orderId);
                                     if (order) {
                                       openOrderModal(order);
                                     } else {
                                       smartToast.dashboard.error('لم يتم العثور على الطلب');
                                     }
                                   }}
                                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-1 text-xs transition-all duration-300"
                                >
                                  <Eye className="w-3 h-3" />
                                  تفاصيل الطلب
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Logs Tab */}
      {currentTab === 'login-logs' && currentUser?.role === 'admin' && isPinAuthenticated && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-md border border-gray-300">
            <div className="p-6 border-b border-gray-300 bg-white">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <LogIn className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center sm:text-right">
                    <h2 className="text-xl font-bold text-black">سجلات الدخول<br/><span className="text-sm font-normal text-gray-600">عرض جميع محاولات الدخول</span></h2>
                  </div>
                </div>
                <div className="flex gap-2 mx-auto sm:mx-0">
                  <button
                    onClick={() => fetchLoginLogs()}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-all duration-300"
                  >
                    <RefreshCw className="h-4 w-4" />
                    تحديث
                  </button>
                  <button
                    onClick={() => clearLogs()}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    مسح الكل
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="البحث في سجلات الدخول..."
                    value={logsSearchTerm}
                    onChange={(e) => setLogsSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-center"
                  />
                </div>
              </div>

              {/* Login Logs Content */}
              {logsLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 animate-spin text-black mx-auto mb-4" />
                  <p className="text-gray-700">جاري تحميل سجلات الدخول...</p>
                </div>
              ) : loginLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد سجلات دخول</h3>
                  <p className="text-gray-500">ستظهر هنا جميع محاولات دخول الموظفين</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="px-6 py-4 text-right font-semibold">اسم الموظف</th>
                        <th className="px-6 py-4 text-right font-semibold">الدور</th>
                        <th className="px-6 py-4 text-right font-semibold">الحالة</th>
                        <th className="px-6 py-4 text-right font-semibold">عنوان IP</th>
                        <th className="px-6 py-4 text-right font-semibold">سبب الفشل</th>
                        <th className="px-6 py-4 text-right font-semibold">التاريخ والوقت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loginLogs
                        .filter(log => 
                          (log.userName && log.userName.toLowerCase().includes(logsSearchTerm.toLowerCase())) ||
                          (log.failureReason && log.failureReason.toLowerCase().includes(logsSearchTerm.toLowerCase()))
                        )
                        .map((log, index) => (
                          <tr key={`login-${log.id || index}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  log.success ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                                <span className="text-gray-900 font-medium">
                                  {log.userName || 'مستخدم غير معروف'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {log.userRole && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  {log.userRole}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                log.success 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {log.success ? 'نجح' : 'فشل'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-700 text-sm font-mono">{log.ipAddress}</span>
                            </td>
                            <td className="px-6 py-4">
                              {log.failureReason ? (
                                <span className="text-red-600 text-sm">{log.failureReason}</span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600 text-sm">
                                {new Date(log.createdAt).toLocaleString('ar-SA')}
                              </span>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
     {/* Logs Modal */}
{showLogsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-300 flex flex-col">
      
      {/* Modal Header */}
      <div className="p-6 border-b border-gray-800 bg-black">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
              {activeLogsTab === "activity" ? (
                <Activity className="w-5 h-5 text-black" />
              ) : (
                <LogIn className="w-5 h-5 text-black" />
              )}
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-white">
                {activeLogsTab === "activity" ? "سجلات النشاط" : "سجلات الدخول"}
              </h2>
              <p className="text-gray-400 text-sm">
                {activeLogsTab === "activity"
                  ? "عرض جميع أنشطة الموظفين والتغييرات"
                  : "عرض جميع محاولات الدخول"}
              </p>
            </div>
          </div>
                <button
                  onClick={() => setShowLogsModal(false)}
                  className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Search Bar */}
              <div className="mb-6 flex justify-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <input
                    type="text"
                    placeholder={`البحث في ${activeLogsTab === 'activity' ? 'سجلات النشاط' : 'سجلات الدخول'}...`}
                    value={logsSearchTerm}
                    onChange={(e) => setLogsSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-300 text-center"
                  />
                </div>
              </div>

              {/* Activity Filters - Only show for activity tab */}
              {activeLogsTab === 'activity' && (
                <div className="mb-6 flex justify-center">
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActivityFilter('all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                        activityFilter === 'all'
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      جميع الأنشطة
                    </button>
                    <button
                      onClick={() => setActivityFilter('order_status')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                        activityFilter === 'order_status'
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      حالة الطلبات
                    </button>
                    <button
                      onClick={() => setActivityFilter('order_notes')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                        activityFilter === 'order_notes'
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      ملاحظات الطلبات
                    </button>
                  </div>
                </div>
              )}

              {/* أزرار التحكم */}
              <div className="mb-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (activeLogsTab === 'activity') {
                        fetchActivityLogs();
                      } else {
                        fetchLoginLogs();
                      }
                    }}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-all duration-300"
                  >
                    <RefreshCw className="h-4 w-4" />
                    تحديث
                  </button>
                  <button
                    onClick={() => clearLogs()}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    مسح الكل
                  </button>
                </div>
              </div>
              
              
              {/* Logs Content */}
              {logsLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 animate-spin text-black mx-auto mb-4" />
                  <p className="text-gray-700">جاري تحميل السجلات...</p>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto">
                  {activeLogsTab === 'activity' ? (
                    activityLogs.length === 0 ? (
                      <div className="text-center py-12">
                        <Activity className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-black mb-2">لا توجد سجلات نشاط</h3>
                        <p className="text-gray-600">ستظهر هنا جميع أنشطة الموظفين</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                          <thead className="bg-black text-white">
                            <tr>
                              <th className="px-6 py-4 text-right font-semibold">اسم الموظف</th>
                              <th className="px-6 py-4 text-right font-semibold">النشاط</th>
                              <th className="px-6 py-4 text-right font-semibold">التاريخ والوقت</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {getFilteredActivityLogs().map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 bg-black rounded-full"></div>
                                      <span className="text-gray-900 font-medium">{log.userName}</span>
                                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{log.userRole}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div>
                                      <span className="text-xs bg-black text-white px-3 py-1 rounded-full font-medium">
                                        {getActionText(log)}
                                      </span>
                                      {log.action === 'notes_updated' && log.newValue && (
                                        <div className="text-gray-600 text-xs mt-2">
                                          الملاحظة: "{log.newValue}"
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-gray-700 text-sm">
                                      <div className="font-medium">
                                        {new Date(log.createdAt).toLocaleDateString('ar-SA', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </div>
                                      <div className="text-gray-500 text-xs mt-1">
                                        {new Date(log.createdAt).toLocaleTimeString('ar-SA', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          second: '2-digit'
                                        })}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    loginLogs.length === 0 ? (
                      <div className="text-center py-12">
                        <LogIn className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-black mb-2">لا توجد سجلات دخول</h3>
                        <p className="text-gray-600">ستظهر هنا جميع محاولات الدخول</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                          <thead className="bg-black text-white">
                            <tr>
                              <th className="px-6 py-4 text-right font-semibold">اسم الموظف</th>
                              <th className="px-6 py-4 text-right font-semibold">الدور</th>
                              <th className="px-6 py-4 text-right font-semibold">الحالة</th>
                              <th className="px-6 py-4 text-right font-semibold">سبب الفشل</th>
                              <th className="px-6 py-4 text-right font-semibold">التاريخ والوقت</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {loginLogs
                              .filter(log => 
                                (log.userName && log.userName.toLowerCase().includes(logsSearchTerm.toLowerCase())) ||
                                (log.failureReason && log.failureReason.toLowerCase().includes(logsSearchTerm.toLowerCase()))
                              )
                              .map((log, index) => {
                                // Function to translate failure reason to user-friendly Arabic
                                const getFailureReasonText = (reason: string) => {
                                  switch (reason) {
                                    case 'invalid_credentials':
                                      return 'بيانات الدخول غير صحيحة';
                                    case 'user_not_found':
                                      return 'المستخدم غير موجود';
                                    case 'account_locked':
                                      return 'الحساب مقفل';
                                    case 'invalid_password':
                                      return 'كلمة المرور غير صحيحة';
                                    case 'account_disabled':
                                      return 'الحساب معطل';
                                    default:
                                      return reason;
                                  }
                                };

                                return (
                                  <tr key={log.id || `login-log-${index}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                          log.success ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                        <span className="text-gray-900 font-medium">
                                          {log.userName || 'مستخدم غير معروف'}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      {log.userRole ? (
                                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                          {log.userRole}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                        log.success 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {log.success ? 'نجح' : 'فشل'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      {log.failureReason ? (
                                        <span className="text-red-600 text-sm">{getFailureReasonText(log.failureReason)}</span>
                                      ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-gray-700 text-sm">
                                        <div className="font-medium">
                                          {new Date(log.createdAt).toLocaleDateString('ar-SA', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                          })}
                                        </div>
                                        <div className="text-gray-500 text-xs mt-1">
                                          {new Date(log.createdAt).toLocaleTimeString('ar-SA', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                          })}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            }
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {isCustomerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              {/* Header */}
              <div className="bg-black text-white p-6 -m-6 mb-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg">
                      {(selectedCustomer.fullName || selectedCustomer.name || selectedCustomer.email)?.[0]?.toUpperCase() || '؟'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">تفاصيل العميل</h2>
                      <p className="text-gray-300 text-sm">#{selectedCustomer.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => {
                        if (isEditingCustomer) {
                          setIsEditingCustomer(false);
                          setEditedCustomer(null);
                        } else {
                          setIsEditingCustomer(true);
                          setEditedCustomer({ ...selectedCustomer });
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isEditingCustomer 
                          ? 'bg-gray-600 text-white hover:bg-gray-700' 
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {isEditingCustomer ? 'إلغاء' : 'تعديل'}
                    </button>
                    <button
                      onClick={() => {
                        setIsCustomerModalOpen(false);
                        setSelectedCustomer(null);
                        setIsEditingCustomer(false);
                        setEditedCustomer(null);
                      }}
                      className="text-gray-300 hover:text-white transition-colors p-2"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* معلومات أساسية */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-black mb-4 flex items-center">
                      <User className="w-5 h-5 ml-2" />
                      المعلومات الأساسية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">الاسم الكامل</label>
                        {isEditingCustomer ? (
                          <input
                            type="text"
                            value={editedCustomer?.fullName || editedCustomer?.name || ''}
                            onChange={(e) => setEditedCustomer(prev => prev ? { ...prev, fullName: e.target.value, name: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                            {selectedCustomer.fullName || selectedCustomer.name || 'غير محدد'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">البريد الإلكتروني</label>
                        {isEditingCustomer ? (
                          <input
                            type="email"
                            value={editedCustomer?.email || ''}
                            onChange={(e) => setEditedCustomer(prev => prev ? { ...prev, email: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">{selectedCustomer.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">رقم الهاتف</label>
                        {isEditingCustomer ? (
                          <input
                            type="tel"
                            value={editedCustomer?.phone || ''}
                            onChange={(e) => setEditedCustomer(prev => prev ? { ...prev, phone: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">{selectedCustomer.phone || 'غير محدد'}</p>
                        )}
                      </div>
                      
                    </div>
                  </div>

                  {/* معلومات إضافية */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-black mb-4 flex items-center">
                      <Calendar className="w-5 h-5 ml-2" />
                      معلومات إضافية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-black">تاريخ التسجيل</span>
                          <span className="text-gray-700 font-medium">
                            {new Date(selectedCustomer.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-black">آخر تسجيل دخول</span>
                          <span className="text-gray-700 font-medium">
                            {selectedCustomer.lastLogin 
                              ? new Date(selectedCustomer.lastLogin).toLocaleDateString('ar-SA')
                              : 'لم يسجل دخول'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-black">عناصر السلة</span>
                          <span className="text-gray-700 font-medium">{selectedCustomer.cartItemsCount || 0} عنصر</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-black">قائمة الأمنيات</span>
                          <span className="text-gray-700 font-medium">{selectedCustomer.wishlistItemsCount || 0} عنصر</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Stats & Status */}
                <div className="space-y-6">
                  {/* إحصائيات الطلبات */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-black mb-4 flex items-center">
                      <ShoppingBag className="w-5 h-5 ml-2" />
                      إحصائيات الطلبات
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-black">
                          {(() => {
                            const customerOrders = orders.filter(order => 
                              order.customerEmail === selectedCustomer.email || 
                              order.customerPhone === selectedCustomer.phone ||
                              order.customerName === (selectedCustomer.fullName || selectedCustomer.name)
                            );
                            return customerOrders.length;
                          })()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">إجمالي الطلبات</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-black">
                          {(() => {
                            const customerOrders = orders.filter(order => 
                              order.customerEmail === selectedCustomer.email || 
                              order.customerPhone === selectedCustomer.phone ||
                              order.customerName === (selectedCustomer.fullName || selectedCustomer.name)
                            );
                            const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
                            return totalSpent.toFixed(2);
                          })()} ر.س
                        </div>
                        <div className="text-sm text-gray-600 mt-1">إجمالي المبلغ المنفق</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-bold text-black">
                          {(() => {
                            const customerOrders = orders.filter(order => 
                              order.customerEmail === selectedCustomer.email || 
                              order.customerPhone === selectedCustomer.phone ||
                              order.customerName === (selectedCustomer.fullName || selectedCustomer.name)
                            );
                            if (customerOrders.length === 0) return 'لا يوجد';
                            const lastOrder = customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                            return new Date(lastOrder.createdAt).toLocaleDateString('ar-SA');
                          })()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">آخر طلب</div>
                      </div>
                    </div>
                  </div>

                  {/* حالة العميل */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-black mb-4 flex items-center">
                      <Shield className="w-5 h-5 ml-2" />
                      حالة العميل
                    </h3>
                    <div className="space-y-3">
                      <div className={`px-4 py-2 rounded-lg text-center font-medium ${
                        selectedCustomer.status === 'active' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {selectedCustomer.status === 'active' ? '✓ نشط' : '✗ غير نشط'}
                      </div>
                      {selectedCustomer.hasCart && (
                        <div className="px-4 py-2 rounded-lg text-center font-medium bg-gray-100 text-gray-700">
                          🛒 لديه سلة
                        </div>
                      )}
                      {selectedCustomer.hasWishlist && (
                        <div className="px-4 py-2 rounded-lg text-center font-medium bg-gray-100 text-gray-700">
                          ❤️ لديه قائمة أمنيات
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 space-x-reverse mt-6 pt-6 border-t border-gray-200">
                {isEditingCustomer && (
                  <button
                    onClick={async () => {
                      if (editedCustomer && selectedCustomer) {
                        const success = await updateCustomer(selectedCustomer.id, editedCustomer);
                        if (success) {
                          setIsEditingCustomer(false);
                          setEditedCustomer(null);
                        }
                      }
                    }}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    حفظ التغييرات
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsCustomerModalOpen(false);
                    setSelectedCustomer(null);
                    setIsEditingCustomer(false);
                    setEditedCustomer(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal for Activity Logs */}
      {showOrderModal && selectedOrderForLogs && (
        <OrderModal
          order={selectedOrderForLogs}
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrderForLogs(null);
          }}
          onStatusUpdate={(orderId, newStatus) => {
            // Update the order status and refresh activity logs
            setSelectedOrderForLogs(prev => prev ? {...prev, status: newStatus as Order['status']} : null);
            fetchActivityLogs();
          }}
        />
      )}
      
      {/* Coupon Modal */}
       {showCouponModal && (
         <CouponModal
           isOpen={showCouponModal}
           onClose={() => {
             setShowCouponModal(false);
             setSelectedCouponForEdit(null);
           }}
           onCouponAdded={() => {
             setShowCouponModal(false);
             setSelectedCouponForEdit(null);
             // Refresh coupons if we're on the coupons tab
             if (currentTab === 'coupons') {
               fetchCoupons();
             }
           }}
           editCoupon={selectedCouponForEdit}
         />
      )}
      
      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setSelectedCategoryForEdit(null);
          }}
          onSuccess={() => {
            setShowCategoryModal(false);
            setSelectedCategoryForEdit(null);
            // Refresh categories if we're on the categories tab
            if (currentTab === 'categories') {
              fetchCategories();
            }
          }}
          category={selectedCategoryForEdit}
        />
      )}

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProductForEdit(null);
          }}
          onSuccess={() => {
            setShowProductModal(false);
            setSelectedProductForEdit(null);
            // Refresh products if we're on the products tab
            if (currentTab === 'products') {
              fetchProducts();
            }
          }}
          product={selectedProductForEdit}
        />
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <PortfolioModal
          isOpen={showPortfolioModal}
          onClose={() => {
            setShowPortfolioModal(false);
            setSelectedPortfolio(null);
          }}
          onSuccess={() => {
            setShowPortfolioModal(false);
            setSelectedPortfolio(null);
            // Refresh portfolio if we're on the portfolio tab
            if (currentTab === 'portfolio') {
              fetchPortfolios();
            }
          }}
          portfolio={selectedPortfolio}
        />
      )}

      {/* Portfolio Category Modal */}
      {showPortfolioCategoryModal && (
        <PortfolioCategoryModal
          isOpen={showPortfolioCategoryModal}
          onClose={() => {
            setShowPortfolioCategoryModal(false);
            setSelectedPortfolioCategory(null);
          }}
          onSuccess={() => {
            setShowPortfolioCategoryModal(false);
            setSelectedPortfolioCategory(null);
            // Refresh portfolio categories if we're on the portfolio tab
            if (currentTab === 'portfolio') {
              fetchPortfolioCategories();
            }
          }}
          category={selectedPortfolioCategory}
        />
      )}

      

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <SubcategoryModal
          isOpen={showSubcategoryModal}
          onClose={() => {
            setShowSubcategoryModal(false);
            setSelectedSubcategoryForEdit(null);
            setSelectedParentCategoryId(null);
          }}
          onSuccess={() => {
            setShowSubcategoryModal(false);
            setSelectedSubcategoryForEdit(null);
            setSelectedParentCategoryId(null);
            // Refresh categories and subcategories data
            fetchCategories();
          }}
          subcategory={selectedSubcategoryForEdit}
          parentCategoryId={selectedParentCategoryId}
        />
      )}

      {/* Collection Modal */}
      {showCollectionModal && (
        <CollectionModal
          isOpen={showCollectionModal}
          onClose={() => {
            setShowCollectionModal(false);
            setSelectedCollectionForEdit(null);
          }}
          onSuccess={() => {
            setShowCollectionModal(false);
            setSelectedCollectionForEdit(null);
            fetchCollections();
          }}
          collection={selectedCollectionForEdit}
        />
      )}


    </div>
  );
};

export default Dashboard;