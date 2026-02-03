import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // استيراد المكتبة

import ForgetPasswordSchema from '../../Vaildation/ForgetPsswordSchema.js';
import api from '../../Services/api.js';

export default function ForgetPassword() {
  const { t } = useTranslation(); // استخدام الـ hook
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [serverErrors, setServerErrors] = useState([]); // (ملاحظة: هذا المتغير معرف لكن غير مستخدم في الـ JSX حالياً)

  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(ForgetPasswordSchema),
    mode: 'onBlur',
  });
  
  const navigate = useNavigate();

  const handleForgetPassword = async (value) => {
    console.log(value);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const response = await api.post("/seller/auth/forgot-password", value);
      setSuccessMessage(response.data.message);
      localStorage.setItem('email-forget-password', value.email);
      setTimeout(() => {
        navigate('/auth/send-code');
      }, 2000);
    } catch (err) {
      // استخدام الترجمة لرسائل الخطأ الافتراضية إذا لم يرسل السيرفر رسالة
      setErrorMessage(err.response?.data?.message || t("login_failed")); 
      
      if (err.response?.data?.params) {
        setServerErrors(err.response.data.params);
        Object.keys(err.response.data.params).forEach((field) => {
          setError(field, { type: 'server', message: err.response.data.params[field] });
        });
      }
    }
  }

  useEffect(() => {
    console.log('end render');
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        <div className="mb-6 flex justify-center">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {t("forgot_password_title")}
        </h2>
        
        {/* Description */}
        <p className="text-sm text-gray-500 text-center mt-2">
          {t("forgot_password_desc")}
        </p>

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mt-4 text-center">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mt-4 text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(handleForgetPassword)} className="mt-6 space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("email")}
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder={t("email_placeholder")}
              className={`w-full p-3 bg-gray-50 border rounded-lg outline-none transition-all duration-200
                ${errors.email
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                }`}
            />
            {errors.email && (<span className="text-red-500 text-sm">{errors.email.message}</span>)}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full bg-blue-400 text-white py-2 rounded-lg font-semibold
              disabled:bg-blue-200
              disabled:text-white/70
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isSubmitting ? t("submitting") : t("submit_continue")}
          </button>

        </form>

        {/* Back to login */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {t("remember_password")}{" "}
          <Link to="/auth/login" className="text-teal-600 font-medium hover:text-teal-800 transition-colors" > 
            {t("login")} 
          </Link>
        </p>

      </div>
    </div>
  );
}