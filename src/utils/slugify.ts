// تحويل النص العربي والإنجليزي إلى slug احترافي
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // استبدال المسافات بشرطات
    .replace(/\s+/g, '-')
    // إزالة الأحرف الخاصة
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\-]/g, '')
    // إزالة الشرطات المتعددة
    .replace(/-+/g, '-')
    // إزالة الشرطات من البداية والنهاية
    .replace(/^-+|-+$/g, '');
};

// إنشاء رابط احترافي للمنتج (بالاسم فقط بدون رقم)
export const createProductSlug = (id: number, name: string): string => {
  const slug = slugify(name);
  // نُرجع الاسم كـ slug فقط، بدون إضافة الـ ID
  return slug || 'product';
};

// إنشاء رابط للمنتج بدون رقم (اسم المنتج فقط)
export const createProductSlugNameOnly = (name: string): string => {
  const slug = slugify(name);
  return slug || 'service';
};

// إنشاء رابط احترافي للفئة (بالاسم فقط بدون رقم)
export const createCategorySlug = (id: number, name: string): string => {
  const slug = slugify(name);
  // نُرجع الاسم كـ slug فقط، بدون إضافة الـ ID
  return slug || 'category';
};

// استخراج ID من slug
export const extractIdFromSlug = (slug: string): number => {
  // فك ترميز الـ URL أولاً
  const decodedSlug = decodeURIComponent(slug);
  
  const match = decodedSlug.match(/-(\d+)$/);
  const extractedId = match ? parseInt(match[1], 10) : 0;
  
  return extractedId;
};

// التحقق من صحة slug
export const isValidSlug = (slug: string): boolean => {
  // فك ترميز الـ URL أولاً
  const decodedSlug = decodeURIComponent(slug);
  // صالح إذا كان اسمًا بالحروف/الأرقام والشرطات فقط،
  // أو اسمًا متبوعًا بـ -ID رقمي.
  const nameOnly = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\-]+$/;
  const withId = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\-]+-\d+$/;
  return nameOnly.test(decodedSlug) || withId.test(decodedSlug);
};