import React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2, Upload, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useProductOptions } from "../../hooks/useProductOptions.js";

const CreateProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- 1. Fetch Options ---
  const { data: options = {}, isLoading: isLoadingOptions } = useProductOptions();

  // --- 2. Mutation ---
  const createMutation = useMutation({
    mutationFn: (formData) => {
      return api.post('/seller/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      toast.success('Product created successfully!');
      queryClient.invalidateQueries(['seller-products']);
      navigate('/products');
    },
    onError: (err) => {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create product';
      toast.error(msg);
    }
  });

  // --- 3. Form Setup ---
  const { register, control, handleSubmit, formState: { errors }, setValue, getValues, watch } = useForm({
    defaultValues: {
      name_en: '', name_ar: '', sku: '',
      category_id: '', brand_id: '', style_id: '', country_id: '',
      material: '', age_from: '', age_to: '',
      description_en: '', description_ar: '',
      variants: [{
        sku: '', 
        price: '', 
        final_price: '', 
        cost_price: '',
        discount_price: '',
        quantity: 0,
        color_id: '', size_id: '',
        weight_kg: '', length_cm: '', width_cm: '', height_cm: '',
        is_default: false, 
        main_img: null, 
        sub_img: []    // مصفوفة فارغة للبدء
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });

  // لمراقبة التغييرات وعرض الصور
  const watchedVariants = watch("variants");

  // --- دالة مخصصة لإضافة الصور الفرعية (تراكمي) ---
  const handleSubImageChange = (index, e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        // 1. جلب الصور الموجودة حالياً في الفورم
        const currentFiles = getValues(`variants.${index}.sub_img`) || [];
        
        // 2. تحويل FileList الجديد إلى Array
        const newFiles = Array.from(files);

        // 3. دمج القديم مع الجديد (Append)
        // ملاحظة: currentFiles قد تكون FileList أحياناً لذا نضمن تحويلها لـ Array
        const combinedFiles = [...(Array.isArray(currentFiles) ? currentFiles : Array.from(currentFiles)), ...newFiles];

        // 4. تحديث قيمة الفورم يدوياً
        setValue(`variants.${index}.sub_img`, combinedFiles);
    }
    // تصفير الإنبوت للسماح باختيار نفس الملف مرة أخرى
    e.target.value = '';
  };

  // --- دالة لحذف صورة فرعية محددة ---
  const removeSubImage = (variantIndex, fileIndex) => {
      const currentFiles = getValues(`variants.${variantIndex}.sub_img`);
      if (!currentFiles) return;

      const updatedFiles = Array.from(currentFiles).filter((_, i) => i !== fileIndex);
      setValue(`variants.${variantIndex}.sub_img`, updatedFiles);
  };


  // --- 4. Submit Logic ---
  const onSubmit = (data) => {
    const formData = new FormData();
    
    // Append General Info
    Object.keys(data).forEach(key => {
      if (key !== 'variants' && data[key]) formData.append(key, data[key]);
    });

    // Append Variants
    data.variants.forEach((variant, index) => {
      formData.append(`variants[${index}][price]`, variant.price);
      formData.append(`variants[${index}][quantity]`, variant.quantity);
      formData.append(`variants[${index}][final_price]`, variant.final_price);
      if(variant.discount_price) formData.append(`variants[${index}][discount_price]`, variant.discount_price);
      if(variant.cost_price) formData.append(`variants[${index}][cost_price]`, variant.cost_price);
      
      if(variant.sku) formData.append(`variants[${index}][sku]`, variant.sku);
      if(variant.color_id) formData.append(`variants[${index}][color_id]`, variant.color_id);
      if(variant.size_id) formData.append(`variants[${index}][size_id]`, variant.size_id);
      
      if(variant.weight_kg) formData.append(`variants[${index}][weight_kg]`, variant.weight_kg);
      if(variant.length_cm) formData.append(`variants[${index}][length_cm]`, variant.length_cm);
      if(variant.width_cm) formData.append(`variants[${index}][width_cm]`, variant.width_cm);
      if(variant.height_cm) formData.append(`variants[${index}][height_cm]`, variant.height_cm);
      
      formData.append(`variants[${index}][is_default]`, variant.is_default ? '1' : '0');
      
      // Handle Main Image (Single File)
      // ملاحظة: main_img قد تكون FileList (من register) أو Array (لو عدلناها يدوياً)
      if (variant.main_img && variant.main_img.length > 0) {
        formData.append(`variants[${index}][main_img]`, variant.main_img[0]);
      }

      // Handle Sub Images (Multiple Files)
      if (variant.sub_img && variant.sub_img.length > 0) {
          Array.from(variant.sub_img).forEach((file, fileIndex) => {
             formData.append(`variants[${index}][sub_img][${fileIndex}]`, file);
          });
      }
    });

    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans pb-20 md:pb-6"> 
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
            <p className="text-sm text-gray-500 mt-1">Create new product profile</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
             <button type="button" onClick={() => navigate(-1)} className="flex-1 sm:flex-none justify-center px-4 py-2.5 border rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition">
                Discard
             </button>
             <button 
               type="submit" 
               disabled={createMutation.isPending}
               className="flex-1 sm:flex-none justify-center px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50 transition shadow-sm"
             >
               <Save size={18} /> {createMutation.isPending ? 'Saving...' : 'Save Product'}
             </button>
          </div>
        </div>

        {/* --- Section 1: General Info --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-lg font-bold mb-6 text-gray-800 border-b border-gray-100 pb-4">General Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Names */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name (EN) <span className="text-red-500">*</span></label>
              <input {...register('name_en', { required: 'English name is required' })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition" placeholder="Ex: Cotton T-Shirt" />
              {errors.name_en && <span className="text-red-500 text-xs mt-1 block">{errors.name_en.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name (AR) <span className="text-red-500">*</span></label>
              <input {...register('name_ar', { required: 'Arabic name is required' })} dir="rtl" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition" placeholder="مثال: تي شيرت قطني" />
              {errors.name_ar && <span className="text-red-500 text-xs mt-1 block">{errors.name_ar.message}</span>}
            </div>

            {/* Dropdowns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
              <select {...register('category_id', { required: true })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">Select Category</option>
                {(options.categories || []).map(cat => <option key={cat.id} value={cat.id}>{cat.name_en}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
              <select {...register('brand_id')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">Select Brand</option>
                {(options.brands || []).map(b => <option key={b.id} value={b.id}>{b.name_en}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Style</label>
              <select {...register('style_id')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">Select Style</option>
                {(options.styles || []).map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Origin Country</label>
              <select {...register('country_id')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">Select Country</option>
                {(options.countries || []).map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
            </div>

            {/* SKU & Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Master SKU</label>
              <input {...register('sku')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Material</label>
              <input {...register('material')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 100% Cotton" />
            </div>
            
            {/* Age Range */}
            <div className="flex gap-4">
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Age From</label>
                 <input type="number" {...register('age_from')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
               </div>
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Age To</label>
                 <input type="number" {...register('age_to')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
               </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (EN)</label>
               <textarea {...register('description_en')} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"></textarea>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (AR)</label>
               <textarea {...register('description_ar')} dir="rtl" rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* --- Section 2: Variants --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
             <h2 className="text-lg font-bold text-gray-800">Product Variants</h2>
             <button 
                type="button" 
                onClick={() => append({ price: '', final_price: '', cost_price: '', quantity: 0, is_default: false, main_img: null, sub_img: [] })} 
                className="text-sm flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold bg-teal-50 px-4 py-2 rounded-lg transition"
             >
                <Plus size={18} /> <span className="hidden sm:inline">Add Variant</span> <span className="sm:hidden">Add</span>
             </button>
          </div>
          
          <div className="space-y-6">
            {fields.map((field, index) => {
              
              const mainImgFile = watchedVariants?.[index]?.main_img?.[0];
              const subImgFiles = watchedVariants?.[index]?.sub_img;

              return (
              <div key={field.id} className="p-4 md:p-6 border border-gray-200 rounded-xl bg-gray-50/30 relative group hover:border-teal-200 transition-colors">
                
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-400 hover:text-red-500 transition p-1.5 bg-white rounded-full shadow-sm border border-gray-100 z-10">
                    <Trash2 size={16} />
                  </button>  
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                   
                   {/* ... (Colors, Sizes, Prices, etc. remain the same) ... */}
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Color</label>
                     <select {...register(`variants.${index}.color_id`)} className="w-full p-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                       <option value="">None</option>
                       {(options.colors || []).map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Size</label>
                     <select {...register(`variants.${index}.size_id`)} className="w-full p-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                       <option value="">None</option>
                       {(options.sizes || []).map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Price *</label>
                     <input type="number" step="0.01" {...register(`variants.${index}.price`, { required: true })} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00" />
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Discount Price</label>
                     <input type="number" step="0.01" {...register(`variants.${index}.discount_price`)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00" />
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Final Price *</label>
                     <input type="number" step="0.01" {...register(`variants.${index}.final_price`, { required: true })} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00" />
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Cost Price</label>
                     <input type="number" step="0.01" {...register(`variants.${index}.cost_price`)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00" />
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Quantity *</label>
                     <input type="number" {...register(`variants.${index}.quantity`, { required: true })} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0" />
                   </div>
                   
                   <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Variant SKU</label>
                      <input {...register(`variants.${index}.sku`)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Auto" />
                   </div>

                   <div className="flex items-center sm:col-span-4 mt-2 mb-4">
                      <input type="checkbox" {...register(`variants.${index}.is_default`)} id={`def-${index}`} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                      <label htmlFor={`def-${index}`} className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">Set as Default Variant</label>
                   </div>
                   
                   {/* --- Images Section --- */}
                   <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-4">
                      
                      {/* 1. Main Image (Standard Register) */}
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Main Image</label>
                         <div className="flex items-start gap-4">
                             <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {mainImgFile ? (
                                    <img src={URL.createObjectURL(mainImgFile)} alt="Main" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-400">No Img</span>
                                )}
                             </div>
                             <label className="cursor-pointer flex-1 flex flex-col items-center justify-center px-4 py-3 border border-gray-300 border-dashed rounded-lg hover:bg-white hover:border-teal-500 transition bg-white h-20">
                                <Upload size={18} className="text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500">Upload Main</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    {...register(`variants.${index}.main_img`)} 
                                />
                             </label>
                         </div>
                      </div>

                      {/* 2. Sub Images (Custom Controlled Logic) */}
                      <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sub Images (Max 5)</label>
                         <div className="space-y-3">
                             <label className="cursor-pointer w-full flex flex-col items-center justify-center px-4 py-2 border border-gray-300 border-dashed rounded-lg hover:bg-white hover:border-teal-500 transition bg-white">
                                <Upload size={18} className="text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500">Select Multiple Images</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple
                                    className="hidden"
                                    // !!! هام: إزالة register واستخدام onChange مخصص
                                    onChange={(e) => handleSubImageChange(index, e)}
                                />
                             </label>

                             {/* Preview & Delete */}
                             {subImgFiles && subImgFiles.length > 0 && (
                                 <div className="flex flex-wrap gap-2">
                                     {Array.from(subImgFiles).map((file, i) => (
                                         <div key={i} className="relative w-12 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden group">
                                             <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                             {/* زر الحذف */}
                                             <button 
                                                type="button"
                                                onClick={() => removeSubImage(index, i)}
                                                className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-bl-md"
                                             >
                                                <X size={10} />
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                      </div>
                   </div>
                   
                </div>
                
                {/* Dimensions */}
                <div className="mt-5 pt-4 border-t border-gray-200/60 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="text-[10px] text-gray-400 uppercase font-bold">Weight (kg)</label><input type="number" step="0.01" {...register(`variants.${index}.weight_kg`)} className="w-full p-1.5 border border-gray-200 rounded text-sm mt-1" /></div>
                    <div><label className="text-[10px] text-gray-400 uppercase font-bold">Length (cm)</label><input type="number" {...register(`variants.${index}.length_cm`)} className="w-full p-1.5 border border-gray-200 rounded text-sm mt-1" /></div>
                    <div><label className="text-[10px] text-gray-400 uppercase font-bold">Width (cm)</label><input type="number" {...register(`variants.${index}.width_cm`)} className="w-full p-1.5 border border-gray-200 rounded text-sm mt-1" /></div>
                    <div><label className="text-[10px] text-gray-400 uppercase font-bold">Height (cm)</label><input type="number" {...register(`variants.${index}.height_cm`)} className="w-full p-1.5 border border-gray-200 rounded text-sm mt-1" /></div>
                </div>
              </div>
            )})}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;