import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Layers, ListTree, FolderOpen } from 'lucide-react';
import { createCategorySlug } from '../../utils/slugify';
import { apiCall, API_ENDPOINTS } from '../../config/api';

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  image?: string;
  parentId?: number | null;
}

interface Subcategory extends Category {
  parentId: number;
}

interface Collection {
  _id: string;
  name: string | { ar?: string; en?: string };
  name_ar?: string;
  name_en?: string;
  description?: string;
  featured?: boolean;
  isActive?: boolean;
}

type Variant = 'default' | 'navbar';

interface Props {
  variant?: Variant;
  tone?: 'light' | 'dark';
  showCollections?: boolean;
  includeProductsLink?: boolean;
}

const CategoryCollectionBar: React.FC<Props> = ({ variant = 'default', tone = 'light', showCollections = true, includeProductsLink = false }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();

  // لم يعد هناك حاجة لقراءة ملفات الموك مباشرة هنا؛ سنعتمد على API الموحد

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('bar_cached_categories');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>(() => {
    const saved = localStorage.getItem('bar_cached_subcategories');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('bar_cached_collections');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

  // Delay closing to avoid flicker when moving between button and submenu
  const closeMenuTimerRef = useRef<number | null>(null);
  const cancelClose = () => {
    if (closeMenuTimerRef.current !== null) {
      clearTimeout(closeMenuTimerRef.current);
      closeMenuTimerRef.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeMenuTimerRef.current = window.setTimeout(() => {
      setOpenCategoryId(null);
      closeMenuTimerRef.current = null;
    }, 180);
  };

  // Close open submenu when clicking outside or pressing Escape
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (openCategoryId === null) return;
      const target = e.target as HTMLElement | null;
      const rootEl = target?.closest('[data-submenu-root-id]') as HTMLElement | null;
      const rootIdStr = rootEl?.getAttribute('data-submenu-root-id');
      if (!rootIdStr || Number(rootIdStr) !== openCategoryId) {
        setOpenCategoryId(null);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenCategoryId(null);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keyup', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keyup', handleEsc);
    };
  }, [openCategoryId]);

  const getLocalized = (item: any, field: string) => {
    const lang = i18n.language === 'ar' ? 'ar' : 'en';
    const other = lang === 'ar' ? 'en' : 'ar';

    // Prefer explicit language fields like name_ar/name_en
    const langField = `${field}_${lang}`;
    const otherField = `${field}_${other}`;
    const langValue = item?.[langField];
    const otherValue = item?.[otherField];
    if (typeof langValue === 'string' && langValue.trim()) return langValue;
    if (typeof otherValue === 'string' && otherValue.trim()) return otherValue;

    // Fallback: field may be a string or an object like { ar, en }
    const base = item?.[field];
    if (typeof base === 'string' && base.trim()) return base;
    if (base && typeof base === 'object') {
      const objLang = base?.[lang];
      const objOther = base?.[other];
      if (typeof objLang === 'string' && objLang.trim()) return objLang;
      if (typeof objOther === 'string' && objOther.trim()) return objOther;
      const first = Object.values(base).find(v => typeof v === 'string' && v.trim());
      if (typeof first === 'string') return first;
    }
    return '';
  };

  const themesFilter = (c: Category) => {
    const name = (getLocalized(c, 'name') || '').toLowerCase();
    return !(name === 'ثيمات' || name === 'themes');
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // جلب الفئات والمجموعات عبر واجهة الـ API (الموك سيتعامل داخلياً)
        const [catsRes, colsRes] = await Promise.all([
          apiCall(API_ENDPOINTS.CATEGORIES),
          apiCall(API_ENDPOINTS.COLLECTIONS),
        ]);

        const cats: Category[] = Array.isArray((catsRes as any)?.data)
          ? (catsRes as any).data
          : Array.isArray(catsRes)
            ? (catsRes as any)
            : [];
        const subs: Subcategory[] = cats.filter((c: any) => c && c.parentId != null) as Subcategory[];

        const cols: Collection[] = Array.isArray((colsRes as any)?.data)
          ? (colsRes as any).data
          : Array.isArray(colsRes)
            ? (colsRes as any)
            : [];

        // Filter main categories and remove themes
        let mainCats = cats.filter((c) => (c.parentId === null || c.parentId === undefined)).filter(themesFilter);
        // Fallback: إذا فشل تحديد الفئات الرئيسية، اعرض جميع الفئات بعد إزالة "ثيمات"
        if (mainCats.length === 0 && cats.length > 0) {
          mainCats = cats.filter(themesFilter);
        }
        setCategories(mainCats);
        setSubcategories(subs);
        setCollections(cols);

        localStorage.setItem('bar_cached_categories', JSON.stringify(mainCats));
        localStorage.setItem('bar_cached_subcategories', JSON.stringify(subs));
        localStorage.setItem('bar_cached_collections', JSON.stringify(cols));
      } catch (error) {
        console.error('Error loading bar data:', error);
      }
    };

    // Always fetch fresh data to avoid stale localStorage cache
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const subByParent = useMemo(() => {
    const map: Record<number, Subcategory[]> = {};
    for (const sub of subcategories) {
      if (!map[sub.parentId]) map[sub.parentId] = [];
      map[sub.parentId].push(sub);
    }
    return map;
  }, [subcategories]);

  const handleCategoryClick = (cat: Category) => {
    const slug = createCategorySlug(
      cat.id,
      getLocalized(cat, 'name') || String(cat.name || '')
    );
    navigate(`/category/${slug}`);
  };

  const handleSubcategoryClick = (sub: Subcategory) => {
    // Close any open submenu when selecting a subcategory
    setOpenCategoryId(null);
    const slug = createCategorySlug(
      sub.id,
      getLocalized(sub, 'name') || String(sub.name || '')
    );
    navigate(`/subcategory/${slug}`);
  };

  const handleCollectionClick = (col: Collection) => {
    navigate(`/collection/${col._id}`);
  };

  if (variant === 'navbar') {
    const isDark = tone === 'dark';
    const containerClass = isDark
      ? 'w-full bg-transparent text-white'
      : 'w-full bg-white text-black border-t border-[#6a0017] border-b border-black/10 shadow-sm';
    const itemBaseClass = isDark
      ? 'relative px-3 py-1.5 text-white hover:text-white rounded-lg hover:bg-white/10 transition-all duration-300 text-base md:text-lg font-medium group'
      : 'relative px-3 py-1.5 text-black/80 hover:text-black rounded-lg hover:bg-black/5 transition-all duration-300 text-base md:text-lg font-medium group';
    const itemOverlayClass = isDark ? 'bg-white/10' : 'bg-black/5';
    const collectionBaseClass = isDark
      ? 'hidden md:inline-flex relative px-3 py-1.5 text-white hover:text-white rounded-lg hover:bg-white/10 transition-all duration-300 text-base md:text-lg font-medium group'
      : 'hidden md:inline-flex relative px-3 py-1.5 text-black/80 hover:text-black rounded-lg hover:bg-black/5 transition-all duration-300 text-base md:text-lg font-medium group';
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className={containerClass}>
          <div className="flex items-center justify-between flex-wrap gap-3 py-1 w-full">
          {/* Items across full bar: optional Products, then categories and collections */}
          {([
            ...(includeProductsLink ? [{ type: 'products' as const }] : []),
            ...(
              showCollections
                ? [
                    ...categories.map((cat) => ({ type: 'category' as const, cat })),
                    ...collections.map((col) => ({ type: 'collection' as const, col })),
                  ]
                : [
                    ...categories.map((cat) => ({ type: 'category' as const, cat })),
                  ]
            ),
          ]).map((item) => {
            if (item.type === 'products') {
              return (
                <Link
                  key="products-link"
                  to="/products"
                  className={itemBaseClass}
                >
                  <span className="relative z-10">{t('nav.products') || 'المنتجات'}</span>
                  <div className={`absolute inset-0 rounded-lg ${itemOverlayClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </Link>
              );
            }
            if (item.type === 'category') {
              const cat = item.cat;
              const hasSubs = Array.isArray(subByParent[cat.id]) && subByParent[cat.id].length > 0;
              return (
                <div
                  key={`cat-${cat.id}`}
                  className="relative"
                  data-submenu-root-id={cat.id}
                  onMouseEnter={() => { if (hasSubs) { cancelClose(); setOpenCategoryId(cat.id); } }}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    onClick={() => handleCategoryClick(cat)}
              className={itemBaseClass}
                  >
                    <span className="relative z-10">{getLocalized(cat, 'name')}</span>
                    {hasSubs && (
                      <ChevronDown className={`w-4 h-4 ${isRTL ? 'mr-0.5' : 'ml-0.5'} inline-block align-middle transition-transform ${openCategoryId === cat.id ? 'rotate-180' : ''}`} />
                    )}
                    <div className={`absolute inset-0 rounded-lg ${itemOverlayClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </button>

                  {hasSubs && openCategoryId === cat.id && (
                    <div
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                      className="absolute mt-2 min-w-[220px] bg-white text-black rounded-xl border border-black/10 shadow-2xl p-1.5 z-[70]"
                      style={{ [isRTL ? 'right' : 'left']: 0 }}
                    >
                      <div className="px-2 py-1 text-black/70 text-[11px] flex items-center gap-2">
                        <ListTree className="w-3.5 h-3.5" />
                        <span>{t('subcategories') || 'Subcategories'}</span>
                      </div>
                      <div className="divide-y divide-black/10">
                        {subByParent[cat.id].map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubcategoryClick(sub)}
                className="w-full text-left px-2 py-1 hover:bg-black/5 rounded-lg text-xs"
                          >
                            {getLocalized(sub, 'name')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Collection item — show name only
            const col = item.col;
            return (
              <button
                key={`col-${col._id}`}
                onClick={() => handleCollectionClick(col)}
              className={collectionBaseClass}
                title={getLocalized(col, 'description') || ''}
              >
                <span className="relative z-10">{getLocalized(col, 'name')}</span>
                {col.featured && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-[#18b5d8]/10 text-[#18b5d8]">{t('featured') || 'Featured'}</span>
                )}
                <div className={`absolute inset-0 rounded-lg ${itemOverlayClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default standalone bar variant
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="w-full z-40">
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-2">
            {/* Categories Section */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-white/80 mb-1">
                <Layers className="w-4 h-4 text-[#18b5d8]" />
                <span className="text-sm font-semibold">{t('home.categories')}</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {categories.map((cat) => {
                  const hasSubs = Array.isArray(subByParent[cat.id]) && subByParent[cat.id].length > 0;
                  return (
                    <div
                      key={cat.id}
                      className="relative"
                      data-submenu-root-id={cat.id}
                      onMouseEnter={() => { if (hasSubs) { cancelClose(); setOpenCategoryId(cat.id); } }}
                      onMouseLeave={scheduleClose}
                    >
                      <button
                        onClick={() => handleCategoryClick(cat)}
                        className="group inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                      >
                        <span className="font-medium">{getLocalized(cat, 'name')}</span>
                        {hasSubs && (
                          <ChevronDown className={`w-4 h-4 transition-transform ${openCategoryId === cat.id ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {hasSubs && openCategoryId === cat.id && (
                        <div
                          onMouseEnter={cancelClose}
                          onMouseLeave={scheduleClose}
                          className="absolute mt-2 min-w-[220px] bg-[#0f172a]/95 text-white rounded-xl border border-white/10 shadow-2xl backdrop-blur-sm p-2"
                          style={{ [isRTL ? 'right' : 'left']: 0 }}
                        >
                          <div className="flex items-center gap-2 px-2 py-1 text-white/70 text-xs">
                            <ListTree className="w-3.5 h-3.5" />
                            <span>{t('subcategories') || 'Subcategories'}</span>
                          </div>
                          <div className="divide-y divide-white/5">
                            {subByParent[cat.id].map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => handleSubcategoryClick(sub)}
                                className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-sm"
                              >
                                {getLocalized(sub, 'name')}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-white/10 hidden md:block" />

            {/* Collections Section */}
            <div className="flex-1 hidden md:block">
              <div className="flex items-center gap-2 text-white/80 mb-1">
                <FolderOpen className="w-4 h-4 text-[#0891b2]" />
                <span className="text-sm font-semibold">{t('home.collections')}</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {collections.map((col) => (
                  <button
                    key={col._id}
                    onClick={() => handleCollectionClick(col)}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                    title={getLocalized(col, 'description') || ''}
                  >
                    <span className="font-medium">{getLocalized(col, 'name')}</span>
                    {col.featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#18b5d8]/20 text-[#18b5d8]">{t('featured') || 'Featured'}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCollectionBar;