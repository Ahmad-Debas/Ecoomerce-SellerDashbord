import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { 
  HiCloudUpload, 
  HiExclamationCircle, 
  HiDocumentText, 
  HiCheckCircle,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineClipboardList
} from "react-icons/hi";

import api from "../../Services/api";
import RegisterSchema from "../../Vaildation/RegisterSchema";

// --- 1. Reusable Input Component (Unified Style) ---
const InputField = ({ label, name, type = "text", placeholder, colSpan = "col-span-1", disabled = false, register, errors }) => (
  <div className={colSpan}>
    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    <input
      {...register(name)}
      type={type}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all duration-200
        ${errors[name]
          ? "border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50"
          : "border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white"
        }`}
    />
    {errors[name] && (
      <p className="flex items-center text-red-500 text-xs mt-1 font-medium animate-pulse">
        <HiExclamationCircle className="mr-1" /> {errors[name].message}
      </p>
    )}
  </div>
);

// --- 2. Reusable Select Component ---
const SelectField = ({ label, name, options, isLoading, onChange, value, disabled, register, errors, placeholder }) => (
  <div className="col-span-1">
    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative">
      <select
        {...register(name)}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none appearance-none transition-all duration-200 cursor-pointer
          ${errors[name] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'}
          ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      >
        <option value="">{isLoading ? "Loading..." : placeholder}</option>
        {options}
      </select>
      {/* Arrow Icon */}
      <div className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ltr:right-4 rtl:left-4">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
    {errors[name] && (
      <p className="flex items-center text-red-500 text-xs mt-1 font-medium">
         <HiExclamationCircle className="mr-1" /> {errors[name].message}
      </p>
    )}
  </div>
);

// --- 3. File Upload Component ---
const FileUploadField = ({ label, name, register, errors, watch, accept = "image/*", text, clickChangeText }) => {
  const files = watch(name);
  const file = files && files.length > 0 ? files[0] : null;
  const previewUrl = file ? URL.createObjectURL(file) : null;
  const isImage = file && file.type.startsWith("image/");

  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{label}</label>
      
      <div className={`relative w-full h-28 rounded-xl transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer group
        ${errors[name] ? 'border-2 border-dashed border-red-400 bg-red-50' : 'border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50'}
        ${file ? 'border-solid border-teal-500 bg-white' : ''} 
      `}>
        <input 
          {...register(name)} 
          type="file" 
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
        />

        {!file ? (
          <div className="flex flex-col items-center pointer-events-none transition-transform group-hover:-translate-y-1">
            <div className="p-2 bg-gray-100 rounded-full mb-2 group-hover:bg-white group-hover:shadow-sm transition-colors">
               <HiCloudUpload size={20} className={`${errors[name] ? 'text-red-400' : 'text-gray-400 group-hover:text-teal-500'}`} />
            </div>
            <span className={`text-xs font-medium ${errors[name] ? 'text-red-500' : 'text-gray-500 group-hover:text-teal-600'}`}>
              {text}
            </span>
          </div>
        ) : (
          <div className="w-full h-full p-2 flex items-center justify-center bg-gray-50">
             {isImage ? (
               <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-lg" />
             ) : (
               <div className="flex flex-col items-center text-teal-600">
                  <HiDocumentText size={32} />
                  <span className="text-[10px] mt-1 font-mono truncate max-w-[150px]">{file.name}</span>
               </div>
             )}
          </div>
        )}
      </div>

      {file && (
        <div className="mt-2 flex items-center justify-between p-2 bg-teal-50 border border-teal-100 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 overflow-hidden">
            <HiCheckCircle className="text-teal-600 flex-shrink-0" size={16} />
            <span className="text-xs font-semibold text-teal-900 truncate max-w-[150px]">{file.name}</span>
          </div>
          <span className="text-[10px] text-teal-600 font-bold cursor-pointer hover:underline">{clickChangeText}</span>
        </div>
      )}

      {errors[name] && (
        <p className="flex items-center text-red-500 text-xs mt-1 font-medium">
          <HiExclamationCircle className="mr-1" /> {errors[name].message}
        </p>
      )}
    </div>
  );
};

// --- 4. Main Component ---
export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);

  const { register, handleSubmit, setError, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(RegisterSchema),
    mode: 'onBlur'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, currenciesRes] = await Promise.all([
          api.get("/public/countries"), 
          api.get("/public/currencies")
        ]);
        setCountries(countriesRes.data.data.items || []);
        setCurrencies(currenciesRes.data.data.items || []);
      } catch (error) {
        console.error(error);
        toast.error(t("load_failed"));
      } finally {
        setIsLoadingLookups(false);
      }
    };
    fetchData();
  }, [t]);

  const handleCountryChange = (e) => {
    const selectedId = e.target.value;
    setValue("country_id", selectedId, { shouldValidate: true });
    const country = countries.find(c => c.id == selectedId);
    setValue("phone_code", country ? country.phone_code : "");
  };

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if ((key === 'logo' || key === 'commercial_registration') && data[key]?.length > 0) {
        formData.append(key, data[key][0]); 
      } else {
        formData.append(key, data[key]);
      }
    });
    console.log(formData);

    const registerPromise = api.post("/seller/auth/register", formData, { headers: { "Content-Type": "multipart/form-data" } });

    toast.promise(registerPromise, {
      loading: t("creating_account"),
      success: (res) => {
        setTimeout(() => navigate('/auth/verify-account', { state: { email: data.email } }), 2000);
        return res.data.message || t("reg_success");
      },
      error: (err) => {
        if (err.response?.status === 422 && err.response.data.params) {
          Object.entries(err.response.data.params).forEach(([field, msg]) => setError(field, { type: "server", message: msg }));
          return t("fix_errors");
        }
        return err.response?.data?.message || t("reg_failed");
      },
    });
  };

  return (
    <div className="w-full animate-fade-in pb-10">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">{t("register_new_account")}</h2>
        <p className="text-gray-500 mt-2 text-sm">Join us and start selling today!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* --- Section 1: Personal Details --- */}
        <section className="bg-white p-1 rounded-2xl">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
             <div className="bg-teal-100 text-teal-700 p-1.5 rounded-lg"><HiOutlineUser size={18}/></div>
             <h3 className="text-sm font-bold text-gray-800">{t("personal_details")}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={t("first_name")} name="first_name" placeholder="John" register={register} errors={errors} />
            <InputField label={t("last_name")} name="last_name" placeholder="Doe" register={register} errors={errors} />
            <InputField label={t("email")} name="email" type="email" placeholder="example@gmail.com" colSpan="md:col-span-2" register={register} errors={errors} />
            <InputField label={t("password")} name="password" type="password" placeholder="********" register={register} errors={errors} />
            <InputField label={t("confirm_password")} name="password_confirmation" type="password" placeholder="********" register={register} errors={errors} />
            <InputField label={t("phone_code")} name="phone_code" placeholder="+966" disabled={true} register={register} errors={errors} />
            <InputField label={t("phone_number")} name="phone_number" placeholder="5xxxxxxx" register={register} errors={errors} />
          </div>
        </section>

        {/* --- Section 2: Store Information --- */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
             <div className="bg-teal-100 text-teal-700 p-1.5 rounded-lg"><HiOutlineOfficeBuilding size={18}/></div>
             <h3 className="text-sm font-bold text-gray-800">{t("store_information")}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={t("store_name_en")} name="store_name_en" placeholder="My Store" register={register} errors={errors} />
            <InputField label={t("store_name_ar")} name="store_name_ar" placeholder="متجري" register={register} errors={errors} />
          </div>
        </section>

        {/* --- Section 3: Location --- */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
             <div className="bg-teal-100 text-teal-700 p-1.5 rounded-lg"><HiOutlineLocationMarker size={18}/></div>
             <h3 className="text-sm font-bold text-gray-800">{t("location")}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField 
                label={t("country")} 
                name="country_id" 
                isLoading={isLoadingLookups} 
                register={register} 
                errors={errors} 
                placeholder={t("select_country")}
                onChange={(e) => { register("country_id").onChange(e); handleCountryChange(e); }}
                options={countries.map(c => <option key={c.id} value={c.id}>{i18n.language === 'ar' ? c.name_ar : c.name_en}</option>)}
            />
            <SelectField 
                label={t("currency")} 
                name="currency_id" 
                isLoading={isLoadingLookups} 
                register={register} 
                errors={errors} 
                placeholder={t("select_currency")}
                options={currencies.map(c => <option key={c.id} value={c.id}>{i18n.language === 'ar' ? c.name_ar : c.name_en} ({c.symbol})</option>)}
            />
            <InputField label={t("address")} name="address" placeholder={t("address_placeholder")} colSpan="md:col-span-2" register={register} errors={errors} />
          </div>
        </section>

        {/* --- Section 4: Documents --- */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
             <div className="bg-teal-100 text-teal-700 p-1.5 rounded-lg"><HiOutlineClipboardList size={18}/></div>
             <h3 className="text-sm font-bold text-gray-800">{t("documents")}</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <FileUploadField label={t("store_logo")} name="logo" register={register} errors={errors} watch={watch} text={t("drag_logo")} clickChangeText={t("click_change")} />
            <FileUploadField label={t("commercial_reg")} name="commercial_registration" register={register} errors={errors} watch={watch} accept=".pdf,.png,.jpg" text={t("drag_doc")} clickChangeText={t("click_change")} />
          </div>
        </section>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#2D2D3F] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t("processing")}
              </>
            ) : t("register_btn")}
          </button>

          <div className="text-center mt-6 text-gray-500 text-sm">
            <p>
              {t("already_have_account")}{" "}
              <Link to="/auth/login" className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-all">
                {t("login_here")}
              </Link>
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}