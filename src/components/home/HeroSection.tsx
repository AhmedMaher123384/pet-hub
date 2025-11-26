import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroImage from '../../assets/hero.jpeg';

const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative w-full overflow-hidden">
      
      {/* صورة الخلفية بعرض كامل الصفحة وارتفاع تلقائي */}
      <img 
        src={heroImage} 
        alt="Hero"
        className="w-full h-auto block z-0"
      />

      {/* طبقة overlay متدرجة */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30"></div>

      {/* طبقة ضوء ديناميكي */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#e28437]/5 to-transparent"></div>

      {/* المحتوى الرئيسي مثبت فوق الصورة */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full text-center px-8 space-y-5">

        

        <div className="relative group">
      


          {/* الهالة الخارجية */}
          <div className="absolute inset-0 rounded-2xl bg-[#e28437] opacity-0 group-hover:opacity-30 blur-xl scale-75 group-hover:scale-125 transition-all duration-700 -z-30"></div>
        </div>

        {/* نقاط ديكور */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-[#e28437]/60 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-16 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 left-20 w-1.5 h-1.5 bg-[#e28437]/40 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 right-12 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000"></div>
      </div>
    </section>
  );
};

export default HeroSection;