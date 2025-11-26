import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, FileText, CheckCircle, Calendar } from 'lucide-react';

const ReturnPolicy: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const title = isRTL ? 'سياسة الاستبدال والاسترجاع' : 'Exchange & Return Policy';
  const lastUpdated = isRTL ? 'آخر تحديث: 25 أغسطس 2025' : 'Last updated: August 25, 2025';

  const sections = useMemo(() => {
    if (isRTL) {
      return [
        {
          heading: 'شروط الاسترجاع والاستبدال',
          items: [
            '1- ارجاع المنتج إلى حالته الأصلية التي كانت عند التسليم ويجب ألّا يكون قد تم استخدامه',
            '2- يجب على العميل إبلاغ فريق المتجر الإلكتروني عبر البريد الإلكتروني أو دعم الواتساب خلال فترة لا تزيد عن 3 أيام من تاريخ استلام الصنف الخاطئ أو طلب الاسترجاع مع ذكر سبب الاستبدال أو الاسترجاع',
            '3- يمكن الاسترجاع والاستبدال إذا كان الصنف بنفس حالته الأصلية عند الشراء ومغلفًا بالغلاف الأصلي الخاص بمتجر مستلزمات الحيوانات الأليفة، وفي حال تمت الموافقة يتم إرسال الطلب من قبل العميل خلال مدة لا تتجاوز 5 أيام',
            '4- الاستبدال والاسترجاع يكون مجانًا في حالة الأصناف المرسلة للعميل وبها خطأ أو التي بها عيب مصنعي مثل: تسلمت منتجًا غير الذي قمت بطلبه، أو تسلمت منتجًا تالفًا أو معيبًا (مثل أدوات العناية، الألعاب، الأسرّة، أو الناقلات)',
            '5- يتم استرداد نفس أصل المبلغ المطبوع على إيصال/فاتورة الشراء (ملخص الطلب) بدون مصاريف الشحن أو رسوم الجمارك والضرائب',
            '6- في الحالات الأخرى للاستبدال أو الاسترجاع (بخلاف ما تم ذكره) يتحمل العميل تكلفة الشحن',
            '7- الاسترجاع طبقًا للشروط المذكورة خلال 3 أيام من تاريخ استلام العميل للشحنة، والاستبدال خلال 5 أيام من تاريخ الاستلام، ولن يُنظر في أي طلب بعد انتهاء المدة المحددة'
          ]
        },
        {
          heading: 'سياسة الأصناف الصحية والمنتجات الاستهلاكية',
          items: [
            'الأصناف الصحية والمنتجات الاستهلاكية (مثل الطعام، المعززات، الرمل/الليتر، الشامبو المفتوح) لا تُقبل إعادتها إذا كانت مفتوحة أو مجرّبة حفاظًا على الصحة العامة',
            'يمكن إرجاع هذه الأصناف فقط إذا كانت غير مفتوحة وبحالتها الأصلية أو إذا تم شحن صنف خاطئ أو معيب، وتتحمل المتجر تكلفة الشحن في حالة الخطأ'
          ]
        },
        {
          heading: 'شروط استرداد المبالغ',
          items: [
            'يتم استرداد قيمة الأصناف التي يتم إرجاعها خلال 10 أيام من تاريخ الشراء بالنسبة للشراء النقدي (الدفع عند الاستلام)، وبالنسبة للشراء عن طريق البطاقة الائتمانية تُضاف القيمة إلى بطاقة المشتري بعد 15 يومًا من تاريخ الشراء',
            'مطلوب منك إرجاع الأصناف المشتراة بوسيلة شحن مؤمنة وموثوقة لضمان توصيل سليم وموثق إلى عنوان متجر مستلزمات الحيوانات الأليفة'
          ]
        },
        {
          heading: 'عمليات الشراء • معالجة الطلبات',
          items: [
            'متجر مستلزمات الحيوانات الأليفة، وفقًا لتقديره، قد يختار معالجة أو إلغاء طلبك في ظروف معينة (مثل نفاد المخزون، تسعير خاطئ، أو الاشتباه في الاحتيال)، أو أي ظروف أخرى تُراها مناسبة وفقًا لتقديره',
            'يحتفظ المتجر أيضًا بالحق، وفقًا لتقديره، باتخاذ خطوات للتحقق من هويتك لمعالجة طلبك',
            'لن يتم فرض رسوم عليك أو سيتم رد الرسوم للطلبات التي لم يتم معالجتها أو التي تم إلغاؤها'
          ]
        }
      ];
    }

    return [
      {
        heading: 'Return & Exchange Conditions',
        items: [
          '1- The product must be returned in its original condition as delivered and must not be used',
          '2- The customer must notify the store team via email or WhatsApp support within 3 days of receiving the wrong item or requesting a return, stating the reason for exchange or return',
          '3- Return and exchange are allowed if the item is in its original condition at purchase and sealed in the Pet Supplies Store’s original packaging. Once approved, the customer must ship the item within 5 days',
          '4- Exchange and return are free if the shipped item contains a mistake or a manufacturing defect, such as receiving the wrong product or a damaged/defective product (e.g., grooming tools, toys, beds, or carriers)',
          '5- Refunds are issued for the original amount shown on the receipt/invoice (order summary), excluding shipping costs, customs fees, and taxes',
          '6- In other cases of exchange or return (other than those mentioned), the customer bears the shipping cost',
          '7- Returns must be requested within 3 days of receiving the shipment, and exchanges within 5 days. Any request after the specified period will not be considered'
        ]
      },
      {
        heading: 'Health & Consumables Policy',
        items: [
          'Health and consumable items (e.g., food, supplements, litter, opened shampoo) cannot be returned if opened or tested, for hygiene and safety reasons',
          'These items can only be returned if unopened in original condition or if a wrong/defective item was shipped; the store bears shipping cost in case of store error'
        ]
      },
      {
        heading: 'Refund Conditions',
        items: [
          'Refunds for returned items are processed within 10 days for cash-on-delivery purchases; for credit card purchases, the amount is credited to the customer’s card within 15 days from the purchase date',
          'You must return items using a reliable, insured shipping method to ensure proper and documented delivery to the Pet Supplies Store’s address'
        ]
      },
      {
        heading: 'Purchase Operations • Order Processing',
        items: [
          'The Pet Supplies Store, at its discretion, may process or cancel your order under certain circumstances (e.g., product out of stock, mispricing, suspected fraud), or any other circumstances it deems appropriate',
          'The store also reserves the right, at its discretion, to take steps to verify your identity for order processing',
          'You will either not be charged or will be refunded for orders not processed or cancelled'
        ]
      }
    ];
  }, [isRTL]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* Background accents */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(89,42,38,0.08) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(89,42,38,0.08) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(89,42,38,0.06) 0%, transparent 70%)`,
          backgroundSize: '100% 100%',
        }} />
      </div>

      {/* Header */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12 mt-[70px] sm:mt-[80px]">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fadeInUp">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e28437]/25 to-[#e28437]/20 rounded-xl border border-[#e28437]/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[#e28437]" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a]">
              {title}
            </h1>
          </div>
          <div className="bg-white rounded-xl border border-[#e28437]/20 p-3 max-w-xs sm:max-w-md mx-auto animate-slideInRight">
            <div className="flex items-center gap-2 justify-center">
              <Calendar className="w-4 h-4 text-[#e28437]" />
              <span className="text-[#1a1a1a] font-bold text-sm sm:text-base">{lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#e28437]/15 shadow-xl p-4 sm:p-6 lg:p-8">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#e28437] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#e28437]" />
                  {section.heading}
                </h2>
                <div className="space-y-3">
                  {section.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="flex items-start gap-2 bg-[#e28437]/5 p-3 rounded-lg border border-[#e28437]/10 hover:bg-[#e28437]/10 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 text-[#e28437] mt-0.5 flex-shrink-0" />
                      <p className="text-[#1a1a1a] text-sm sm:text-base leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;