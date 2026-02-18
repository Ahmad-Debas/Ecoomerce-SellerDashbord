import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { 
  Edit3, Save, X, Upload, FileText, CheckCircle, AlertTriangle, Landmark, CreditCard, User 
} from 'lucide-react';
import api from "../../../services/api";

export default function KycInformation() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [filePreview, setFilePreview] = useState(null);

  // ... (نفس الـ Hooks والـ Logic بدون تغيير) ...
  // 1. Fetch KYC Status
  const { data: statusData } = useQuery({
    queryKey: ['kycStatus'],
    queryFn: async () => {
      const res = await api.get('/seller/profile/kyc-status');
      return res.data.data;
    }
  });

  // 2. Fetch Existing Data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['sellerProfile'],
    queryFn: async () => {
      const res = await api.get('/seller/profile');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // 3. Sync State
  useEffect(() => {
    if (profile) {
      setFormData({
        bank_name: profile.seller_details?.bank_name || '',
        account_number: profile.seller_details?.account_number || '',
        account_holder: profile.seller_details?.account_holder || '',
        iban: profile.seller_details?.iban || '',
        commercial_registration: null 
      });
    }
  }, [profile]);

  // 4. Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => api.post('/seller/profile/kyc', data),
    onSuccess: () => {
      toast.success("KYC Information updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries(['sellerProfile']);
      queryClient.invalidateQueries(['kycStatus']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
    }
  });

  const handleSave = () => {
    const data = new FormData();
    data.append('_method', 'PUT');

    const appendIf = (key, val) => {
      if (val !== null && val !== undefined && val !== "") data.append(key, val);
    };

    appendIf('bank_name', formData.bank_name);
    appendIf('account_number', formData.account_number);
    appendIf('account_holder', formData.account_holder);
    appendIf('iban', formData.iban);

    if (formData.commercial_registration instanceof File) {
      data.append('commercial_registration', formData.commercial_registration);
    }

    updateMutation.mutate(data);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, commercial_registration: file }));
      setFilePreview(file.name);
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading KYC info...</div>;

  const seller = profile?.seller_details;

  return (
    // ✅ تحسين الحاوية الرئيسية
    <div className="w-full max-w-full overflow-hidden space-y-8">
      
      {/* --- 1. Status Banner --- */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start gap-3 ${
         statusData?.is_complete 
         ? 'bg-green-50 border-green-200 text-green-800' 
         : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
         <div className="flex items-center gap-2 sm:gap-0 shrink-0">
             {statusData?.is_complete ? (
                 <CheckCircle className="text-green-600" size={20} />
             ) : (
                 <AlertTriangle className="text-amber-600" size={20} />
             )}
             <span className="font-bold text-sm sm:hidden">
                 {statusData?.is_complete ? "Verified" : "Action Required"}
             </span>
         </div>
         
         <div className="flex-1">
             <h3 className="font-bold text-sm hidden sm:block">
                 {statusData?.is_complete ? "KYC Verification Complete" : "Action Required"}
             </h3>
             <p className="text-xs mt-1 opacity-90 leading-relaxed">
                 {statusData?.is_complete 
                    ? "Your banking details and legal documents are verified. You can receive payouts." 
                    : "Please complete your banking information and upload your Commercial Registration to enable payouts."}
             </p>
             
             {!statusData?.is_complete && statusData?.missing_fields?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                    {statusData.missing_fields.map(field => (
                        <span key={field} className="px-2 py-0.5 bg-white/50 rounded text-[10px] font-mono border border-amber-200/50 uppercase tracking-wide">
                            {field.replace('_', ' ')}
                        </span>
                    ))}
                </div>
             )}
         </div>
      </div>

      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-4">
        <div>
           <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Landmark className="text-blue-500" size={20}/> Banking & Legal
           </h2>
           <p className="text-sm text-gray-500">Manage your payout account and legal documents</p>
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
              <Edit3 size={16} /> Edit Details
            </button>
          )}
        </div>
      </div>

      {/* --- 2. Bank Information Form --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="md:col-span-2">
             <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bank Account Details</h3>
          </div>

          <Field 
             label="Bank Name" 
             value={isEditing ? formData.bank_name : seller?.bank_name} 
             onChange={v => setFormData({...formData, bank_name: v})} 
             isEditing={isEditing} 
             icon={<Landmark size={14} />}
             placeholder="e.g. Al Rajhi Bank"
          />

          <Field 
             label="Account Holder Name" 
             value={isEditing ? formData.account_holder : seller?.account_holder} 
             onChange={v => setFormData({...formData, account_holder: v})} 
             isEditing={isEditing} 
             icon={<User size={14} />}
             placeholder="Beneficiary Name"
          />

          <Field 
             label="Account Number" 
             value={isEditing ? formData.account_number : seller?.account_number} 
             onChange={v => setFormData({...formData, account_number: v})} 
             isEditing={isEditing} 
             icon={<CreditCard size={14} />}
             type="number"
          />

          <Field 
             label="IBAN" 
             value={isEditing ? formData.iban : seller?.iban} 
             onChange={v => setFormData({...formData, iban: v})} 
             isEditing={isEditing} 
             placeholder="SA00 0000 0000 0000 0000 00"
          />
      </div>

      {/* --- 3. Legal Documents (File Upload) --- */}
      <div className="pt-6 border-t border-gray-100">
         <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Legal Documents</h3>
         
         <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
             {/* ✅ تحسين التجاوب هنا: عمودي للموبايل، أفقي للتابلت+ */}
             <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                 
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                     <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                         <FileText size={24} />
                     </div>
                     <div className="flex-1 min-w-0">
                         <h4 className="text-sm font-semibold text-gray-900 truncate">Commercial Registration (CR)</h4>
                         <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                             {seller?.commercial_registration 
                                ? "Document is uploaded and active." 
                                : "Please upload a valid PDF or Image of your CR."}
                         </p>
                         
                         {isEditing && filePreview && (
                            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block max-w-full truncate">
                                Selected: {filePreview}
                            </div>
                         )}
                     </div>
                 </div>

                 <div className="w-full sm:w-auto mt-2 sm:mt-0">
                     {isEditing ? (
                         <label className="cursor-pointer w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2">
                             <Upload size={16} />
                             <span>Upload New</span>
                             <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                         </label>
                     ) : (
                         seller?.commercial_registration ? (
                             <a 
                               href={seller.commercial_registration} 
                               target="_blank" 
                               rel="noreferrer"
                               className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2"
                             >
                                <FileText size={16} /> View Document
                             </a>
                         ) : (
                             <div className="px-4 py-2 bg-gray-50 rounded-lg text-xs text-gray-400 italic text-center border border-gray-100">
                                Not Uploaded
                             </div>
                         )
                     )}
                 </div>
             </div>
         </div>
      </div>

    </div>
  );
}

// --- Helper Component ---
// ✅ إضافة min-w-0 و truncate لمنع كسر التصميم
const Field = ({ label, value, onChange, isEditing, type="text", icon, placeholder }) => (
    <div className="w-full min-w-0">
      <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1 truncate">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          {label}
      </label>
      {isEditing ? (
          <input 
              type={type} 
              value={value || ''} 
              onChange={(e) => onChange(e.target.value)} 
              placeholder={placeholder}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-gray-900" 
          />
      ) : (
          <div className="text-sm font-medium text-gray-900 py-2 border-b border-gray-100 min-h-[36px] flex items-center truncate">
              {value ? <span className="font-mono truncate">{value}</span> : <span className="text-gray-400 italic text-xs">Not provided</span>}
          </div>
      )}
    </div>
);