import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Save, Calendar, DollarSign, Package, 
  Search, CheckCircle, AlertCircle, Layers, Loader2, ChevronDown 
} from 'lucide-react';
import api from '../../services/api';

// --- Validation Schema (Same as Create) ---
const schema = yup.object().shape({
  name: yup.string().required('Promotion name is required'),
  description: yup.string().nullable(),
  status: yup.string().oneOf(['draft', 'active', 'disabled']),
  start_date: yup.string().required('Start date is required'),
  end_date: yup.string()
    .required('End date is required')
    .test('is-after', 'End date must be after start date', function(value) {
      const { start_date } = this.parent;
      return !start_date || !value || new Date(value) >= new Date(start_date);
    }),
  discount_value: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Discount value is required')
    .min(0, 'Must be positive'),
  min_price: yup.number().transform((v) => (isNaN(v) ? null : v)).nullable().min(0),
  max_price: yup.number()
    .transform((v) => (isNaN(v) ? null : v))
    .nullable()
    .min(0)
    .test('is-greater', 'Max price must be greater than Min price', function(value) {
      const { min_price } = this.parent;
      return !min_price || !value || value > min_price;
    }),
  max_qty_per_cart: yup.number().transform((v) => (isNaN(v) ? null : v)).nullable().integer().min(1),
  scope: yup.string().oneOf(['all_products', 'selected_products']),
  products: yup.array().when('scope', {
    is: 'selected_products',
    then: (schema) => schema.min(1, 'Please select at least one product').required(),
    otherwise: (schema) => schema.nullable()
  })
});

// --- Debounce Hook ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ShowPromotion() {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [productSearch, setProductSearch] = useState('');
  const debouncedSearch = useDebounce(productSearch, 500);

  // --- Form Setup ---
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '', description: '', status: 'draft', scope: 'all_products',
      discount_value: '', products: [], min_price: '', max_price: '', max_qty_per_cart: ''
    }
  });

  const scope = watch('scope');
  const selectedProducts = watch('products');

  // --- 1. Fetch Existing Promotion Details ---
  const { data: promoData, isLoading: isPromoLoading } = useQuery({
    queryKey: ['promotion', id],
    queryFn: async () => {
      const res = await api.get(`/seller/promotions/${id}`);
      return res.data;
    },
    staleTime: 0, // Always fetch fresh data for edit
  });

  // --- 2. Populate Form on Data Load ---
  useEffect(() => {
    if (promoData?.data) {
      const p = promoData.data;
      
      // Helper to extract YYYY-MM-DD from "YYYY-MM-DD HH:MM"
      const formatDateForInput = (dateStr) => dateStr ? dateStr.split(' ')[0] : '';

      reset({
        name: p.name,
        description: p.description,
        status: p.status,
        scope: p.scope,
        discount_value: p.discount_value,
        start_date: formatDateForInput(p.start_date),
        end_date: formatDateForInput(p.end_date),
        
        // Flatten Conditions object
        min_price: p.conditions?.min_price,
        max_price: p.conditions?.max_price,
        max_qty_per_cart: p.conditions?.max_qty_per_cart,

        // Map array of Product Objects -> Array of IDs
        products: p.products ? p.products.map(prod => prod.id) : []
      });
    }
  }, [promoData, reset]);

  // --- 3. Infinite Scroll Products (Same as Create) ---
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: productsLoading
  } = useInfiniteQuery({
    queryKey: ['seller_products_infinite', debouncedSearch], 
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get('/seller/products', { 
        params: { page: pageParam, per_page: 10, search: debouncedSearch || undefined } 
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    enabled: scope === 'selected_products',
  });

  const productList = productsData?.pages.flatMap((page) => page.data.items) || [];

  // --- 4. Update Mutation ---
  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/seller/promotions/${id}`, data),
    onSuccess: () => {
      toast.success('Promotion updated successfully!');
      queryClient.invalidateQueries(['promotions']);
      queryClient.invalidateQueries(['promotion', id]);
      navigate('/promotions');
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update promotion');
    }
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      products: data.scope === 'all_products' ? [] : data.products
    };
    updateMutation.mutate(payload);
  };

  const toggleProduct = (pid) => {
    const current = selectedProducts || [];
    if (current.includes(pid)) {
      setValue('products', current.filter(id => id !== pid), { shouldValidate: true });
    } else {
      setValue('products', [...current, pid], { shouldValidate: true });
    }
  };

  if (isPromoLoading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/promotions" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Edit Promotion</h1>
            <div className="text-sm text-gray-500">Promotions &gt; <span className="text-teal-600 font-medium">#{id}</span></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-6">
        
        {/* --- Card 1: Basic Info --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-100 pb-2">
            <Layers size={20} className="text-teal-600" />
            <h2 className="font-bold">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Promotion Name <span className="text-red-500">*</span></label>
              <input 
                {...register('name')}
                type="text" 
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea 
                {...register('description')}
                rows="3"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select {...register('status')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Card 2: Schedule & Value --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-100 pb-2">
            <Calendar size={20} className="text-blue-600" />
            <h2 className="font-bold">Schedule & Discount</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label>
              <input {...register('start_date')} type="date" className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition ${errors.start_date ? 'border-red-500' : 'border-gray-200'}`} />
              {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
              <input {...register('end_date')} type="date" className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition ${errors.end_date ? 'border-red-500' : 'border-gray-200'}`} />
              {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Discount Value <span className="text-red-500">*</span></label>
              <div className="relative">
                <input {...register('discount_value')} type="number" step="0.01" className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition ${errors.discount_value ? 'border-red-500' : 'border-gray-200'}`} />
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {errors.discount_value && <p className="text-xs text-red-500 mt-1">{errors.discount_value.message}</p>}
            </div>
          </div>
        </div>

        {/* --- Card 3: Conditions (Optional) --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-100 pb-2">
            <AlertCircle size={20} className="text-orange-500" />
            <h2 className="font-bold">Conditions (Optional)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Min Price</label>
              <input {...register('min_price')} type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Max Price</label>
              <input {...register('max_price')} type="number" className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition ${errors.max_price ? 'border-red-500' : 'border-gray-200'}`} />
              {errors.max_price && <p className="text-xs text-red-500 mt-1">{errors.max_price.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Max Qty Per Cart</label>
              <input {...register('max_qty_per_cart')} type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition" />
            </div>
          </div>
        </div>

        {/* --- Card 4: Scope & Products --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-100 pb-2">
            <Package size={20} className="text-purple-600" />
            <h2 className="font-bold">Promotion Scope</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition ${scope === 'all_products' ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <input {...register('scope')} type="radio" value="all_products" className="w-5 h-5 text-teal-600" />
                <div>
                  <div className="font-bold text-gray-900">All Products</div>
                  <div className="text-xs text-gray-500">Apply discount to entire inventory</div>
                </div>
              </label>

              <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition ${scope === 'selected_products' ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <input {...register('scope')} type="radio" value="selected_products" className="w-5 h-5 text-teal-600" />
                <div>
                  <div className="font-bold text-gray-900">Selected Products</div>
                  <div className="text-xs text-gray-500">Choose specific items for this promo</div>
                </div>
              </label>
            </div>

            {/* --- Product Selector --- */}
            {scope === 'selected_products' && (
              <div className="mt-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-700">Select Products ({selectedProducts?.length || 0})</h3>
                  {errors.products && <span className="text-xs text-red-500 font-medium">{errors.products.message}</span>}
                </div>

                {/* Server-Side Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name or SKU..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                  {productsLoading && productList.length === 0 ? (
                    <div className="col-span-full flex justify-center py-8 text-gray-400">
                       <Loader2 className="animate-spin" />
                    </div>
                  ) : productList.length > 0 ? (
                    <>
                      {productList.map((product) => {
                        const isSelected = selectedProducts?.includes(product.id);
                        return (
                          <div 
                            key={product.id}
                            onClick={() => toggleProduct(product.id)}
                            className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                              isSelected 
                              ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' 
                              : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                              <img 
                                src={product.default_variant?.main_img || 'https://via.placeholder.com/150'} 
                                alt={product.name_en} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{product.name_en}</p>
                              <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-300 bg-white'}`}>
                              {isSelected && <CheckCircle size={14} className="text-white" />}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Load More Button */}
                      {hasNextPage && (
                        <div className="col-span-full flex justify-center mt-4">
                          <button
                            type="button"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                          >
                            {isFetchingNextPage ? <Loader2 className="animate-spin w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            Load More
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="col-span-full text-center py-4 text-gray-400 text-sm">
                       No products found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting || updateMutation.isPending}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-100"
          >
            {isSubmitting || updateMutation.isPending ? 'Saving Changes...' : <><Save size={20} /> Update Promotion</>}
          </button>
        </div>

      </form>
    </div>
  );
}