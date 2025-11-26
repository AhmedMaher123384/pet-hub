// خريطة صور الكاتيجوري المحلية داخل src/assets
// التسمية المتوقعة: ملف باسم معرف الكاتيجوري (مثال: 100.webp)

// ربط يدوي اختياري إن لزم لاحقًا
export const categoryImageMap: Record<number, string> = {
  // مثال: 100: someImportedImage
};

// التقاط تلقائي لكل الصور الموجودة داخل src/assets/categories باسم "<categoryId>.<ext>"
// وأيضًا من جذر src/assets لمن يضع الملفات هناك مباشرة
const autoAssetsCategories = import.meta.glob('./categories/*.{png,jpg,jpeg,webp,svg,gif}', { eager: true, import: 'default' }) as Record<string, string>;
const autoAssetsRoot = import.meta.glob('./*.{png,jpg,jpeg,webp,svg,gif}', { eager: true, import: 'default' }) as Record<string, string>;

const autoCategoryMap: Record<number, string> = {};

// أولاً: ملفات داخل مجلد categories
for (const [path, url] of Object.entries(autoAssetsCategories)) {
  const filename = path.split('/').pop() || '';
  const base = filename.split('.')[0];
  const idNum = Number(base);
  if (!Number.isNaN(idNum) && idNum > 0) {
    autoCategoryMap[idNum] = url as string;
  }
}

// ثانيًا: ملفات في جذر assets (لا تتعدى على ما وجدناه في categories)
for (const [path, url] of Object.entries(autoAssetsRoot)) {
  const filename = path.split('/').pop() || '';
  const base = filename.split('.')[0];
  const idNum = Number(base);
  if (!Number.isNaN(idNum) && idNum > 0 && !autoCategoryMap[idNum]) {
    autoCategoryMap[idNum] = url as string;
  }
}

export const getCategoryImage = (id: number): string | undefined => {
  // أولوية: الربط اليدوي ثم الالتقاط التلقائي
  return categoryImageMap[id] || autoCategoryMap[id];
};