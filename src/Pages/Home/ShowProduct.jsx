import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { 
  Save, X, Edit3, Package, Globe, Layers, Tag, Upload, ZoomIn, ArrowLeft, Star, CheckSquare
} from "lucide-react";
import api from "../../services/api";
import { useProductOptions } from '../../hooks/useProductOptions';

export default function ShowProduct() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  
  // State لتخزين صور Variants الجديدة (Main & Sub)
  const [variantImages, setVariantImages] = useState({});
  const [selectedImage, setSelectedImage] = useState(null); 

  // 1. Fetch Product Data
  const { data: product, isLoading: productLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/seller/products/${id}`);
      return response.data.data;
    },
      staleTime: 1000 * 60,
  });

  // 2. Fetch Helper Options (Brands, Colors, etc.)
  const { 
      data: options = {}, 
      isLoading: optionsLoading,
      isError: isOptionsError,
      error: optionsError
  } = useProductOptions();

  useEffect(() => {
      if (isOptionsError) {
          toast.error("Failed to load list options.");
          console.error(optionsError);
      }
  }, [isOptionsError, optionsError]);

  // 3. Update Mutation (Form Data)
  const updateMutation = useMutation({
    mutationFn: (data) => {
        return api.post(`/seller/products/${id}`, data);
    },
  onSuccess: (response) => {
      const newProductData = response?.data?.data; 
      toast.success("Product updated successfully");

      // 2. الشرط السحري: هل توجد بيانات جديدة فعلاً؟
      if (newProductData) {
          // إذا رجع الباك إند داتا، نحدث الكاش فوراً (زيرو تأخير)
          queryClient.setQueryData(['product', id], (oldData) => {
              // ندمج الداتا القديمة مع الجديدة للاحتياط
              return oldData ? { ...oldData, ...newProductData } : newProductData;
          });
      } else {
          // إذا كانت الداتا null (زي الصورة الحالية)، لا نحدث الكاش يدوياً
          // ونعتمد فقط على invalidateQueries (سيكون هناك تأخير بسيط لكن بدون كراش)
          console.warn("Backend returned null data, performing refetch...");
      }

      // 3. تنظيف الواجهة
      setIsEditing(false);
      setVariantImages({}); 
      
      // 4. جلب البيانات في الخلفية للتأكد من المطابقة
      queryClient.invalidateQueries(['product', id]); 
    },
    
    onError: (err) => {
        console.log('server Error',err.response.data);
    //   console.error("Validation Errors:", err.response?.data?.errors);
    //   const msg = err.response?.data?.message || "Error updating product";
    //   if (err.response?.data?.errors) {
    //       // Show the first validation error found
    //       const firstError = Object.values(err.response.data.errors)[0][0];
    //       toast.error(firstError);
    //   } else {
    //       toast.error(msg);
    //   }
    }
  });

  // --- Handlers ---

  const toggleEdit = () => {
    if (!isEditing) {
      // Deep copy to prevent mutating the original cached data directly
      setFormData(JSON.parse(JSON.stringify(product)));
      setVariantImages({}); 
    } else {
      setFormData(null);
    }
    setIsEditing(!isEditing);
  };

  const handleVariantImageChange = (index, type, file) => {
    if (file) {
        setVariantImages(prev => ({ 
            ...prev, 
            [index]: {
                ...prev[index], 
                [type]: file // type is 'main' or 'sub'
            } 
        }));
    }
  };

  const handleSave = () => {
    const data = new FormData();
    data.append('_method', 'PUT'); // Method spoofing for Laravel

    const appendIf = (key, value) => {
        if (value !== null && value !== undefined && value !== "") {
            data.append(key, value);
        }
    };

    // --- Tab 1: General Info ---
    appendIf('name_en', formData.name_en);
    appendIf('name_ar', formData.name_ar);
    appendIf('description_en', formData.description_en);
    appendIf('description_ar', formData.description_ar);
    appendIf('material', formData.material);
    appendIf('age_from', formData.age_from);
    appendIf('age_to', formData.age_to);
    appendIf('slug', formData.slug);
    appendIf('category_id', formData.category_id ?? formData.category?.id);
    appendIf('brand_id', formData.brand_id ?? formData.brand?.id);
    appendIf('style_id', formData.style_id ?? formData.style?.id);
    appendIf('country_id', formData.country_id ?? formData.country?.id);

    // --- Tab 2: Variants Loop ---
    formData.variants.forEach((v, index) => {
        // Must send ID for updates
        if(v.id) data.append(`variants[${index}][id]`, v.id);

        appendIf(`variants[${index}][sku]`, v.sku);
        appendIf(`variants[${index}][price]`, v.price);
        appendIf(`variants[${index}][final_price]`, v.final_price);
        appendIf(`variants[${index}][quantity]`, v.quantity);
        appendIf(`variants[${index}][weight_kg]`, v.weight_kg);
        
        // Handle Boolean for Default
        appendIf(`variants[${index}][is_default]`, v.is_default ? '1' : '0');
        
        const colorId = v.color_id ?? v.color?.id;
        const sizeId = v.size_id ?? v.size?.id;
        appendIf(`variants[${index}][color_id]`, colorId);
        appendIf(`variants[${index}][size_id]`, sizeId);

        // Handle Images
        if (variantImages[index]?.main) {
            data.append(`variants[${index}][main_img]`, variantImages[index].main);
        }
        if (variantImages[index]?.sub) {
            data.append(`variants[${index}][sub_img]`, variantImages[index].sub);
        }
    });

    updateMutation.mutate(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    
    // Logic for Mutual Exclusive 'is_default' (Radio Behavior)
    if (field === 'is_default') {
        updatedVariants.forEach((v, i) => {
            v.is_default = (i === index); // Only the clicked one becomes true
        });
    } else {
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    }
    
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  // Determine what to display (Editing Form OR Static Product Data)
  const displayData = isEditing ? formData : product;
  
  // Lists from hook
  const subCategories = options?.categories || [];
  const brands = options?.brands || [];
  const styles = options?.styles || [];
  const colors = options?.colors || [];
  const sizes = options?.sizes || [];

  if (productLoading) return ( <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>);
  
  if (isError) {
      return <div className="p-6 text-center text-red-500">Error: {error.response.data.message || "Something went wrong"}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans relative pb-20 md:pb-6">
      
      {/* --- Image Zoom Modal --- */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity p-4"
            onClick={() => setSelectedImage(null)} 
        >
            <div className="relative max-w-full max-h-full flex flex-col items-center">
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-12 right-0 md:-right-12 text-white p-2 hover:bg-white/10 rounded-full transition"
                >
                    <X size={28} />
                </button>
                <img 
                    src={selectedImage} 
                    alt="Zoomed Product" 
                    className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Header: Title, Status, Organization --- */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                <Link to="/products" className="md:hidden p-1 bg-gray-100 rounded hover:bg-gray-200">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words">{displayData?.name_en}</h1>
                
                {/* Product Status (Independent API Call) */}
                <StatusSelector 
                    id={product.id} 
                    currentStatus={product.status} 
                    type="product" 
                />
            </div>
            
            {/* Organization Info (Category, Brand, Style) */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
                {isEditing ? (
                     <div className="flex gap-2 flex-wrap">
                        <select className="px-2 py-1 text-xs border rounded bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500" value={formData?.category_id ?? formData?.category?.id ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))} disabled={optionsLoading}>
                            <option value="">Category</option>
                            {subCategories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name_en}</option>))}
                        </select>
                        <select className="px-2 py-1 text-xs border rounded bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500" value={formData?.brand_id ?? formData?.brand?.id ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))} disabled={optionsLoading}>
                            <option value="">Brand</option>
                            {brands.map((brand) => (<option key={brand.id} value={brand.id}>{brand.name_en}</option>))}
                        </select>
                        <select className="px-2 py-1 text-xs border rounded bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500" value={formData?.style_id ?? formData?.style?.id ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, style_id: e.target.value }))} disabled={optionsLoading}>
                            <option value="">Style</option>
                            {styles.map((style) => (<option key={style.id} value={style.id}>{style.name_en}</option>))}
                        </select>
                     </div>
                ) : (
                    <>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                            <Layers size={12} />
                            {displayData?.category?.name_en || 'No Category'}
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                            <Tag size={12} />
                            {displayData?.brand?.name_en || 'No Brand'}
                        </div>
                        {displayData?.style && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                                {displayData?.style?.name_en}
                            </div>
                        )}
                    </>
                )}
            </div>

            <p className="text-gray-500 font-arabic text-sm mt-2">{product?.name_ar}</p>
            <div className="mt-1 text-xs text-gray-400 font-mono">SKU: {product?.sku}</div>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto self-start">
            {isEditing ? (
                <>
                    <button onClick={toggleEdit} disabled={updateMutation.isPending} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition text-sm font-medium"><X size={18} /> Cancel</button>
                    <button onClick={handleSave} disabled={updateMutation.isPending} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 text-sm font-medium">{updateMutation.isPending ? 'Saving...' : <><Save size={18} /> Save</>}</button>
                </>
            ) : (
                <button onClick={toggleEdit} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition text-sm font-medium"><Edit3 size={18} /> Edit Product</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Basic Info & Variants */}
            <div className="lg:col-span-3 space-y-6">
                 
                 {/* Basic Info Card */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <Globe className="text-blue-500" size={20} />
                        <h2 className="font-semibold text-gray-800">Basic Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Name (English)" name="name_en" value={displayData?.name_en} isEditing={isEditing} onChange={handleInputChange} />
                        <InputField label="Name (Arabic)" name="name_ar" value={displayData?.name_ar} isEditing={isEditing} onChange={handleInputChange} dir="rtl" />
                        <div className="md:col-span-2"><TextAreaField label="Description (English)" name="description_en" value={displayData?.description_en} isEditing={isEditing} onChange={handleInputChange} /></div>
                        <div className="md:col-span-2"><TextAreaField label="Description (Arabic)" name="description_ar" value={displayData?.description_ar} isEditing={isEditing} onChange={handleInputChange} dir="rtl" /></div>
                    </div>
                 </div>
                 
                 {/* Variants Table Card */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="text-purple-500" size={20} />
                            <h2 className="font-semibold text-gray-800">Product Variants</h2>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-sm text-left min-w-[950px]">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    {/* is_default column */}
                                    <th className="px-6 py-3 w-16 text-center">Default</th>
                                    <th className="px-6 py-3 w-24">Main Img</th>
                                    <th className="px-6 py-3 w-24">Sub Img</th>
                                    <th className="px-6 py-3">Color & Size</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3">Final Price</th>
                                    <th className="px-6 py-3">Qty</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {displayData?.variants?.map((v, idx) => {
                                    // Generate Previews
                                    const mainImageSrc = variantImages[idx]?.main ? URL.createObjectURL(variantImages[idx].main) : (v.main_img || "https://via.placeholder.com/60?text=Main");
                                    const subImageSrc = variantImages[idx]?.sub ? URL.createObjectURL(variantImages[idx].sub) : (v.sub_img || "https://via.placeholder.com/60?text=Sub");

                                    return (
                                        <tr key={v.id || idx} className={`hover:bg-gray-50/50 transition ${v.is_default ? 'bg-blue-50/30' : ''}`}>
                                            
                                            {/* Column: Default (Checkbox acting as Radio) */}
                                            <td className="px-6 py-4 text-center">
                                                {isEditing ? (
                                                    <div className="flex justify-center">
                                                        <label className="cursor-pointer relative flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition">
                                                            <input 
                                                                type="checkbox" 
                                                                className="appearance-none w-5 h-5 border-2 border-gray-300 rounded checked:bg-blue-500 checked:border-blue-500 transition cursor-pointer"
                                                                checked={v.is_default}
                                                                onChange={() => handleVariantChange(idx, 'is_default', true)} 
                                                            />
                                                            <CheckSquare className={`absolute w-3.5 h-3.5 text-white pointer-events-none ${v.is_default ? 'opacity-100' : 'opacity-0'}`} />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    v.is_default && <div className="flex justify-center"><Star size={18} className="text-yellow-400 fill-yellow-400" /></div>
                                                )}
                                            </td>

                                            {/* Column: Main Image */}
                                            <td className="px-6 py-4">
                                                <div className="relative w-12 h-12 group flex-shrink-0">
                                                    <img src={mainImageSrc} alt="Main" className="w-full h-full rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-90 transition" onClick={() => setSelectedImage(mainImageSrc)} />
                                                    {isEditing && (
                                                        <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition z-10">
                                                            <Upload size={12} /><input type="file" className="hidden" accept="image/*" onChange={(e) => handleVariantImageChange(idx, 'main', e.target.files[0])} />
                                                        </label>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Column: Sub Image */}
                                            <td className="px-6 py-4">
                                                <div className="relative w-12 h-12 group flex-shrink-0">
                                                    <img src={subImageSrc} alt="Sub" className="w-full h-full rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-90 transition" onClick={() => setSelectedImage(subImageSrc)} />
                                                    {isEditing && (
                                                        <label className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-1 rounded-full cursor-pointer shadow-md hover:bg-purple-700 transition z-10">
                                                            <Upload size={12} /><input type="file" className="hidden" accept="image/*" onChange={(e) => handleVariantImageChange(idx, 'sub', e.target.files[0])} />
                                                        </label>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Column: Color & Size (Styled) */}
                                            <td className="px-6 py-4 align-top">
                                                {isEditing ? (
                                                    <div className="flex flex-col gap-3 min-w-[150px]">
                                                        {/* Color Select */}
                                                        <div className="relative">
                                                            {(v.color_id || v.color?.id) && (<span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-300 shadow-sm pointer-events-none z-10" style={{ backgroundColor: colors.find(c => c.id == (v.color_id || v.color?.id))?.code || '#fff' }} />)}
                                                            <select className={`w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 ${ (v.color_id || v.color?.id) ? 'pl-9' : 'pl-2.5' }`} value={v.color_id ?? v.color?.id ?? ""} onChange={(e) => handleVariantChange(idx, 'color_id', e.target.value)} disabled={optionsLoading}>
                                                                <option value="">Color</option>
                                                                {colors?.map((color) => (<option key={color.id} value={color.id}>{color.name_en}</option>))}
                                                            </select>
                                                        </div>
                                                        {/* Size Select */}
                                                        <select className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2" value={v.size_id ?? v.size?.id ?? ""} onChange={(e) => handleVariantChange(idx, 'size_id', e.target.value)} disabled={optionsLoading}>
                                                            <option value="">Size</option>
                                                            {sizes.map((size) => (<option key={size.id} value={size.id}>{size.code || size.name_en}</option>))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                                                                <span className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: v.color?.code || '#eee' }} />
                                                                <span className="text-xs font-medium text-gray-700">{v.color?.name_en || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                             <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs font-bold border border-gray-200 min-w-[24px] text-center">{v.size?.code || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Prices & Qty */}
                                            <td className="px-6 py-4">{isEditing ? <input type="number" value={ v.price} onChange={(e) => handleVariantChange(idx, 'price', e.target.value)} className="w-20 px-2 py-1 border rounded text-xs" /> : <span className="font-bold text-gray-900">${v.price}</span>}</td>
                                            <td className="px-6 py-4">{isEditing ? <input type="number" value={v.final_price} onChange={(e) => handleVariantChange(idx, 'final_price', e.target.value)} className="w-20 px-2 py-1 border rounded text-xs" /> : <div className="flex flex-col"><span className="font-bold text-gray-900">{v.final_price}</span>{(v.price > v.final_price) && <span className="text-xs text-red-400 line-through">${v.price}</span>}</div>}</td>
                                            <td className="px-6 py-4">{isEditing ? <input type="number" value={v.quantity} onChange={(e) => handleVariantChange(idx, 'quantity', e.target.value)} className="w-16 px-2 py-1 border rounded text-xs" /> : <span className={v.quantity < 5 ? "text-red-500 font-bold" : "text-gray-700"}>{v.quantity}</span>}</td>

                                            {/* Column: Variant Status (Independent API) */}
                                            <td className="px-6 py-4">
                                                <StatusSelector 
                                                    id={v.id} 
                                                    currentStatus={v.status} 
                                                    type="variant" 
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>

            {/* Right Column: Specifications only */}
            <div className="space-y-6 lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4 text-gray-800">
                        <Package className="text-teal-500" size={20} />
                        <h2 className="font-semibold">Specifications</h2>
                    </div>
                    <div className="space-y-4">
                        <InputField label="Material" name="material" value={displayData?.material} isEditing={isEditing} onChange={handleInputChange} />
                        <div className="grid grid-cols-2 gap-4">
                             <InputField label="Age From" name="age_from" value={displayData?.age_from} isEditing={isEditing} onChange={handleInputChange} type="number" />
                             <InputField label="Age To" name="age_to" value={displayData?.age_to} isEditing={isEditing} onChange={handleInputChange} type="number" />
                        </div>
                        <div className="pt-2 border-t border-dashed">
                             <span className="text-xs text-gray-400 uppercase tracking-wider">Country of Origin</span>
                             <div className="flex items-center gap-2 mt-1">
                                <img src={displayData?.country?.image} alt="Flag" className="w-5 rounded-sm shadow-sm" />
                                <span className="text-sm font-medium">{displayData?.country?.name_en}</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- Status Selector Component (Updated Enum Values) ---
const StatusSelector = ({ id, currentStatus, type }) => {
    const queryClient = useQueryClient();
    
    // Determine Endpoint based on type
    const url = type === 'product' 
        ? `/seller/products/${id}/status` 
        : `/seller/products/variants/${id}/status`;

    const statusMutation = useMutation({
        mutationFn: (newStatus) => api.put(url, { status: newStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries(['product',id]); 
            setTimeout(()=>{
                 toast.success(`${type === 'product' ? 'Product' : 'Variant'} status updated`);
            },2000)
            // toast.success(`${type === 'product' ? 'Product' : 'Variant'} status updated`);
        },
        onError: () => toast.error("Failed to update status")
    });

    // Options Mapping
    const options = type === 'product' 
        ? [
            { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-600' },
            { value: 'active', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
            { value: 'archived', label: 'Archived', color: 'bg-red-50 text-red-600' }
          ]
        : [
            // Variant Enum: 'in_stock', 'out_of_stock', 'coming_soon', 'archived'
            { value: 'in_stock', label: 'In Stock', color: 'bg-emerald-100 text-emerald-700' },
            { value: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-100 text-red-700' },
            { value: 'coming_soon', label: 'Coming Soon', color: 'bg-blue-100 text-blue-700' },
            { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-500' }
          ];

    const currentOption = options.find(o => o.value === currentStatus) || options[0];

    return (
        <div className="relative group">
            <select 
                value={currentStatus}
                onChange={(e) => statusMutation.mutate(e.target.value)}
                disabled={statusMutation.isPending}
                className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-medium border border-transparent hover:border-black/5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all ${currentOption?.color}`}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-white text-gray-900">
                        {opt.label}
                    </option>
                ))}
            </select>
            
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                 {statusMutation.isPending ? (
                     <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50"></div>
                 ) : (
                     <svg className="w-3 h-3 fill-current opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 )}
            </div>
        </div>
    );
};

// --- Helper Components ---
const InputField = ({ label, name, value, isEditing, onChange, type = "text", dir = "ltr" }) => (
    <div className="w-full"><label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>{isEditing ? (<input type={type} name={name} value={value || ''} onChange={onChange} dir={dir} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition text-sm text-gray-900" />) : (<p className={`text-sm font-medium text-gray-900 py-2 border-b border-transparent ${dir === 'rtl' ? 'font-arabic text-right' : ''}`}>{value || '-'}</p>)}</div>
);
const TextAreaField = ({ label, name, value, isEditing, onChange, dir = "ltr" }) => (
    <div className="w-full"><label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>{isEditing ? (<textarea name={name} value={value || ''} onChange={onChange} dir={dir} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition text-sm text-gray-900 resize-none" />) : (<p className={`text-sm text-gray-600 leading-relaxed py-2 ${dir === 'rtl' ? 'font-arabic text-right' : ''}`}>{value || '-'}</p>)}</div>
);