// خريطة صور عملاء محلية داخل src/assets
// التسمية المتوقعة: ملف باسم معرف العميل (مثال: 1.webp)

// ربط يدوي اختياري إن لزم لاحقًا
export const clientImageMap: Record<number, string> = {
  // مثال: 1: someImportedLogo
};

// التقاط تلقائي لكل الصور الموجودة داخل src/assets/clients باسم "<clientId>.<ext>"
// وأيضًا من جذر src/assets لمن يضع الملفات هناك مباشرة
const autoAssetsClients = import.meta.glob('./clients/*.{png,jpg,jpeg,webp,svg,gif}', { eager: true, import: 'default' }) as Record<string, string>;
const autoAssetsRoot = import.meta.glob('./*.{png,jpg,jpeg,webp,svg,gif}', { eager: true, import: 'default' }) as Record<string, string>;

const autoClientMap: Record<number, string> = {};

// أولاً: ملفات داخل مجلد clients
for (const [path, url] of Object.entries(autoAssetsClients)) {
  const filename = path.split('/').pop() || '';
  const base = filename.split('.')[0];
  const idNum = Number(base);
  if (!Number.isNaN(idNum) && idNum > 0) {
    autoClientMap[idNum] = url as string;
  }
}

// ثانيًا: ملفات في جذر assets (لا تتعدى على ما وجدناه في clients)
for (const [path, url] of Object.entries(autoAssetsRoot)) {
  const filename = path.split('/').pop() || '';
  const base = filename.split('.')[0];
  const idNum = Number(base);
  if (!Number.isNaN(idNum) && idNum > 0 && !autoClientMap[idNum]) {
    autoClientMap[idNum] = url as string;
  }
}

export const getClientImage = (id: number): string | undefined => {
  // أولوية: الربط اليدوي ثم الالتقاط التلقائي
  return clientImageMap[id] || autoClientMap[id];
};