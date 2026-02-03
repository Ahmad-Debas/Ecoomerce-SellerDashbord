import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 
import toast from 'react-hot-toast';
import { HiShieldCheck, HiOutlineRefresh } from "react-icons/hi";
import api from "../../Services/api";

export default function VerifyAccount() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");

  // استخراج الإيميل القادم من صفحة التسجيل
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      toast.error(t("register_first"));
      navigate("/auth/register");
    }
  }, [location, navigate, t]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    const payload = {
      email: email,
      otp: data.otp
    };

    const promise = api.post("/seller/auth/verify-email", payload); 

    toast.promise(promise, {
      loading: t("activating"),
      success: (res) => {
        setTimeout(() => navigate('/auth/login'), 2000);
        return res.data.message || t("account_activated");
      },
      error: (err) => err.response?.data?.message || t("invalid_code")
    });
  };

  const handleResendCode = async () => {
    try {
      await api.post("/seller/auth/resend-verification-email", { email });
      toast.success(t("code_sent"));
    } catch (error) {
      toast.error(t("resend_failed"));
    }
  };

  return (
    <div className="w-full animate-fade-in text-center">
      
      {/* Header & Icon */}
      <div className="mb-8 flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-sm animate-bounce-slow">
           <HiShieldCheck className="text-teal-600 w-10 h-10" />
        </div>

        <div className="mb-4">
           <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain mx-auto" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t("verify_account_title")}</h2>
        <p className="text-gray-500 text-sm">
          {t("verify_account_desc")} <br />
          <span className="font-bold text-teal-700 mt-1 block text-base">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-sm mx-auto">
        
        {/* OTP Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {t("otp_label")}
          </label>
          <input
            {...register("otp", { 
                required: t("code_required"),
                pattern: {
                    value: /^[0-9]+$/,
                    message: t("otp_number_only") // تأكد من إضافة هذا المفتاح للترجمة أو استخدم نص ثابت
                }
            })}
            type="text"
            placeholder="— — — — — —"
            maxLength={6}
            className={`w-full py-4 bg-gray-50 border rounded-2xl text-center text-3xl font-bold tracking-[0.5em] outline-none transition-all duration-200 text-gray-800 placeholder-gray-300
              ${errors.otp 
                ? 'border-red-500 focus:ring-4 focus:ring-red-100' 
                : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'
              }`}
          />
          {errors.otp && (
            <p className="text-red-500 text-xs mt-2 font-medium animate-pulse">
              {errors.otp.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#2D2D3F] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
             <>
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               {t("verifying")}
             </>
          ) : t("activate_account")}
        </button>
      </form>

      {/* Resend Code */}
      <div className="mt-8 pt-6 border-t border-gray-50">
        <p className="text-gray-500 text-sm mb-3">{t("didnt_receive_code")}</p>
        <button 
          onClick={handleResendCode}
          className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-800 hover:bg-teal-50 px-4 py-2 rounded-lg transition-all"
        >
          <HiOutlineRefresh size={18} />
          {t("resend_code")}
        </button>
      </div>

    </div>
  );
}