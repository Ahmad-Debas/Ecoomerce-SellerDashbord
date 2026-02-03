import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react"; // أيقونة للاختيار

export default function SelectLanguage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  useEffect(() => {
    setSelectedLang(i18n.language);
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleNext = () => {
    navigate("/auth/login");
  };

  return (
    <div className="flex flex-col space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">{t("select_language")}</h2>
        <p className="text-gray-500">{t("select_language_description")}</p>
      </div>

      {/* Language Options */}
      <div className="space-y-4">
        
        {/* English Option */}
        <button
          onClick={() => handleLanguageSelect('en')}
          className={`group w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 ${
            selectedLang === 'en' 
              ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100' 
              : 'border-gray-100 hover:border-teal-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-4">
             {/* علم بتصميم CSS بسيط ونظيف */}
             <div className="w-10 h-7 bg-blue-900 rounded shadow-sm relative overflow-hidden flex items-center justify-center">
                <span className="text-[10px] font-bold text-white tracking-widest">US</span>
             </div>
             <span className={`font-bold text-lg ${selectedLang === 'en' ? 'text-teal-800' : 'text-gray-700'}`}>
               English
             </span>
          </div>
          
          {selectedLang === 'en' && <CheckCircle className="text-teal-600" size={24} />}
        </button>

        {/* Arabic Option */}
        <button
          onClick={() => handleLanguageSelect('ar')}
          className={`group w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 ${
            selectedLang === 'ar' 
              ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100' 
              : 'border-gray-100 hover:border-teal-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-7 bg-green-700 rounded shadow-sm relative overflow-hidden flex items-center justify-center">
                <span className="text-[10px] font-bold text-white tracking-widest">SA</span>
             </div>
             <span className={`font-bold text-lg ${selectedLang === 'ar' ? 'text-teal-800' : 'text-gray-700'}`}>
               العربية
             </span>
          </div>

          {selectedLang === 'ar' && <CheckCircle className="text-teal-600" size={24} />}
        </button>

      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="w-full py-4 bg-[#2D2D3F] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-[0.98]"
      >
        {t("next")}
      </button>
      
    </div>
  );
}