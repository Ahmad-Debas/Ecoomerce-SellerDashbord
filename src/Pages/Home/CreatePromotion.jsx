import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Save, Calendar, DollarSign, Package, 
  Search, CheckCircle, AlertCircle, Layers 
} from 'lucide-react';
import api from '../../services/api';

// --- Validation Schema ---
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
  // Conditional Validation for Products
  products: yup.array().when('scope', {
    is: 'selected_products',
    then: (schema) => schema.min(1, 'Please select at least one product').required(),
    otherwise: (schema) => schema.nullable()
  })
});

export default function CreatePromotion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [productSearch, setProductSearch] = useState('');

  // --- Form Setup ---
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    control,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      scope: 'all_products',
      discount_value: '',
      products: [],
      min_price: '',
      max_price: '',
      max_qty_per_cart: ''
    }
  });

  const scope = watch('scope');
  const selectedProducts = watch('products');

  // --- Fetch Products (For Selection) ---
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['seller_products_list'],
    queryFn: async () => {
      const res = await api.get('/seller/products', { params: { per_page: 50 } });
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const allProducts = productsData?.data?.items || [];

  // Filter products client-side for the UI
  const filteredProducts = allProducts.filter(p => {
   return p.name_en.toLowerCase().includes(productSearch.toLowerCase()) || 
   p.sku.toLowerCase().includes(productSearch.toLowerCase())
  } 
  );

  // --- Mutation ---
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/seller/promotions', data),
    onSuccess: () => {
      toast.success('Promotion created successfully!');
      queryClient.invalidateQueries(['promotions']);
      navigate('/promotions');
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create promotion');
    }
  });

  const onSubmit = (data) => {
    // Clean up data before sending
    const payload = {
      ...data,
      // If scope is all, ensure products is empty/null to avoid backend confusion
      products: data.scope === 'all_products' ? [] : data.products
    };
    createMutation.mutate(payload);
  };

  // --- Helper to Toggle Product Selection ---
  const toggleProduct = (id) => {
    const current = selectedProducts || [];
    if (current.includes(id)) {
      setValue('products', current.filter(pid => pid !== id), { shouldValidate: true });
    } else {
      setValue('products', [...current, id], { shouldValidate: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/promotions" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Create Promotion</h1>
            <div className="text-sm text-gray-500">Promotions &gt; <span className="text-teal-600 font-medium">New</span></div>
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
                placeholder="e.g., Summer Sale 2026"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea 
                {...register('description')}
                rows="3"
                placeholder="Internal notes or description..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select 
                {...register('status')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
              >
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
              <input 
                {...register('start_date')}
                type="date" 
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition ${errors.start_date ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
              <input 
                {...register('end_date')}
                type="date" 
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition ${errors.end_date ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Discount Value <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  {...register('discount_value')}
                  type="number" 
                  placeholder="0.00"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition ${errors.discount_value ? 'border-red-500' : 'border-gray-200'}`}
                />
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
              <input 
                {...register('min_price')}
                type="number" 
                placeholder="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Max Price</label>
              <input 
                {...register('max_price')}
                type="number" 
                placeholder="Unlimited"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition ${errors.max_price ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.max_price && <p className="text-xs text-red-500 mt-1">{errors.max_price.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Max Qty Per Cart</label>
              <input 
                {...register('max_qty_per_cart')}
                type="number" 
                placeholder="Unlimited"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
              />
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

            {/* --- Product Selector (Only if selected_products) --- */}
            {scope === 'selected_products' && (
              <div className="mt-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-700">Select Products ({selectedProducts.length})</h3>
                  {errors.products && <span className="text-xs text-red-500 font-medium">{errors.products.message}</span>}
                </div>

                {/* Search Bar inside Selector */}
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
                  {productsLoading ? (
                    <div className="col-span-full text-center py-8 text-gray-400">Loading products...</div>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const isSelected = selectedProducts.includes(product.id);
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
                          {/* Image */}
                          <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                            <img 
                              src={product.default_variant?.main_img || product.default_variant?.sub_img || 'https://via.placeholder.com/150'} 
                              alt={product.name_en} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{product.name_en}</p>
                            <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                          </div>

                          {/* Checkbox Icon */}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-300 bg-white'}`}>
                            {isSelected && <CheckCircle size={14} className="text-white" />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-4 text-gray-400 text-sm">No products found matching "{productSearch}"</div>
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
            disabled={isSubmitting || createMutation.isPending}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-100"
          >
            {isSubmitting || createMutation.isPending ? 'Creating...' : <><Save size={20} /> Create Promotion</>}
          </button>
        </div>

      </form>
    </div>
  );
}