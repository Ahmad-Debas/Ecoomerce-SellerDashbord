import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { HiExclamationCircle, HiOutlineMail, HiLockClosed } from "react-icons/hi"; 
import { useNavigate, Link } from "react-router-dom";
import toast from 'react-hot-toast';

import api from "../../Services/api"; 
import LoginSchema from "../../Vaildation/LoginSchema";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(LoginSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data) => {
    const loginPromise = api.post("/seller/auth/login", data);
    
    toast.promise(loginPromise, {
      loading: t('signing_in'),
      success: (response) => {
        const token = response.data.data.token;
        const userData = response.data.data.user.user;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
        
        return response.data.message || t('login_success');
      },
      error: (err) => {
        return err.response?.data?.message || t('login_failed');
      },
    }, {
      style: { minWidth: '300px' },
      success: { duration: 4000, icon: '👏' },
    });
  };

  return (
    <div className="w-full animate-fade-in">
      {/* Header Section */}
      <div className="mb-10 text-center">
        <div className="mb-6 flex justify-center">
          <img src="/logo.png" alt="Logo" className="h-14 w-auto object-contain drop-shadow-sm" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">{t("login")}</h2>
        <p className="text-gray-500 mt-2">{t("welcome_back")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("email")}
          </label>
          <div className="relative">
            <input
              {...register("email")}
              type="email"
              placeholder={t("email_placeholder")}
              // كلاسات Tailwind للتعامل مع RTL/LTR في الـ Padding
              className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl outline-none transition-all duration-200 ltr:pl-11 rtl:pr-11
                ${errors.email 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50' 
                  : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'
                }`}
            />
            {/* أيقونة البريد تتغير مكانها تلقائياً */}
            <HiOutlineMail className="absolute top-1/2 -translate-y-1/2 text-gray-400 text-xl ltr:left-4 rtl:right-4 pointer-events-none" />
          </div>
          {errors.email && (
            <p className="flex items-center text-red-500 text-xs mt-2 font-medium animate-pulse">
              <HiExclamationCircle className="mr-1 text-base" /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("password")}
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder={t("password_placeholder")}
              className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl outline-none transition-all duration-200 ltr:pl-11 rtl:pr-11
                ${errors.password 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50' 
                  : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'
                }`}
            />
            
            {/* أيقونة القفل */}
            <HiLockClosed className="absolute top-1/2 -translate-y-1/2 text-gray-400 text-xl ltr:left-4 rtl:right-4 pointer-events-none" />

            {/* زر إظهار/إخفاء كلمة المرور */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              // استخدام ltr/rtl classes لتحديد المكان بدقة
              className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors p-2 rounded-full hover:bg-gray-100 ltr:right-2 rtl:left-2"
            >
              {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center text-red-500 text-xs mt-2 font-medium animate-pulse">
               <HiExclamationCircle className="mr-1 text-base" /> {errors.password.message}
            </p>
          )}
        </div>

        {/* Checkbox & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none group">
            <input 
              type="checkbox" 
              {...register("rememberMe")} 
              className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer transition accent-teal-600"
            />
            <span className="group-hover:text-gray-800 transition-colors">{t("remember_me")}</span>
          </label>
          <Link to="/auth/forgot-password" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors hover:underline">
            {t("forget_pass")}
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#2D2D3F] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
             <>
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               {t("processing")}
             </>
          ) : t("login")}
        </button>

        {/* Footer Link */}
        <div className="text-center pt-2 text-gray-500 text-sm font-medium">
          <p>
            {t("dont_have_account")}{" "}
            <Link 
              to="/auth/register" 
              className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-all ml-1"
            >
              {t("register_now")}
            </Link>
          </p>
        </div>

      </form>
    </div>
  );
}