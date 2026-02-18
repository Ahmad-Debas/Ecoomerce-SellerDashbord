import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { 
  Lock, Mail, Key, Eye, EyeOff, Send, ArrowRight, ShieldCheck, CheckCircle 
} from 'lucide-react';
import api from "../../../services/api";

export default function Password() {
  const [step, setStep] = useState('request'); // 'request' (Send OTP) or 'reset' (New Password)
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // 1. Fetch User Email (Pre-fill)
  // بنجيب الإيميل من البروفايل عشان ما يضطر اليوزر يكتبه، وعشان نضمن إنه الإيميل الصحيح
  const { data: profile } = useQuery({
    queryKey: ['sellerProfile'],
    queryFn: async () => {
      const res = await api.get('/seller/profile');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, 
  });

  useEffect(() => {
    if (profile?.user?.email) {
      setEmail(profile.user.email);
    }
  }, [profile]);

  // 2. Mutation: Send OTP
  const sendOtpMutation = useMutation({
    mutationFn: (data) => api.post('/seller/auth/forgot-password', data),
    onSuccess: () => {
      toast.success("Verification code sent to your email");
      setStep('reset'); // الانتقال للخطوة التالية
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send code");
    }
  });

  // 3. Mutation: Reset Password
  const resetPassMutation = useMutation({
    mutationFn: (data) => api.post('/seller/auth/reset-password', data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      // تصفير الحقول والعودة للبداية
      setStep('request');
      setOtp('');
      setPassword('');
      setPasswordConfirmation('');
    },
    onError: (err) => {
      // التعامل مع أخطاء الـ Validation
      const errors = err.response?.data?.errors;
      if (errors) {
         Object.values(errors).forEach(e => toast.error(e[0]));
      } else {
         toast.error(err.response?.data?.message || "Failed to reset password");
      }
    }
  });

  // Handlers
  const handleSendCode = () => {
    if (!email) return toast.error("Email is required");
    sendOtpMutation.mutate({ email });
  };

  const handleResetPassword = () => {
    if (!otp) return toast.error("OTP Code is required");
    if (!password) return toast.error("New password is required");
    if (password !== passwordConfirmation) return toast.error("Passwords do not match");

    resetPassMutation.mutate({
      email,
      otp,
      password,
      password_confirmation: passwordConfirmation
    });
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-8">
      
      {/* --- Header --- */}
      <div className="pb-4 border-b border-gray-100">
         <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Lock className="text-blue-500" size={20}/> Security & Password
         </h2>
         <p className="text-sm text-gray-500">Update your password securely via email verification</p>
      </div>

      {/* --- Content Area --- */}
      <div className="max-w-xl">
        
        {/* Step 1: Request OTP */}
        {step === 'request' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <ShieldCheck className="text-blue-600 shrink-0" size={24} />
                <div className="text-sm text-blue-800">
                   <p className="font-semibold">Security Verification</p>
                   <p className="opacity-90 mt-1">To ensure account security, we need to verify your identity. We will send a One-Time Password (OTP) to your registered email.</p>
                </div>
             </div>

             <div className="space-y-4">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Registered Email</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                      type="email" 
                      value={email} 
                      readOnly 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed outline-none"
                   />
                   <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                </div>
                
                <button 
                  onClick={handleSendCode}
                  disabled={sendOtpMutation.isPending}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   {sendOtpMutation.isPending ? 'Sending...' : <>Send Verification Code <Send size={16} /></>}
                </button>
             </div>
          </div>
        )}

        {/* Step 2: Reset Password */}
        {step === 'reset' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             
             <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800">Set New Password</h3>
                <button 
                  onClick={() => setStep('request')} 
                  className="text-xs text-blue-600 hover:underline"
                >
                  Change Email?
                </button>
             </div>

             <div className="space-y-4">
                
                {/* OTP Input */}
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1.5">Verification Code (OTP)</label>
                   <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                         type="text" 
                         value={otp}
                         onChange={(e) => setOtp(e.target.value)}
                         placeholder="Enter 6-digit code"
                         className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                      />
                   </div>
                   <p className="text-xs text-gray-400 mt-1">Check your email inbox or spam folder.</p>
                </div>

                {/* New Password */}
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
                   <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                         type={showPassword ? "text" : "password"} 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         placeholder="Min 8 characters"
                         className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                   </div>
                </div>

                {/* Confirm Password */}
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm Password</label>
                   <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                         type="password" 
                         value={passwordConfirmation}
                         onChange={(e) => setPasswordConfirmation(e.target.value)}
                         placeholder="Re-enter password"
                         className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                      />
                   </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                   <button 
                     onClick={handleResetPassword}
                     disabled={resetPassMutation.isPending}
                     className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                   >
                      {resetPassMutation.isPending ? 'Updating...' : <>Reset Password <ArrowRight size={16} /></>}
                   </button>
                   
                   <button 
                     onClick={handleSendCode}
                     disabled={sendOtpMutation.isPending}
                     className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-sm disabled:opacity-50"
                   >
                     Resend Code
                   </button>
                </div>

             </div>
          </div>
        )}

      </div>
    </div>
  );
}