// خريطة صور المنتجات المحلية داخل src/assets
// أضف هنا صورًا فريدة لكل منتج حسب المعرّف
// يمكن توسيعها لاحقًا لبقية المنتجات

// صور محددة يدويًا (اختياري): يمكنك إبقاء الربط الصريح هنا إذا أردت
import lipstickImg from './products/13003.svg';
import foundationImg from './products/13004.svg';

export const productImageMap: Record<number, string> = {
  13003: lipstickImg as string,
  13004: foundationImg as string,
};

// التقاط تلقائي لكل الصور الموجودة داخل src/assets/products باسم "<productId>.<ext>"
// وأيضًا من جذر src/assets لمن يضع الملفات هناك مباشرة
// أمثلة: 13003.png ، 11021.webp ، 12005.svg
const autoAssetsProducts = import.meta.glob('./products/*.{png,jpg,jpeg,webp,svg,gif}', { eager: true, import: 'default' }) as Record<string, string>;
const autoAssetsRoot = import.meta.glob('./*.{png,jpg,jpeg,webp,svg,gif}', { eager: true, import: 'default' }) as Record<string, string>;

const autoMap: Record<number, string> = {};

// أولاً: ملفات داخل مجلد products
for (const [path, url] of Object.entries(autoAssetsProducts)) {
  const filename = path.split('/').pop() || '';
  const base = filename.split('.')[0];
  const idNum = Number(base);
  if (!Number.isNaN(idNum) && idNum > 0) {
    autoMap[idNum] = url as string;
  }
}

// ثانيًا: ملفات في جذر assets (لا تتعدى على ما وجدناه في products)
for (const [path, url] of Object.entries(autoAssetsRoot)) {
  const filename = path.split('/').pop() || '';
  const base = filename.split('.')[0];
  const idNum = Number(base);
  if (!Number.isNaN(idNum) && idNum > 0 && !autoMap[idNum]) {
    autoMap[idNum] = url as string;
  }
}

export const getProductImage = (id: number): string | undefined => {
  // أولوية: الربط اليدوي ثم الالتقاط التلقائي
  return productImageMap[id] || autoMap[id];
};