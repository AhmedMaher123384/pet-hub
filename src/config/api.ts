// API Configuration for different environments
export const API_CONFIG = {
  // للتطوير المحلي
  development: {
    baseURL: 'http://localhost:3001',
  },
  // للإنتاج - PRODUCTION READY 🚀
  production: {
    baseURL: 'https://afterads-b.onrender.com', // AfterAds backend on Render
  }
};

// الحصول على الـ base URL حسب البيئة
export const getApiBaseUrl = (): string => {
  // أولاً: تحقق من Environment Variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // ثانياً: تحقق من البيئة
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? API_CONFIG.development.baseURL : API_CONFIG.production.baseURL;
};

// دالة مساعدة لبناء URL كامل
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // إزالة الـ slash الأول من endpoint إذا كان موجود
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // إزالة api/ إذا كانت موجودة في endpoint لأنها ستضاف تلقائياً
  const finalEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint.slice(4) : cleanEndpoint;
  
  // إذا كان endpoint فارغ، أرجع base URL مع /api بدون trailing slash
  if (!finalEndpoint) {
    return `${baseUrl}/api`;
  }
  
  return `${baseUrl}/api/${finalEndpoint}`;
};

import { PRODUCT_PLACEHOLDER_SRC } from '../utils/placeholders';
import { getProductImage } from '../assets/productImages';
import { getClientImage } from '../assets/clientImages';
import { getCategoryImage } from '../assets/categoryImages';

// وضع الموك: يعتمد على المتغير البيئي، وبشكل افتراضي مفعّل
const MOCK_MODE: boolean = (() => {
  const v = (import.meta as any).env?.VITE_USE_MOCK;
  if (v === undefined) return true; // افتراضي: تشغيل الموك
  const val = String(v).toLowerCase();
  return val === '1' || val === 'true' || val === 'yes' || val === 'on';
})();

// قراءة ملف JSON من public
const readMockJson = async (path: string) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Mock file not found: ${path}`);
  return await res.json();
};

// مساعد لضمان التوافق مع صيغ مختلفة: إرجاع Array مع خصائص إضافية
const augmentArray = (arr: any[], extras: Record<string, any> = {}) => {
  const anyArr = arr as any;
  Object.assign(anyArr, { success: true, data: arr, ...extras });
  return anyArr;
};

// استخراج أجزاء الـ endpoint بدون Query
const endpointKey = (endpoint: string) => endpoint.split('?')[0];

// كشف اللغة العربية للنصوص
const isArabicText = (s: any): boolean => {
  const str = typeof s === 'string' ? s : '';
  return /[\u0600-\u06FF]/.test(str);
};

// تطبيع حقول الترجمة لضمان وجود name_ar/name_en و description_en/description_ar
const normalizeItemFields = (item: any): any => {
  const normalized: any = { ...item };

  // أسماء
  if (!normalized.name_ar && normalized.name && isArabicText(normalized.name)) {
    normalized.name_ar = normalized.name;
  }
  if (!normalized.name_en && normalized.name && !isArabicText(normalized.name)) {
    normalized.name_en = normalized.name;
  }

  // أوصاف
  if (!normalized.description_ar && normalized.description && isArabicText(normalized.description)) {
    normalized.description_ar = normalized.description;
  }
  if (!normalized.description_en && normalized.description && !isArabicText(normalized.description)) {
    normalized.description_en = normalized.description;
  }
  // وصف إنجليزي افتراضي إذا كان مفقودًا بالكامل
  if (!normalized.description_en) {
    const nameEn = normalized.name_en || normalized.name || '';
    normalized.description_en = nameEn
      ? `High quality ${nameEn}. Details coming soon.`
      : 'High quality product. Details coming soon.';
  }

  return normalized;
};

const normalizeArray = (arr: any[]): any[] => Array.isArray(arr) ? arr.map(normalizeItemFields) : arr;

// تطبيق صور محلية لكل منتج إن توفرت
const overrideProductImage = (p: any) => {
  const idNum = Number(p?.id);
  const mapped = idNum ? getProductImage(idNum) : undefined;
  return { ...p, mainImage: mapped || p?.mainImage || PRODUCT_PLACEHOLDER_SRC };
};
const applyProductImageOverrides = (arr: any[]): any[] => Array.isArray(arr) ? arr.map(overrideProductImage) : arr;

// تطبيق صور محلية لكل عميل إن توفرت
const overrideClientLogo = (c: any) => {
  const idNum = Number(c?.id);
  const mapped = idNum ? getClientImage(idNum) : undefined;
  return { ...c, logo: mapped || c?.logo || '' };
};
const applyClientLogoOverrides = (arr: any[]): any[] => Array.isArray(arr) ? arr.map(overrideClientLogo) : arr;

// تطبيق صور محلية لكل كاتيجوري/سب كاتيجوري إن توفرت
const overrideCategoryImage = (c: any) => {
  const idNum = Number(c?.id);
  const mapped = idNum ? getCategoryImage(idNum) : undefined;
  return { ...c, image: mapped || c?.image || '' };
};
const applyCategoryImageOverrides = (arr: any[]): any[] => Array.isArray(arr) ? arr.map(overrideCategoryImage) : arr;

// اعتراض واجهات الموك
const handleMockApi = async (endpoint: string, method: string, options: RequestInit) => {
  const key = endpointKey(endpoint);
  const queryString = endpoint.includes('?') ? endpoint.split('?')[1] : '';
  const queryParams = new URLSearchParams(queryString);
  const isGET = method === 'GET';
  const isPOST = method === 'POST';
  const isPUT = method === 'PUT';
  const isDELETE = method === 'DELETE';
  const decode = (s: string) => {
    try { return decodeURIComponent(s); } catch { return s; }
  };
  const makeSlug = (nameObj: any, fallback: string, idx?: number) => {
    const langPref = (import.meta as any).env?.VITE_LOCALE === 'ar' ? 'ar' : 'en';
    const n = (typeof nameObj === 'string' && nameObj) || nameObj?.[langPref] || nameObj?.en || nameObj?.ar || fallback || '';
    const base = String(n).trim();
    const slug = base
      .replace(/\s+/g, '-')
      .replace(/[-]+/g, '-')
      .replace(/^[-]+|[-]+$/g, '');
    if (!slug) {
      return idx !== undefined ? `collection-${idx}` : 'collection';
    }
    return slug;
  };

  // Products
  if (key === 'products' && isGET) {
    const productsRaw = await readMockJson('/mock-data/products.json');
    const products = normalizeArray(productsRaw);
    const withImages = applyProductImageOverrides(products);
    // دعم شكلين: مصفوفة مباشرة + خاصية products
    return augmentArray(withImages, { products: withImages });
  }
  // منتج مفرد: تأكد أن الجزء الثاني رقم فقط لتجنب التقاط مسارات مثل products/category
  if (key.startsWith('products/') && isGET && /^\d+$/.test(key.split('/')[1])) {
    const parts = key.split('/');
    const id = parseInt(parts[1]);
    const productsRaw = await readMockJson('/mock-data/products.json');
    const products = normalizeArray(productsRaw);
    const p = products.find((x: any) => Number(x.id) === id) || null;
    return p ? overrideProductImage(p) : {};
  }
  if (key.startsWith('products/category/') && isGET) {
    const catId = parseInt(key.split('/')[2]);
    const productsRaw = await readMockJson('/mock-data/products.json');
    const products = normalizeArray(productsRaw);
    const filtered = applyProductImageOverrides(products.filter((p: any) => Number(p.categoryId) === catId));
    // إرجاع بصيغتين: المصفوفة مباشرة + خاصية products لضمان التوافق عبر الواجهات
    return augmentArray(filtered, { products: filtered });
  }
  if (key.startsWith('products/subcategory/') && isGET) {
    const subId = parseInt(key.split('/')[2]);
    const productsRaw = await readMockJson('/mock-data/products.json');
    const products = normalizeArray(productsRaw);
    const filteredRaw = products.filter((p: any) => Number(p.subcategoryId) === subId);
    const filtered = applyProductImageOverrides(filteredRaw);
    console.info('[MockAPI] products/subcategory hit', { subId, count: filtered.length });
    return augmentArray(filtered, { products: filtered });
  }

  // Categories و Subcategories (مشتقة من categories حسب parentId)
  if (key === 'categories' && isGET) {
    const categoriesRaw = await readMockJson('/mock-data/categories.json');
    const categories = normalizeArray(categoriesRaw);
    const withImages = applyCategoryImageOverrides(categories);
    return augmentArray(withImages);
  }
  if (key.startsWith('categories/') && isGET) {
    const id = parseInt(key.split('/')[1]);
    const categoriesRaw = await readMockJson('/mock-data/categories.json');
    const categories = normalizeArray(categoriesRaw);
    const c = categories.find((x: any) => Number(x.id) === id) || null;
    return c ? overrideCategoryImage(c) : {};
  }
  if (key === 'subcategories' && isGET) {
    const categoriesRaw = await readMockJson('/mock-data/categories.json');
    const categories = normalizeArray(categoriesRaw);
    const subsRaw = categories.filter((c: any) => c.parentId != null);
    const subs = applyCategoryImageOverrides(subsRaw);
    return augmentArray(subs);
  }
  if (key.startsWith('subcategories/by-parent/') && isGET) {
    const parentId = parseInt(key.split('/')[2]);
    const categoriesRaw = await readMockJson('/mock-data/categories.json');
    const categories = normalizeArray(categoriesRaw);
    const subsRaw = categories.filter((c: any) => Number(c.parentId) === parentId);
    const subs = applyCategoryImageOverrides(subsRaw);
    return augmentArray(subs);
  }

  // Collections
  if (key === 'collections' && isGET) {
    const collections = await readMockJson('/mock-data/collections.json');
    const withIds = collections.map((c: any, idx: number) => ({
      ...c,
      _id: c._id || makeSlug(c.name || c.name_en || c.name_ar, `collection-${idx}`, idx),
    }));
    return augmentArray(withIds);
  }
  if (key.startsWith('collections/') && key.endsWith('/products') && isGET) {
    const collections = await readMockJson('/mock-data/collections.json');
    const products = await readMockJson('/mock-data/products.json');
    const param = decode(key.split('/')[1]);
    const withIds = collections.map((c: any, idx: number) => ({
      ...c,
      _id: c._id || makeSlug(c.name || c.name_en || c.name_ar, `collection-${idx}`, idx),
    }));
    const isNum = /^\d+$/.test(param);
    const col = isNum ? withIds[parseInt(param)] : withIds.find((x: any) => String(x._id) === String(param));
    if (!col) return augmentArray([]);
    let result: any[] = [];
    if (col.type === 'manual' && Array.isArray(col.products)) {
      result = products.filter((p: any) => col.products.includes(p.id));
    } else if (col.type === 'automated' && col.conditions) {
      result = products.filter((p: any) => {
        const inCategory = !col.conditions.categories || col.conditions.categories.includes(p.categoryId);
        const avail = col.conditions.isAvailable === undefined ? true : p.isAvailable === col.conditions.isAvailable;
        const priceOK = col.conditions.priceRange ? (p.price >= col.conditions.priceRange.min && p.price <= col.conditions.priceRange.max) : true;
        const featuredOK = col.conditions.featured === undefined ? true : !!p.featured === !!col.conditions.featured;
        return inCategory && avail && priceOK && featuredOK;
      });
    }
    const normalized = normalizeArray(result);
    const withImages = applyProductImageOverrides(normalized);
    return augmentArray(withImages, { products: withImages });
  }
  if (key.startsWith('collections/') && isGET) {
    const collections = await readMockJson('/mock-data/collections.json');
    const param = decode(key.split('/')[1]);
    const withIds = collections.map((c: any, idx: number) => ({
      ...c,
      _id: c._id || makeSlug(c.name || c.name_en || c.name_ar, `collection-${idx}`, idx),
    }));
    const isNum = /^\d+$/.test(param);
    const col = isNum ? withIds[parseInt(param)] : withIds.find((x: any) => String(x._id) === String(param));
    return col || {};
  }

  // Shipping
  if (key === 'shipping' && isGET) {
    const shipping = await readMockJson('/mock-data/shipping.json');
    // إرجاع Array مع success و data ليسهل العمل في ShoppingCart و Checkout
    return augmentArray(shipping);
  }

  // Banners (موك)
  if (key === 'banners' && isGET) {
    const banners = await readMockJson('/mock-data/banners.json');
    const normalized = normalizeArray(banners);
    return augmentArray(normalized, { banners: normalized });
  }
  if (key === 'banners/active' && isGET) {
    const banners = await readMockJson('/mock-data/banners.json');
    const normalized = normalizeArray(banners);
    const active = normalized.filter((b: any) => b.isActive !== false);
    const position = queryParams.get('position');
    const filtered = position ? active.filter((b: any) => String(b.position) === String(position)) : active;
    return augmentArray(filtered, { banners: filtered });
  }
  if (key.startsWith('banners/') && isGET && /^\d+$/.test(key.split('/')[1])) {
    const id = key.split('/')[1];
    const banners = await readMockJson('/mock-data/banners.json');
    const normalized = normalizeArray(banners);
    const b = normalized.find((x: any) => String(x.id) === String(id)) || null;
    return b || {};
  }

  // Testimonials (موك)
  if (key === 'testimonials' && isGET) {
    const testimonials = await readMockJson('/mock-data/testimonials.json');
    const normalized = normalizeArray(testimonials);
    return augmentArray(normalized, { testimonials: normalized });
  }
  if (key.startsWith('testimonials/') && isGET) {
    const id = parseInt(key.split('/')[1]);
    const testimonials = await readMockJson('/mock-data/testimonials.json');
    const normalized = normalizeArray(testimonials);
    const t = normalized.find((x: any) => Number(x.id) === id) || null;
    return t || {};
  }
  if (key === 'testimonials/active' && isGET) {
    const testimonials = await readMockJson('/mock-data/testimonials.json');
    const normalized = normalizeArray(testimonials);
    const active = normalized.filter((x: any) => x.isActive !== false);
    return augmentArray(active, { testimonials: active });
  }
  if (key === 'testimonials/featured' && isGET) {
    const testimonials = await readMockJson('/mock-data/testimonials.json');
    const normalized = normalizeArray(testimonials);
    const featured = normalized.filter((x: any) => !!x.featured);
    return augmentArray(featured, { testimonials: featured });
  }
  if (key.startsWith('testimonials/') && isDELETE) {
    const id = key.split('/')[1];
    return { success: true, message: `Testimonial ${id} deleted successfully (mock)` };
  }

  // Clients (موك)
  if (key === 'clients' && isGET) {
    const clients = await readMockJson('/mock-data/clients.json');
    const withLogos = applyClientLogoOverrides(clients);
    return augmentArray(withLogos, { clients: withLogos });
  }
  if (key.startsWith('clients/') && isGET) {
    const id = parseInt(key.split('/')[1]);
    const clients = await readMockJson('/mock-data/clients.json');
    const c = clients.find((x: any) => Number(x.id) === id) || null;
    return c ? overrideClientLogo(c) : {};
  }
  if (key === 'clients/active' && isGET) {
    const clients = await readMockJson('/mock-data/clients.json');
    const activeRaw = clients.filter((x: any) => x.isActive !== false);
    const active = applyClientLogoOverrides(activeRaw);
    return augmentArray(active, { clients: active });
  }
  if (key === 'clients/featured' && isGET) {
    const clients = await readMockJson('/mock-data/clients.json');
    const featuredRaw = clients.filter((x: any) => !!x.featured);
    const featured = applyClientLogoOverrides(featuredRaw);
    return augmentArray(featured, { clients: featured });
  }
  if (key.startsWith('clients/') && isDELETE) {
    const id = key.split('/')[1];
    return { success: true, message: `Client ${id} deleted successfully (mock)` };
  }

  // Coupons
  if (key === 'coupons/validate' && isPOST) {
    const bodyText = typeof options.body === 'string' ? options.body : (options.body ? await (options.body as any).text?.() : '{}');
    const payload = (() => { try { return JSON.parse(bodyText || '{}'); } catch { return {}; } })();
    const code = String(payload.code || '').trim().toUpperCase();
    const totalAmount = Number(payload.totalAmount || 0);
    const coupons = await readMockJson('/mock-data/coupons.json');
    const found = coupons.find((c: any) => String(c.code).toUpperCase() === code && c.isActive);
    if (!found) return { success: false, message: 'كود الخصم غير صحيح' };
    if (found.minimumAmount && totalAmount < found.minimumAmount) {
      return { success: false, message: 'المبلغ لا يستوفي حد الكوبون الأدنى' };
    }
    let discountAmount = 0;
    if (found.discountType === 'percentage') {
      discountAmount = Math.round((totalAmount * found.discountValue) / 100);
    } else if (found.discountType === 'fixed') {
      discountAmount = Number(found.discountValue || 0);
    }
    return { success: true, coupon: found, discountAmount };
  }

  // Checkout
  if (key === 'checkout' && isPOST) {
    return { success: true, orderId: `MOCK-${Date.now()}` };
  }

  // Cart (باستخدام localStorage)
  const cartUserMatch = key.match(/^user\/(.+)\/cart$/);
  const cartItemMatch = key.match(/^user\/(.+)\/cart\/(.+)$/);
  const getCartKey = (userId: string) => `mockCart:${userId}`;
  const readCart = (userId: string): any[] => {
    try {
      const raw = localStorage.getItem(getCartKey(userId)) || localStorage.getItem('cart');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  };
  const writeCart = (userId: string, items: any[]) => {
    localStorage.setItem(getCartKey(userId), JSON.stringify(items));
    localStorage.setItem('cart', JSON.stringify(items)); // مزامنة مع الواجهة
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (cartUserMatch) {
    const userId = cartUserMatch[1];
    if (isGET) {
      const items = readCart(userId);
      return augmentArray(items, { cart: items });
    }
    if (isPOST) {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
      const items = readCart(userId);
      const productsRaw = await readMockJson('/mock-data/products.json');
      const products = normalizeArray(productsRaw);
      const prodRaw = products.find((p: any) => Number(p.id) === Number(body.productId));
      const prod = prodRaw ? overrideProductImage(prodRaw) : undefined;
      const newItem = {
        id: Date.now(),
        productId: Number(body.productId),
        quantity: Number(body.quantity || 1),
        selectedOptions: body.selectedOptions || {},
        optionsPricing: body.optionsPricing || {},
        productOptions: body.productOptions || [],
        productOptionsPriceModifier: body.productOptionsPriceModifier || 0,
        attachments: body.attachments || {},
        addOns: body.addOns || [],
        totalPrice: body.totalPrice,
        basePrice: body.basePrice,
        addOnsPrice: body.addOnsPrice,
        product: {
          id: prod?.id || Number(body.productId),
          name: prod?.name || body.productName || 'منتج',
          price: prod?.price || body.price || 0,
          originalPrice: prod?.originalPrice,
          mainImage: prod?.mainImage || body.image || PRODUCT_PLACEHOLDER_SRC,
          isAvailable: prod?.isAvailable ?? true,
          productType: prod?.productType || '',
        }
      };
      const idx = items.findIndex((it: any) => it.productId === newItem.productId);
      if (idx >= 0) {
        items[idx].quantity = (items[idx].quantity || 1) + newItem.quantity;
      } else {
        items.push(newItem);
      }
      writeCart(userId, items);
      return { success: true, cart: items };
    }
    if (isDELETE) {
      writeCart(userId, []);
      return { success: true, cart: [] };
    }
  }

  if (cartItemMatch) {
    const userId = cartItemMatch[1];
    const itemId = cartItemMatch[2];
    const items = readCart(userId);
    if (isPUT) {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
      const newItems = items.map((it: any) => it.id === Number(itemId) ? { ...it, quantity: Number(body.quantity || it.quantity) } : it);
      writeCart(userId, newItems);
      return { success: true, cart: newItems };
    }
    if (isDELETE) {
      const newItems = items.filter((it: any) => it.id !== Number(itemId));
      writeCart(userId, newItems);
      return { success: true, cart: newItems };
    }
  }

  if (key.endsWith('/cart/update-options') && (isPUT || isPOST)) {
    const userId = key.split('/')[1];
    const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
    const items = readCart(userId);
    const newItems = items.map((it: any) => {
      if (body.itemId && it.id !== Number(body.itemId)) return it;
      return {
        ...it,
        selectedOptions: body.selectedOptions ?? it.selectedOptions,
        optionsPricing: body.optionsPricing ?? it.optionsPricing,
        productOptions: body.productOptions ?? it.productOptions,
        productOptionsPriceModifier: body.productOptionsPriceModifier ?? it.productOptionsPriceModifier,
      };
    });
    writeCart(userId, newItems);
    return { success: true, cart: newItems };
  }

  // Wishlist (باستخدام localStorage)
  const wishlistUserMatch = key.match(/^user\/(.+)\/wishlist$/);
  const wishlistProductMatch = key.match(/^user\/(.+)\/wishlist\/product\/(.+)$/);
  const wishlistCheckMatch = key.match(/^user\/(.+)\/wishlist\/check\/(.+)$/);
  const getWishlistKey = (userId: string) => `mockWishlist:${userId}`;
  const readWishlist = (userId: string): number[] => {
    try {
      const raw = localStorage.getItem(getWishlistKey(userId)) || localStorage.getItem('wishlist');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.map((x: any) => Number(x)) : [];
    } catch { return []; }
  };
  const writeWishlist = (userId: string, ids: number[]) => {
    const unique = Array.from(new Set(ids.map(Number)));
    localStorage.setItem(getWishlistKey(userId), JSON.stringify(unique));
    localStorage.setItem('wishlist', JSON.stringify(unique)); // مزامنة مع الواجهة
    localStorage.setItem('lastWishlistCount', String(unique.length));
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: unique }));
  };

  if (wishlistUserMatch) {
    const userId = wishlistUserMatch[1];
    if (isGET) {
      const ids = readWishlist(userId);
      // أعد عناصر شبيهة بالخادم { id, productId }
      const items = ids.map((id) => ({ id, productId: id }));
      return augmentArray(items, { wishlist: items });
    }
    if (isPOST) {
      const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : {};
      const prodId = Number(body.productId);
      if (!prodId) return { success: false, message: 'productId مطلوب' };
      const ids = readWishlist(userId);
      if (!ids.includes(prodId)) ids.push(prodId);
      writeWishlist(userId, ids);
      return { success: true, wishlist: ids.map((id) => ({ id, productId: id })) };
    }
    if (isDELETE) {
      writeWishlist(userId, []);
      window.dispatchEvent(new Event('wishlistCleared'));
      return { success: true, wishlist: [] };
    }
  }

  if (wishlistProductMatch && isDELETE) {
    const userId = wishlistProductMatch[1];
    const productId = Number(wishlistProductMatch[2]);
    const ids = readWishlist(userId).filter((id) => id !== productId);
    writeWishlist(userId, ids);
    return { success: true, wishlist: ids.map((id) => ({ id, productId: id })) };
  }

  if (wishlistCheckMatch && isGET) {
    const userId = wishlistCheckMatch[1];
    const productId = Number(wishlistCheckMatch[2]);
    const exists = readWishlist(userId).includes(productId);
    return { exists };
  }

  // Comments (باستخدام localStorage)
  const getCommentsKey = () => 'mockComments';
  const readComments = async (): Promise<any[]> => {
    try {
      const raw = localStorage.getItem(getCommentsKey());
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? normalizeArray(arr) : [];
    } catch { return []; }
  };
  const writeComments = (comments: any[]) => {
    localStorage.setItem(getCommentsKey(), JSON.stringify(comments));
    window.dispatchEvent(new Event('commentsUpdated'));
  };
  const nextCommentId = (comments: any[]) => {
    const maxId = comments.length ? Math.max(...comments.map((c: any) => Number(c.id) || 0)) : 0;
    return maxId + 1;
  };

  // GET /comments مع دعم التصفية والبحث والفرز والصفحة
  if (key === 'comments' && isGET) {
    const query = new URLSearchParams(endpoint.split('?')[1] || '');
    let comments = await readComments();
    const search = query.get('search') || '';
    const productIdParam = query.get('productId');
    const sortBy = (query.get('sortBy') || 'createdAt') as 'createdAt' | 'rating' | 'userName';
    const sortOrder = (query.get('sortOrder') || 'desc').toLowerCase();
    const page = parseInt(query.get('page') || '1');
    const limit = parseInt(query.get('limit') || '10');

    if (productIdParam) {
      const pid = Number(productIdParam);
      comments = comments.filter((c: any) => Number(c.productId) === pid);
    }
    if (search) {
      const s = search.toLowerCase();
      comments = comments.filter((c: any) => String(c.content || '').toLowerCase().includes(s) || String(c.userName || '').toLowerCase().includes(s));
    }

    comments.sort((a: any, b: any) => {
      const asc = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'createdAt') {
        return asc * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      if (sortBy === 'rating') {
        return asc * (((Number(a.rating) || 0) - (Number(b.rating) || 0)));
      }
      const aStr = String(a.userName || '').toLowerCase();
      const bStr = String(b.userName || '').toLowerCase();
      return asc * aStr.localeCompare(bStr);
    });

    const total = comments.length;
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
    const safePage = Math.max(1, page);
    const start = limit > 0 ? (safePage - 1) * limit : 0;
    const end = limit > 0 ? start + limit : comments.length;
    const paged = comments.slice(start, end);
    return {
      comments: paged,
      total,
      page: safePage,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    };
  }

  // GET /comments/product/:productId
  if (key.startsWith('comments/product/') && isGET) {
    const pid = Number(key.split('/')[2]);
    const comments = await readComments();
    const filtered = comments.filter((c: any) => Number(c.productId) === pid);
    return { comments: filtered };
  }

  // GET /comments/:id
  if (key.startsWith('comments/') && isGET) {
    const idStr = key.split('/')[1];
    const id = Number(idStr);
    if (!Number.isNaN(id)) {
      const comments = await readComments();
      const found = comments.find((c: any) => Number(c.id) === id) || null;
      return found || {};
    }
  }

  // POST /comments
  if (key === 'comments' && isPOST) {
    const bodyText = typeof options.body === 'string' ? options.body : (options.body ? await (options.body as any).text?.() : '{}');
    const payload = (() => { try { return JSON.parse(bodyText || '{}'); } catch { return {}; } })();
    const comments = await readComments();
    const id = nextCommentId(comments);
    const now = new Date().toISOString();

    let productInfo: any = {};
    try {
      const productsRaw = await readMockJson('/mock-data/products.json');
      const products = normalizeArray(productsRaw);
      const prod = products.find((p: any) => Number(p.id) === Number(payload.productId));
      if (prod) productInfo = { productName: prod.name, productImage: prod.mainImage };
    } catch {}

    const newComment = {
      id,
      productId: Number(payload.productId),
      userId: Number(payload.userId) || 0,
      userName: payload.userName || 'زائر',
      userEmail: payload.userEmail || '',
      content: payload.content || '',
      rating: payload.rating != null ? Number(payload.rating) : undefined,
      createdAt: now,
      updatedAt: now,
      ...productInfo,
    };
    const next = [...comments, newComment];
    writeComments(next);
    return newComment;
  }

  // PUT /comments/:id
  if (key.startsWith('comments/') && isPUT) {
    const idStr = key.split('/')[1];
    const id = Number(idStr);
    const bodyText = typeof options.body === 'string' ? options.body : (options.body ? await (options.body as any).text?.() : '{}');
    const payload = (() => { try { return JSON.parse(bodyText || '{}'); } catch { return {}; } })();
    const comments = await readComments();
    const idx = comments.findIndex((c: any) => Number(c.id) === id);
    if (idx < 0) return { success: false, message: 'التعليق غير موجود' };
    const now = new Date().toISOString();
    const updated = { ...comments[idx], ...payload, id, updatedAt: now };
    const next = [...comments];
    next[idx] = updated;
    writeComments(next);
    return updated;
  }

  // DELETE /comments/:id
  if (key.startsWith('comments/') && isDELETE) {
    const idStr = key.split('/')[1];
    const id = Number(idStr);
    const comments = await readComments();
    const next = comments.filter((c: any) => Number(c.id) !== id);
    writeComments(next);
    return { success: true };
  }

  // Static Pages (باستخدام localStorage مع seed من mock-data)
  const readStaticPages = async (): Promise<any[]> => {
    try {
      const raw = localStorage.getItem('staticPages');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return normalizeArray(arr);
      }
    } catch {}
    const seed = await readMockJson('/mock-data/static-pages.json');
    return normalizeArray(seed);
  };
  const writeStaticPages = (pages: any[]) => {
    localStorage.setItem('staticPages', JSON.stringify(pages));
    window.dispatchEvent(new Event('staticPagesChanged'));
  };

  if (key === 'static-pages' && isGET) {
    const pages = await readStaticPages();
    return augmentArray(pages, { pages });
  }

  if (key.startsWith('static-pages/slug/') && isGET) {
    const slug = decode(key.split('/')[2] || '');
    const pages = await readStaticPages();
    const found = pages.find((p: any) => String(p.slug) === String(slug));
    return found || {};
  }

  if (key.startsWith('static-pages/') && isGET) {
    const idStr = key.split('/')[1];
    const id = Number(idStr);
    if (!Number.isNaN(id)) {
      const pages = await readStaticPages();
      const found = pages.find((p: any) => Number(p.id) === id);
      return found || {};
    }
  }

  if (key === 'static-pages' && isPOST) {
    const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : {};
    const pages = await readStaticPages();
    const now = new Date().toISOString();
    const nextId = pages.length ? Math.max(...pages.map((p: any) => Number(p.id) || 0)) + 1 : 1;
    const newPage = {
      id: nextId,
      title: body.title || 'صفحة جديدة',
      slug: body.slug || String((body.title || 'page')).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s]/g, '').replace(/\s+/g, '-'),
      content: body.content || '',
      metaDescription: body.metaDescription || '',
      isActive: body.isActive !== undefined ? !!body.isActive : true,
      showInFooter: body.showInFooter !== undefined ? !!body.showInFooter : false,
      imageUrl: body.imageUrl || '',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...pages, newPage];
    writeStaticPages(updated);
    return newPage;
  }

  if (key.startsWith('static-pages/') && isPUT) {
    const idStr = key.split('/')[1];
    const id = Number(idStr);
    const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : {};
    const pages = await readStaticPages();
    const idx = pages.findIndex((p: any) => Number(p.id) === id);
    if (idx < 0) return { success: false, message: 'الصفحة غير موجودة' };
    const now = new Date().toISOString();
    const updatedPage = {
      ...pages[idx],
      ...body,
      id,
      slug: body.slug || pages[idx].slug,
      updatedAt: now,
    };
    const nextPages = [...pages];
    nextPages[idx] = updatedPage;
    writeStaticPages(nextPages);
    return updatedPage;
  }

  if (key.startsWith('static-pages/') && isDELETE) {
    const idStr = key.split('/')[1];
    const id = Number(idStr);
    const pages = await readStaticPages();
    const nextPages = pages.filter((p: any) => Number(p.id) !== id);
    writeStaticPages(nextPages);
    return { success: true };
  }

  // أي Endpoint غير مدعوم في الموك نعيد undefined ليُكمل التنفيذ إلى الخادم الحقيقي
  return undefined;
};

// دالة مساعدة لبناء URL الصور - محدثة
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return PRODUCT_PLACEHOLDER_SRC;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('data:image/')) return imagePath;

  const baseUrl = getApiBaseUrl();
  const useFrontendStatic = MOCK_MODE === true;

  // دعم مسارات أصول Vite التي تُبنى من src/assets
  // في وضع التطوير، قد تُعاد الروابط بشكل /src/assets/...؛ اخدمها مباشرة
  if (imagePath.startsWith('/src/assets/')) {
    return imagePath;
  }
  if (imagePath.startsWith('src/assets/')) {
    return `/${imagePath}`;
  }
  if (imagePath.startsWith('/assets/')) {
    return imagePath; // Vite يخدمها مباشرة
  }
  if (imagePath.startsWith('assets/')) {
    return `/${imagePath}`; // تأكيد وجود الـ slash الأول
  }

  // إذا كان المسار يبدأ بـ /api/ فهو endpoint API - لا نضيف /images/
  if (imagePath.startsWith('/api/')) {
    return `${baseUrl}${imagePath}`;
  }

  // إذا كان المسار يبدأ بـ /images/ فاخدمه من الفرونت عند الموك
  if (imagePath.startsWith('/images/')) {
    return useFrontendStatic ? imagePath : `${baseUrl}${imagePath}`;
  }

  // إذا كان المسار يبدأ بـ images/ بدون slash
  if (imagePath.startsWith('images/')) {
    return useFrontendStatic ? `/${imagePath}` : `${baseUrl}/${imagePath}`;
  }

  // إذا كان مسار عادي، أضف /images/ قبله
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return useFrontendStatic ? `/images${cleanPath}` : `${baseUrl}/images${cleanPath}`;
};

// دالة مركزية لجميع API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const method = (options.method || 'GET').toString().toUpperCase();
  // إذا كان وضع الموك مفعّل، جرّب اعتراض الطلب
  if (MOCK_MODE) {
    try {
      const mockResult = await handleMockApi(endpoint, method, options);
      if (mockResult !== undefined) return mockResult;
    } catch (mockError) {
      console.warn('Mock API error, falling back to real API:', mockError);
    }
  }
  const url = buildApiUrl(endpoint);
  
  try {
    // Don't set Content-Type for FormData - let the browser set it automatically
    const headers: Record<string, string> = {};
    
    // Only set Content-Type to application/json if body is not FormData
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // إضافة JWT token للطلبات المحمية (admin endpoints)
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken && (endpoint.includes('auth/') || endpoint.includes('users') || endpoint.includes('activity-logs') || endpoint.includes('logs/') || endpoint.includes('orders/') || endpoint.includes('customers') || endpoint.includes('admin-pin') || endpoint.includes('shipping'))) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      // في حالة انتهاء صلاحية التوكن - لكن تجاهل طلبات admin-pin
      if (response.status === 401 && adminToken && !endpoint.includes('admin-pin')) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// تصدير الثوابت المفيدة
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: 'products',
  PRODUCT_BY_ID: (id: string | number) => `products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId: string | number) => `products/category/${categoryId}`,
  PRODUCTS_BY_SUBCATEGORY: (subcategoryId: string | number) => `products/subcategory/${subcategoryId}`,
  PRODUCT_REVIEWS: (id: string | number) => `products/${id}/reviews`,
  PRODUCT_DEFAULT_OPTIONS: (productType: string) => `products/default-options/${encodeURIComponent(productType)}`,
  
  // Categories
  CATEGORIES: 'categories',
  CATEGORY_BY_ID: (id: string | number) => `categories/${id}`,
  
  // Subcategories
  SUBCATEGORIES: 'subcategories',
  SUBCATEGORIES_BY_PARENT: (parentId: string | number) => `subcategories/by-parent/${parentId}`,
  SUBCATEGORY_BY_ID: (id: string | number) => `subcategories/${id}`,

  // Cart
  USER_CART: (userId: string | number) => `user/${userId}/cart`,
  CART_UPDATE_OPTIONS: (userId: string | number) => `user/${userId}/cart/update-options`,
  CART_ITEM: (userId: string | number, itemId: string | number) => `user/${userId}/cart/${itemId}`,
  
  // Wishlist
  USER_WISHLIST: (userId: string | number) => `user/${userId}/wishlist`,
  WISHLIST_CHECK: (userId: string | number, productId: string | number) => `user/${userId}/wishlist/check/${productId}`,
  WISHLIST_PRODUCT: (userId: string | number, productId: string | number) => `user/${userId}/wishlist/product/${productId}`,
  
  // Orders
  CHECKOUT: 'checkout',
  ORDERS: 'orders',
  ORDER_BY_ID: (id: string | number) => `orders/${id}`,
  ORDER_STATUS: (id: string | number) => `orders/${id}/status`,
  USER_ORDERS: (email: string) => `orders/user/${encodeURIComponent(email)}`,
  
  // Auth
  SEND_OTP: 'auth/send-otp',
  VERIFY_OTP: 'auth/verify-otp',
  COMPLETE_REGISTRATION: 'auth/complete-registration',
  
  // Coupons
  COUPONS: 'coupons',
  VALIDATE_COUPON: 'coupons/validate',
  COUPON_BY_ID: (id: string | number) => `coupons/${id}`,
  
  // Customers
  CUSTOMERS: 'customers',
  CUSTOMER_STATS: 'customers/stats',
  CUSTOMER_BY_ID: (id: string | number) => `customers/${id}`,
  
  // Health Check
  HEALTH: 'health',
  
  // Services (if needed)
  SERVICES: 'services',
  SERVICE_BY_ID: (id: string | number) => `services/${id}`,
  
  // Authentication
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
  CHANGE_PASSWORD: 'auth/change-password',

  // Static Pages
  STATIC_PAGES: 'static-pages',
  STATIC_PAGE_BY_ID: (id: string | number) => `static-pages/${id}`,
  STATIC_PAGE_BY_SLUG: (slug: string) => `static-pages/slug/${encodeURIComponent(slug)}`,
  
  // Blog Posts - Simplified
  BLOG_POSTS: 'blog-posts',
  BLOG_POST_BY_ID: (id: string | number) => `blog-posts/${id}`,
  BLOG_POST_BY_SLUG: (slug: string) => `blog-posts/${encodeURIComponent(slug)}`,

  // Testimonials endpoints
  TESTIMONIALS: 'testimonials',
  TESTIMONIAL_BY_ID: (id: string | number) => `testimonials/${id}`,
  TESTIMONIALS_ACTIVE: 'testimonials/active',
  TESTIMONIALS_FEATURED: 'testimonials/featured',
  TESTIMONIAL_TOGGLE_ACTIVE: (id: string | number) => `testimonials/${id}/toggle-active`,
  TESTIMONIAL_TOGGLE_FEATURED: (id: string | number) => `testimonials/${id}/toggle-featured`,
  TESTIMONIAL_SORT_ORDER: (id: string | number) => `testimonials/${id}/sort-order`,

  // Clients endpoints
  CLIENTS: 'clients',
  CLIENT_BY_ID: (id: string | number) => `clients/${id}`,
  CLIENTS_ACTIVE: 'clients/active',
  CLIENTS_FEATURED: 'clients/featured',
  CLIENTS_BY_INDUSTRY: (industry: string) => `clients/industry/${encodeURIComponent(industry)}`,
  CLIENT_TOGGLE_ACTIVE: (id: string | number) => `clients/${id}/toggle-active`,
  CLIENT_TOGGLE_FEATURED: (id: string | number) => `clients/${id}/toggle-featured`,
  CLIENT_SORT_ORDER: (id: string | number) => `clients/${id}/sort-order`,

  // Users endpoints
  USERS: 'users',
  USER_BY_ID: (id: string | number) => `users/${id}`,
  USER_RESET_PASSWORD: (id: string | number) => `users/${id}/reset-password`,

  // Comments
  COMMENTS: 'comments',
  COMMENT_BY_ID: (id: string | number) => `comments/${id}`,
  PRODUCT_COMMENTS: (productId: string | number) => `comments/product/${productId}`,
  
  // Activity Logs
  ACTIVITY_LOGS: 'activity-logs',
  ACTIVITY_LOG_BY_ID: (id: string | number) => `activity-logs/${id}`,
  ACTIVITY_LOGS_STATS: 'activity-logs/stats',
  ACTIVITY_LOGS_MY: 'activity-logs/my-activities',
  ACTIVITY_LOGS_EXPORT: 'activity-logs/export/csv',
  LOGIN_LOGS: 'activity-logs?action=login',
  
  // Admin Pin Management
  ADMIN_PIN_CURRENT: 'admin-pin/current',
  ADMIN_PIN_VERIFY: 'admin-pin/verify',
  ADMIN_PIN_UPDATE: 'admin-pin/update',

  // Portfolio Management
  PORTFOLIO: {
    LIST: 'portfolios',
    CREATE: 'portfolios',
    UPDATE: (id: string | number) => `portfolios/${id}`,
    DELETE: (id: string | number) => `portfolios/${id}`,
    BY_ID: (id: string | number) => `portfolios/${id}`,
    BY_CATEGORY: (categoryId: string | number) => `portfolios/category/${categoryId}`,
    FEATURED: 'portfolios/featured',
    TOGGLE_FEATURED: (id: string | number) => `portfolios/${id}/toggle-featured`,
  },

  // Portfolio Categories Management
  PORTFOLIO_CATEGORIES: {
    LIST: 'portfolio-categories',
    CREATE: 'portfolio-categories',
    UPDATE: (id: string | number) => `portfolio-categories/${id}`,
    DELETE: (id: string | number) => `portfolio-categories/${id}`,
    BY_ID: (id: string | number) => `portfolio-categories/${id}`,
  },

  // Upload attachments
  UPLOAD_ATTACHMENTS: 'upload-attachments',

  // Banner Management
  BANNERS: {
    LIST: 'banners',
    CREATE: 'banners',
    UPDATE: (id: string | number) => `banners/${id}`,
    DELETE: (id: string | number) => `banners/${id}`,
    BY_ID: (id: string | number) => `banners/${id}`,
    TOGGLE: (id: string | number) => `banners/${id}/toggle`,
    ACTIVE: 'banners/active',
    BY_POSITION: (position: string) => `banners/active?position=${position}`,
  },

  // Shipping endpoints
  SHIPPING: {
    GET_ALL: 'shipping',
    CREATE: 'shipping',
    UPDATE: (id: string | number) => `shipping/${id}`,
    DELETE: (id: string | number) => `shipping/${id}`,
    BY_ID: (id: string | number) => `shipping/${id}`,
    TOGGLE_STATUS: (id: string | number) => `shipping/${id}/toggle-status`,
    SET_DEFAULT: (id: string | number) => `shipping/${id}/set-default`,
    BULK_SORT_ORDER: 'shipping/bulk/sort-order',
  },
  SHIPPING_ACTIVE: 'shipping',
  SHIPPING_AVAILABLE: (orderAmount: number) => `shipping/available/${orderAmount}`,

  // Collections endpoints
  COLLECTIONS: 'collections',
  COLLECTION_BY_ID: (id: string | number) => `collections/${id}`,
  COLLECTION_PRODUCTS: (id: string | number) => `collections/${id}/products`,
  COLLECTION_PREVIEW: 'collections/preview',
};

// Blog Service - Simplified
export const BlogService = {
  // Get all blog posts with optional filters
  getAllPosts: async (params?: { category?: string; limit?: number; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const endpoint = `${API_ENDPOINTS.BLOG_POSTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiCall(endpoint);
  },

  // Get single blog post by ID
  getPostById: async (id: string | number) => {
    return await apiCall(API_ENDPOINTS.BLOG_POST_BY_ID(id));
  },

  // Get single blog post by slug
  getPostBySlug: async (slug: string) => {
    return await apiCall(API_ENDPOINTS.BLOG_POST_BY_SLUG(slug));
  },

  // Create new blog post
  createPost: async (postData: any) => {
    return await apiCall(API_ENDPOINTS.BLOG_POSTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
  },

  // Update blog post
  updatePost: async (id: string | number, postData: any) => {
    return await apiCall(API_ENDPOINTS.BLOG_POST_BY_ID(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
  },

  // Delete blog post
  deletePost: async (id: string | number) => {
    return await apiCall(API_ENDPOINTS.BLOG_POST_BY_ID(id), {
      method: 'DELETE',
    });
  },
};