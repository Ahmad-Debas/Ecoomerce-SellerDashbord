import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { 
  Edit3, Save, X, Upload, Globe, MapPin, Store, Phone, Mail, User, FileText, FileCheck 
} from 'lucide-react';
import api from "../../../services/api"; 

export default function MainInformation() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);

  // ... (نفس كود الـ Fetch و Mutation و useEffect بدون تغيير) ...
  // حفاظاً على المساحة، سأضع هنا الأجزاء المعدلة في الـ Return فقط
  
  // 1. Fetch Profile Data
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['sellerProfile'],
    queryFn: async () => {
      const res = await api.get('/seller/profile');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, 
  });

  useEffect(() => {
    if (profile && isEditing) {
      setFormData({
        first_name: profile.user?.first_name,
        last_name: profile.user?.last_name,
        phone_number: profile.user?.phone_number,
        phone_code: profile.user?.phone_code,
        country_id: profile.user?.country?.id,
        currency_id: profile.user?.currency?.id,
        store_name_en: profile.seller_details?.store_name_en,
        store_name_ar: profile.seller_details?.store_name_ar,
        description_en: profile.seller_details?.description_en,
        description_ar: profile.seller_details?.description_ar,
        address: profile.seller_details?.address,
        store_website: profile.seller_details?.store_website,
        logo: null, 
        commercial_registration: null,
        _method: "PUT"
      });
      setLogoPreview(profile.seller_details?.logo);
    }
  }, [profile, isEditing]);

  const updateMutation = useMutation({
    mutationFn: (data) => api.post('/seller/profile', data),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries(['sellerProfile']);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Update failed";
      toast.error(msg);
    }
  });

  const handleSave = () => {
    const data = new FormData();
    data.append('_method', 'PUT'); 

    const appendIf = (key, val) => {
      if (val !== null && val !== undefined && val !== "") data.append(key, val);
    };

    // ... (نفس منطق التخزين appendIf) ...
    appendIf('first_name', formData.first_name);
    appendIf('last_name', formData.last_name);
    appendIf('phone_number', formData.phone_number);
    appendIf('phone_code', formData.phone_code);
    appendIf('country_id', formData.country_id);
    appendIf('currency_id', formData.currency_id);
    appendIf('store_name_en', formData.store_name_en);
    appendIf('store_name_ar', formData.store_name_ar);
    appendIf('description_en', formData.description_en);
    appendIf('description_ar', formData.description_ar);
    appendIf('address', formData.address);
    appendIf('store_website', formData.store_website);

    if (formData.logo instanceof File) data.append('logo', formData.logo);
    if (formData.commercial_registration instanceof File) data.append('commercial_registration', formData.commercial_registration);

    updateMutation.mutate(data);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCrChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, commercial_registration: file }));
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading...</div>;
  if (isError) return <div className="p-10 text-center text-red-500">Error loading profile.</div>;

  const user = profile?.user;
  const seller = profile?.seller_details;

  return (
    // ✅ إضافة w-full و max-w-full و overflow-hidden للحاوية الرئيسية
    <div className="w-full max-w-full overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-100 gap-4">
        <div>
           <h2 className="text-lg font-bold text-gray-800">Main Information</h2>
           <p className="text-sm text-gray-500">Manage your personal and store details</p>
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
                {updateMutation.isPending ? 'Saving...' : <><Save size={16} /> Save</>}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 whitespace-nowrap"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Content Form / View */}
      <div className="space-y-8">
        
        {/* Section 1: Personal Info */}
        <section>
           <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} className="text-blue-500"/> Personal Details
           </h3>
           {/* ✅ Grid متجاوب: عمود واحد للموبايل، وعمودين للشاشات الأكبر */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Field 
                label="First Name" 
                value={isEditing ? formData.first_name : user?.first_name} 
                onChange={v => setFormData({...formData, first_name: v})} 
                isEditing={isEditing} 
              />
              <Field 
                label="Last Name" 
                value={isEditing ? formData.last_name : user?.last_name} 
                onChange={v => setFormData({...formData, last_name: v})} 
                isEditing={isEditing} 
              />
              <Field 
                label="Email" 
                value={user?.email} 
                readOnly={true}
                isEditing={isEditing} 
                icon={<Mail size={14}/>}
              />
               <div className="flex gap-2">
                  <div className="w-1/3 min-w-[80px]"> {/* ✅ min-w للكود */}
                    <Field 
                        label="Code" 
                        value={isEditing ? formData.phone_code : user?.phone_code} 
                        onChange={v => setFormData({...formData, phone_code: v})} 
                        isEditing={isEditing}
                        placeholder="+966"
                    />
                  </div>
                  <div className="w-2/3">
                    <Field 
                        label="Phone Number" 
                        value={isEditing ? formData.phone_number : user?.phone_number} 
                        onChange={v => setFormData({...formData, phone_number: v})} 
                        isEditing={isEditing}
                        icon={<Phone size={14}/>}
                    />
                  </div>
               </div>
           </div>
        </section>

        {/* Section 2: Store Info */}
        <section className="pt-6 border-t border-gray-100">
           <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Store size={16} className="text-purple-500"/> Store Information
           </h3>

           {/* ✅ التعديل الرئيسي هنا: استخدام flex-col للموبايل والتابلت، و xl:flex-row للشاشات الكبيرة */}
           <div className="flex flex-col xl:flex-row gap-8 mb-6">
              
              {/* Left Column: Uploads (Logo & CR) */}
              {/* في الموبايل، نجعلهم بجانب بعضهم أو تحت بعضهم حسب المساحة */}
              <div className="flex flex-row sm:flex-col gap-5 w-full xl:w-auto flex-shrink-0 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
                  
                  {/* 1. Store Logo */}
                  <div className="flex-shrink-0">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Store Logo</label>
                      <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 ${isEditing ? 'cursor-pointer hover:bg-gray-100 border-blue-300' : 'border-gray-200'}`}>
                          {logoPreview || seller?.logo ? (
                              <img src={logoPreview || seller?.logo} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                              <span className="text-xs text-gray-400 text-center px-2">No Logo</span>
                          )}
                          
                          {isEditing && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                  <Upload className="text-white" size={24} />
                                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoChange} />
                              </div>
                          )}
                      </div>
                  </div>

                  {/* 2. Commercial Registration (CR) */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Commercial Reg.</label>
                    {isEditing ? (
                        <div className="relative">
                            <input 
                                type="file" 
                                id="cr-upload" 
                                className="hidden" 
                                accept=".pdf,.png,.jpg,.jpeg" 
                                onChange={handleCrChange}
                            />
                            <label 
                                htmlFor="cr-upload" 
                                className={`flex flex-col items-center justify-center w-28 h-24 sm:w-32 sm:h-24 border-2 border-dashed rounded-xl cursor-pointer transition ${formData.commercial_registration ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
                            >
                                {formData.commercial_registration ? (
                                    <>
                                        <FileCheck className="text-green-600 mb-1" size={20} />
                                        <span className="text-[10px] text-green-700 font-medium text-center px-1 break-all line-clamp-2 w-full overflow-hidden">
                                            {formData.commercial_registration.name}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="text-gray-400 mb-1" size={20} />
                                        <span className="text-[10px] text-gray-500 text-center">Upload PDF/Img</span>
                                    </>
                                )}
                            </label>
                        </div>
                    ) : (
                        // View Mode
                        seller?.commercial_registration ? (
                            <a 
                                href={seller.commercial_registration} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex flex-col items-center justify-center w-28 h-24 sm:w-32 sm:h-24 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition text-gray-600 group text-decoration-none"
                            >
                                <FileText size={24} className="mb-2 text-blue-500 group-hover:scale-110 transition" />
                                <span className="text-[10px] font-medium text-center">View Document</span>
                            </a>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-28 h-24 sm:w-32 sm:h-24 bg-gray-50 border border-gray-200 rounded-xl text-gray-400">
                                <span className="text-[10px] text-center">Not Uploaded</span>
                            </div>
                        )
                    )}
                  </div>
              </div>

              {/* Right Column: Inputs */}
              {/* ✅ إضافة min-w-0 لمنع تجاوز العرض */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 content-start min-w-0">
                <Field 
                    label="Store Name (EN)" 
                    value={isEditing ? formData.store_name_en : seller?.store_name_en} 
                    onChange={v => setFormData({...formData, store_name_en: v})} 
                    isEditing={isEditing} 
                />
                <Field 
                    label="Store Name (AR)" 
                    value={isEditing ? formData.store_name_ar : seller?.store_name_ar} 
                    onChange={v => setFormData({...formData, store_name_ar: v})} 
                    isEditing={isEditing} 
                    dir="rtl"
                />
                <Field 
                    label="Website" 
                    value={isEditing ? formData.store_website : seller?.store_website} 
                    onChange={v => setFormData({...formData, store_website: v})} 
                    isEditing={isEditing} 
                    icon={<Globe size={14}/>}
                />
                 <Field 
                    label="Address" 
                    value={isEditing ? formData.address : seller?.address} 
                    onChange={v => setFormData({...formData, address: v})} 
                    isEditing={isEditing} 
                    icon={<MapPin size={14}/>}
                />
              </div>
           </div>

           <div className="grid grid-cols-1 gap-6">
              <TextArea 
                 label="Description (EN)"
                 value={isEditing ? formData.description_en : seller?.description_en}
                 onChange={v => setFormData({...formData, description_en: v})}
                 isEditing={isEditing}
              />
               <TextArea 
                 label="Description (AR)"
                 value={isEditing ? formData.description_ar : seller?.description_ar}
                 onChange={v => setFormData({...formData, description_ar: v})}
                 isEditing={isEditing}
                 dir="rtl"
              />
           </div>
        </section>
      </div>
    </div>
  );
}

// --- Helper Components ---
// ✅ تأكدنا أن الـ Input يأخذ w-full دائماً
const Field = ({ label, value, onChange, isEditing, type="text", dir="ltr", icon, readOnly=false, placeholder }) => (
  <div className="w-full min-w-0"> {/* ✅ min-w-0 مهمة جداً داخل الـ Grid */}
    <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1 truncate">
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        {label}
    </label>
    {isEditing && !readOnly ? (
        <input 
            type={type} 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)} 
            dir={dir}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition text-sm text-gray-900" 
        />
    ) : (
        <div className={`text-sm font-medium text-gray-900 py-2 border-b border-gray-100 min-h-[36px] truncate ${readOnly && isEditing ? 'bg-gray-50 text-gray-500 px-2 rounded border-none' : ''} ${dir === 'rtl' ? 'text-right font-arabic' : ''}`}>
            {value || <span className="text-gray-400 italic text-xs">Not set</span>}
        </div>
    )}
  </div>
);

const TextArea = ({ label, value, onChange, isEditing, dir="ltr" }) => (
    <div className="w-full min-w-0">
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {isEditing ? (
          <textarea 
              rows={3}
              value={value || ''} 
              onChange={(e) => onChange(e.target.value)} 
              dir={dir}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition text-sm text-gray-900 resize-none" 
          />
      ) : (
          <div className={`text-sm text-gray-700 leading-relaxed py-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100 break-words ${dir === 'rtl' ? 'text-right font-arabic' : ''}`}>
              {value || <span className="text-gray-400 italic text-xs">No description provided</span>}
          </div>
      )}
    </div>
);