import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { 
  HiLockClosed, 
  HiOutlineKey, 
  HiExclamationCircle,
  HiCheckCircle 
} from "react-icons/hi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import api from '../../Services/api.js';
import ResetPasswordSchema from '../../Vaildation/ResetPasswordSchema.js';

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // States for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    mode: 'onBlur',
  });

  const handleResetPassword = async (data) => {
    // جلب الإيميل المخزن من الخطوة السابقة
    const email = localStorage.getItem('email-forget-password');

    // تحقق أمان بسيط
    if (!email) {
        toast.error(t("session_expired_redirect"));
        setTimeout(() => navigate('/auth/login'), 2000);
        return;
    }

    data.email = email;

    const resetPromise = api.post("/seller/auth/reset-password", data);

    toast.promise(resetPromise, {
      loading: t("resetting_password"),
      success: (response) => {
        localStorage.removeItem('email-forget-password');
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
        return response.data.message || t("password_reset_success");
      },
      error: (err) => {
        // معالجة أخطاء السيرفر (Validation Errors)
        if (err.response?.data?.params) {
            const serverErrors = err.response.data.params;
            Object.keys(serverErrors).forEach((field) => {
                setError((field), { type: 'server', message: serverErrors[field] });
            });
            return t("fix_errors");
        }
        return err.response?.data?.message || t("operation_failed");
      },
    });
  };

  return (
    <div className="w-full animate-fade-in">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-6 flex justify-center">
          <img src="/logo.png" alt="Logo" className="h-14 w-auto object-contain drop-shadow-sm" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">{t("reset_password_title")}</h2>
        <p className="text-gray-500 mt-2 text-sm">{t("reset_password_desc")}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">

        {/* OTP Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("otp_label")}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={t("otp_placeholder")}
              className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl outline-none transition-all duration-200 ltr:pl-11 rtl:pr-11 font-mono tracking-widest
                ${errors.otp 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50' 
                  : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'
                }`}
              {...register("otp")}
            />
            <HiOutlineKey className="absolute top-1/2 -translate-y-1/2 text-gray-400 text-xl ltr:left-4 rtl:right-4 pointer-events-none" />
          </div>
          {errors.otp && (
            <p className="flex items-center text-red-500 text-xs mt-2 font-medium animate-pulse">
                <HiExclamationCircle className="mr-1 text-base" /> {errors.otp.message}
            </p>
          )}
        </div>

        {/* New Password Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("new_password")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("password_placeholder")}
              className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl outline-none transition-all duration-200 ltr:pl-11 rtl:pr-11
                ${errors.password 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50' 
                  : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'
                }`}
              {...register("password")}
            />
            <HiLockClosed className="absolute top-1/2 -translate-y-1/2 text-gray-400 text-xl ltr:left-4 rtl:right-4 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("confirm_password")}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("password_placeholder")}
              className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl outline-none transition-all duration-200 ltr:pl-11 rtl:pr-11
                ${errors.password_confirmation 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50' 
                  : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'
                }`}
              {...register("password_confirmation")}
            />
            <HiCheckCircle className="absolute top-1/2 -translate-y-1/2 text-gray-400 text-xl ltr:left-4 rtl:right-4 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors p-2 rounded-full hover:bg-gray-100 ltr:right-2 rtl:left-2"
            >
              {showConfirmPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="flex items-center text-red-500 text-xs mt-2 font-medium animate-pulse">
                <HiExclamationCircle className="mr-1 text-base" /> {errors.password_confirmation.message}
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
               {t("resetting")}
             </>
          ) : t("reset_btn")}
        </button>

      </form>

      {/* Back to login */}
      <div className="text-center mt-8 text-gray-500 text-sm font-medium">
        <p>
          {t("back_to")}{" "}
          <Link
            to="/auth/login"
            className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-all ml-1"
          >
            {t("login_link")}
          </Link>
        </p>
      </div>

    </div>
  );
}