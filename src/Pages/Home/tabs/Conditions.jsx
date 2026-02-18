import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { 
  Edit3, Save, X, ShieldCheck, FileText, Check, AlertCircle, ExternalLink 
} from 'lucide-react';
import api from "../../../services/api";

export default function Conditions() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  // الحالة الافتراضية للسياسات (0: غير موافق، 1: موافق)
  const [policies, setPolicies] = useState({
    is_accepted_term: 0,
    is_accepted_policy: 0,
    is_accepted_return: 0,
    is_accepted_finance: 0
  });

  // 1. Fetch Current Status
  const { data: termsData, isLoading } = useQuery({
    queryKey: ['sellerTerms'],
    queryFn: async () => {
      const res = await api.get('/seller/profile/terms');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, 
  });

  // 2. Sync State (Mapping GET keys to POST keys)
  useEffect(() => {
    if (termsData) {
      // الـ API برجع null اذا مش موافق، وتاريخ او قيمة اذا موافق
      // احنا بنحولها لـ 1 او 0
      setPolicies({
        is_accepted_term: termsData.terms_condition ? 1 : 0,
        is_accepted_policy: termsData.privacy_policy ? 1 : 0,
        is_accepted_return: termsData.return_policy ? 1 : 0,
        is_accepted_finance: termsData.finance_policy ? 1 : 0,
      });
    }
  }, [termsData]);

  // 3. Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => api.post('/seller/profile/terms/accept', data), // يرسل JSON تلقائياً
    onSuccess: () => {
      toast.success("Terms & Conditions updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries(['sellerTerms']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
    }
  });

  const handleSave = () => {
    // التأكد من الموافقة على الشروط الأساسية (اختياري حسب البزنس لوجيك تبعك)
    // هنا بنبعث الداتا زي ما هي في الـ State
    updateMutation.mutate(policies);
  };

  const handleToggle = (key) => {
    setPolicies(prev => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1 // قلب القيمة بين 1 و 0
    }));
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading terms...</div>;

  // تعريف قائمة السياسات لسهولة التكرار (Rendering)
  const policyList = [
    {
      key: 'is_accepted_term',
      title: 'Terms & Conditions',
      desc: 'General rules covering the use of the platform and seller responsibilities.',
      lastAccepted: termsData?.terms_condition
    },
    {
      key: 'is_accepted_policy',
      title: 'Privacy Policy',
      desc: 'How we collect, use, and share your personal and business data.',
      lastAccepted: termsData?.privacy_policy
    },
    {
      key: 'is_accepted_return',
      title: 'Return Policy',
      desc: 'Guidelines regarding product returns, refunds, and dispute resolution.',
      lastAccepted: termsData?.return_policy
    },
    {
      key: 'is_accepted_finance',
      title: 'Finance Policy',
      desc: 'Details on payouts, commission rates, and withdrawal schedules.',
      lastAccepted: termsData?.finance_policy
    }
  ];

  return (
    <div className="w-full max-w-full overflow-hidden space-y-8">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-4">
        <div>
           <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={20}/> Terms & Policies
           </h2>
           <p className="text-sm text-gray-500">Review and accept the platform's legal agreements</p>
        </div>
        <div className="self-end sm:self-auto">
          {isEditing ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={updateMutation.isPending}
                className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm whitespace-nowrap"
              >
                {updateMutation.isPending ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 whitespace-nowrap"
            >
              <Edit3 size={16} /> Edit Consents
            </button>
          )}
        </div>
      </div>

      {/* --- Policies List --- */}
      <div className="grid grid-cols-1 gap-4">
        {policyList.map((item) => {
          const isAccepted = policies[item.key] === 1;

          return (
            <div 
              key={item.key} 
              className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                isAccepted 
                  ? 'bg-white border-gray-200 shadow-sm' 
                  : 'bg-gray-50 border-gray-200 opacity-80'
              }`}
            >
              <div className="flex items-start gap-4">
                
                {/* Icon Box */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isAccepted ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  <FileText size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className={`font-semibold text-sm sm:text-base ${isAccepted ? 'text-gray-900' : 'text-gray-600'}`}>
                      {item.title}
                    </h3>
                    
                    {/* Status Badge (View Mode) */}
                    {!isEditing && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${
                        isAccepted 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {isAccepted ? <Check size={12} /> : <AlertCircle size={12} />}
                        {isAccepted ? (item.lastAccepted ? `Accepted on ${item.lastAccepted}` : 'Accepted') : 'Not Accepted'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                  
                  {/* Link to read full policy (Placeholder) */}
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1">
                    Read Policy <ExternalLink size={10} />
                  </button>
                </div>

                {/* Checkbox Toggle (Edit Mode) */}
                {isEditing && (
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isAccepted}
                      onChange={() => handleToggle(item.key)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}