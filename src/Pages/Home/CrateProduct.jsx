import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2, Upload, ArrowLeft } from 'lucide-react';
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
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name_en: '', name_ar: '', sku: '',
      category_id: '', brand_id: '', style_id: '', country_id: '',
      material: '', age_from: '', age_to: '',
      description_en: '', description_ar: '',
      variants: [{
        sku: '', price: '', quantity: 0,
        color_id: '', size_id: '',
        weight_kg: '', length_cm: '', width_cm: '', height_cm: '',
        is_default: false, img: null 
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });

  // --- 4. Submit Logic ---
  const onSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key !== 'variants' && data[key]) formData.append(key, data[key]);
    });

    data.variants.forEach((variant, index) => {
      formData.append(`variants[${index}][price]`, variant.price);
      formData.append(`variants[${index}][quantity]`, variant.quantity);
      if(variant.sku) formData.append(`variants[${index}][sku]`, variant.sku);
      if(variant.color_id) formData.append(`variants[${index}][color_id]`, variant.color_id);
      if(variant.size_id) formData.append(`variants[${index}][size_id]`, variant.size_id);
      if(variant.weight_kg) formData.append(`variants[${index}][weight_kg]`, variant.weight_kg);
      if(variant.length_cm) formData.append(`variants[${index}][length_cm]`, variant.length_cm);
      if(variant.width_cm) formData.append(`variants[${index}][width_cm]`, variant.width_cm);
      if(variant.height_cm) formData.append(`variants[${index}][height_cm]`, variant.height_cm);
      formData.append(`variants[${index}][is_default]`, variant.is_default ? '1' : '0');
      if (variant.img && variant.img[0]) {
        formData.append(`variants[${index}][img]`, variant.img[0]);
      }
    });

    createMutation.mutate(formData);
  };

  return (
    // التعديل 1: تقليل الـ Padding للموبايل (p-4) وزيادته للكمبيوتر (md:p-6)
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans pb-20 md:pb-6"> 
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Header --- */}
        {/* التعديل 2: العناصر فوق بعض بالموبايل (flex-col) وجنب بعض بالتابلت (sm:flex-row) */}
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
          
          {/* التعديل 3: Grid System - عمود واحد للموبايل، عمودين للكمبيوتر */}
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
            
            {/* Age Range - يبقى Flex لأنهما حقلين صغيرين */}
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
                onClick={() => append({ price: '', quantity: 0, is_default: false })} 
                className="text-sm flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold bg-teal-50 px-4 py-2 rounded-lg transition"
             >
                <Plus size={18} /> <span className="hidden sm:inline">Add Variant</span> <span className="sm:hidden">Add</span>
             </button>
          </div>
          
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 md:p-6 border border-gray-200 rounded-xl bg-gray-50/30 relative group hover:border-teal-200 transition-colors">
                
                {/* زر الحذف: في الموبايل يكون أصغر قليلاً ومكانه مضبوط */}
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-400 hover:text-red-500 transition p-1.5 bg-white rounded-full shadow-sm border border-gray-100 z-10">
                    <Trash2 size={16} />
                  </button>  
                )}

                {/* التعديل 4: Grid للفاريانت - عمود واحد موبايل، 3 تابلت، 4 كمبيوتر */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                   
                   {/* Color */}
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Color</label>
                     <select {...register(`variants.${index}.color_id`)} className="w-full p-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                       <option value="">None</option>
                       {(options.colors || []).map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                     </select>
                   </div>
                   
                   {/* Size */}
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Size</label>
                     <select {...register(`variants.${index}.size_id`)} className="w-full p-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                       <option value="">None</option>
                       {(options.sizes || []).map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
                     </select>
                   </div>
                   
                   {/* Price */}
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Price *</label>
                     <input type="number" step="0.01" {...register(`variants.${index}.price`, { required: true })} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00" />
                   </div>
                   
                   {/* Quantity */}
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Quantity *</label>
                     <input type="number" {...register(`variants.${index}.quantity`, { required: true })} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0" />
                   </div>
                   
                   {/* SKU - يأخذ عمودين في الكمبيوتر */}
                   <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Variant SKU</label>
                      <input {...register(`variants.${index}.sku`)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Leave blank to auto-generate" />
                   </div>
                   
                   {/* Image */}
                   <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Variant Image</label>
                      <label className="cursor-pointer flex items-center justify-center px-4 py-2.5 border border-gray-300 border-dashed rounded-lg hover:bg-white hover:border-teal-500 transition bg-white w-full group-hover:bg-white">
                           <Upload size={16} className="text-gray-400 mr-2 group-hover:text-teal-500" />
                           <span className="text-sm text-gray-500 group-hover:text-teal-600">Click to upload image</span>
                           <input type="file" accept="image/*" className="hidden" {...register(`variants.${index}.img`)} />
                      </label>
                   </div>
                   
                   {/* Is Default */}
                   <div className="flex items-center sm:col-span-4 mt-2">
                      <input type="checkbox" {...register(`variants.${index}.is_default`)} id={`def-${index}`} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                      <label htmlFor={`def-${index}`} className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">Set as Default Variant</label>
                   </div>
                </div>
                
                {/* Dimensions - بالموبايل 2 جنب بعض، بالكمبيوتر 4 */}
                <div className="mt-5 pt-4 border-t border-gray-200/60 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="text-[10px] text-gray-400 uppercase font-bold">Weight (kg)</label><input type="number" step="0.01" {...register(`variants.${index}.weight_kg`)} className="w-full p-1.5 border border-gray-200 rounded text-sm mt-1" /></div>
                    <div><label className="text-[10px] text-gray-400 uppercase font-bold">Length (cm)</label><input type="number" {...register(`variants.${index}.length_cm`)} className="w-full p-1.5 border border-gray-200 rounded text-sm mt-1" /></div>
                    <div><label className="text-[10px] text-gray-400 uppercase font-bold">Width (cm)</label><input type="number" {...register(`variants.${index}.width_cm`)} className="w-full p-1.5 border border-gray-200 rounded text-sm mt-1" /></div>
                    <div><label className="text-[10px] text-gray-400 uppercase font-bold">Height (cm)</label><input type="number" {...register(`variants.${index}.height_cm`)} className="w-full p-1.5 border border-gray-200 rounded text-sm mt-1" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;