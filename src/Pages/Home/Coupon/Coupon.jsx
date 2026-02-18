import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { 
  Plus, Ticket, Calendar, DollarSign, Users, X, Check, Loader2, Trash2, Edit, AlertTriangle 
} from 'lucide-react';
import api from "../../../services/api";

export default function Coupon() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null); // إذا null يعني إنشاء، وإلا تعديل
  
  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  // 1. Fetch Coupons
  const { data: couponsData, isLoading, isError } = useQuery({
    queryKey: ['coupons', page],
    queryFn: async () => {
      const res = await api.get(`/seller/coupons?page=${page}`);
      return res.data.data;
    },
    keepPreviousData: true
  });

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/seller/coupons/${id}`),
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      setDeleteId(null); // إغلاق مودال الحذف
      queryClient.invalidateQueries(['coupons']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete coupon");
    }
  });

  // Handlers
  const handleCreate = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 w-full max-w-full overflow-hidden">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="text-blue-600" /> Coupons Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage discount codes for your customers.</p>
        </div>
        
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      {/* --- Coupons List (Table) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">Failed to load coupons.</div>
        ) : couponsData?.items?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Ticket className="text-gray-400" size={32} />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">No coupons found</h3>
             <p className="text-gray-500 text-sm mt-1">Get started by creating your first discount code.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Code</th>
                  <th className="px-6 py-4 whitespace-nowrap">Discount</th>
                  <th className="px-6 py-4 whitespace-nowrap">Usage</th>
                  <th className="px-6 py-4 whitespace-nowrap">Validity</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {couponsData?.items?.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit border border-blue-100">
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{coupon.value}%</div>
                      <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">Min: {parseFloat(coupon.min_cart_total || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                         <Users size={14} className="text-gray-400"/>
                         <span>{coupon.used_count} / {coupon.max_uses || '∞'}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">Per User: {coupon.max_uses_per_user || '∞'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 flex flex-col gap-1 whitespace-nowrap">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {coupon.starts_at?.split(' ')[0]}</span>
                        <span className="flex items-center gap-1 text-red-400"><Calendar size={12}/> {coupon.end_at?.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => handleEdit(coupon)}
                             className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition" 
                             title="Edit"
                           >
                              <Edit size={16} />
                           </button>
                           <button 
                             onClick={() => setDeleteId(coupon.id)}
                             className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" 
                             title="Delete"
                           >
                              <Trash2 size={16} />
                           </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {couponsData?.meta?.last_page > 1 && (
           <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 Previous
              </button>
              <span className="text-xs text-gray-500">Page {page} of {couponsData.meta.last_page}</span>
              <button 
                disabled={page === couponsData.meta.last_page}
                onClick={() => setPage(p => p + 1)}
                className="text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 Next
              </button>
           </div>
        )}
      </div>

      {/* --- Unified Create/Edit Modal --- */}
      {isModalOpen && (
        <CouponModal 
           isOpen={isModalOpen} 
           onClose={() => setIsModalOpen(false)} 
           initialData={editingCoupon}
        />
      )}

      {/* --- Delete Confirmation Dialog --- */}
      {deleteId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl text-center">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Coupon?</h3>
                  <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete this coupon? This action cannot be undone.</p>
                  
                  <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => setDeleteId(null)}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                          {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16}/> : 'Delete'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

// --- Unified Coupon Modal (Create & Edit) ---
function CouponModal({ onClose, initialData }) {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData; // تحويل القيمة لبوليان

  // Initial State Setup
  const [formData, setFormData] = useState({
     code: '',
     value: '',
     min_cart_total: '',
     max_uses: '',
     max_uses_per_user: '',
     starts_at: '',
     ends_at: '',
     is_active: 1,
     allowed_emails: '' 
  });

  // Populate form if Edit Mode
  useEffect(() => {
      if (initialData) {
          setFormData({
              code: initialData.code || '',
              value: initialData.value || '',
              min_cart_total: initialData.min_cart_total || '',
              max_uses: initialData.max_uses || '',
              max_uses_per_user: initialData.max_uses_per_user || '',
              // API returns 'YYYY-MM-DD HH:mm', we need 'YYYY-MM-DD' for input type="date"
              starts_at: initialData.starts_at ? initialData.starts_at.split(' ')[0] : '',
              ends_at: initialData.ends_at ? initialData.ends_at.split(' ')[0] : '',
              is_active: initialData.is_active ? 1 : 0,
              // Convert Array of emails back to comma separated string
              allowed_emails: Array.isArray(initialData.allowed_emails) 
                 ? initialData.allowed_emails.join(', ') 
                 : ''
          });
      }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (data) => {
        if (isEditMode) {
            return api.put(`/seller/coupons/${initialData.id}`, data);
        } else {
            return api.post('/seller/coupons', data);
        }
    },
    onSuccess: () => {
      toast.success(`Coupon ${isEditMode ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries(['coupons']);
      onClose();
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) {
         toast.error(Object.values(errors)[0][0]);
      } else {
         toast.error(err.response?.data?.message || "Operation failed");
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare Data
    const payload = { ...formData };
    
    // Logic for Emails: Convert string to array
    if (payload.allowed_emails && payload.allowed_emails.trim() !== '') {
        payload.allowed_emails = payload.allowed_emails.split(',').map(e => e.trim());
    } else {
        payload.allowed_emails = null;
    }

    mutation.mutate(payload);
  };

  const handleChange = (e) => {
     const { name, value, type, checked } = e.target;
     setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
     }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
         
         {/* Modal Header */}
         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <h2 className="text-lg font-bold text-gray-800">
                {isEditMode ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
         </div>

         {/* Modal Body */}
         <div className="p-6 overflow-y-auto custom-scrollbar">
            <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6">
               
               {/* Row 1: Code & Value */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-gray-500 uppercase">Coupon Code <span className="text-red-500">*</span></label>
                     <div className="relative">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                           name="code" required
                           value={formData.code} onChange={handleChange}
                           placeholder="e.g. SUMMER2026"
                           className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                        />
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-gray-500 uppercase">Value (%) <span className="text-red-500">*</span></label>
                     <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                           name="value" type="number" required min="0" max="100"
                           value={formData.value} onChange={handleChange}
                           placeholder="e.g. 20"
                           className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                  </div>
               </div>

               {/* Row 2: Dates */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-gray-500 uppercase">Starts At <span className="text-red-500">*</span></label>
                     <input 
                        name="starts_at" type="date" required
                        value={formData.starts_at} onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-gray-500 uppercase">Ends At <span className="text-red-500">*</span></label>
                     <input 
                        name="ends_at" type="date" required
                        value={formData.ends_at} onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
               </div>

               {/* Row 3: Limits */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-gray-500 uppercase">Min Cart Total</label>
                     <input 
                        name="min_cart_total" type="number"
                        value={formData.min_cart_total} onChange={handleChange}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-gray-500 uppercase">Max Uses (Total)</label>
                     <input 
                        name="max_uses" type="number"
                        value={formData.max_uses} onChange={handleChange}
                        placeholder="∞"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-gray-500 uppercase">Uses Per User</label>
                     <input 
                        name="max_uses_per_user" type="number"
                        value={formData.max_uses_per_user} onChange={handleChange}
                        placeholder="∞"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
               </div>

               {/* Row 4: Allowed Emails */}
               <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                     Allowed Emails <span className="text-gray-400 font-normal lowercase">(optional, comma separated)</span>
                  </label>
                  <textarea 
                     name="allowed_emails"
                     value={formData.allowed_emails} onChange={handleChange}
                     placeholder="user1@example.com, user2@example.com"
                     rows="2"
                     className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
               </div>

               {/* Row 5: Active Toggle */}
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                     <input 
                        type="checkbox" name="is_active" id="is_active_toggle" 
                        checked={formData.is_active === 1}
                        onChange={handleChange}
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5 checked:border-green-400 border-gray-300"
                     />
                     <label htmlFor="is_active_toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.is_active ? 'bg-green-400' : 'bg-gray-300'}`}></label>
                  </div>
                  <label htmlFor="is_active_toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
                     {formData.is_active ? 'Active' : 'Inactive'} Status
                  </label>
               </div>

            </form>
         </div>

         {/* Modal Footer */}
         <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
            <button 
               onClick={onClose}
               className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition"
            >
               Cancel
            </button>
            <button 
               type="submit" form="coupon-form"
               disabled={mutation.isPending}
               className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-70"
            >
               {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
               {isEditMode ? 'Update Coupon' : 'Create Coupon'}
            </button>
         </div>

      </div>
      
      {/* Toggle CSS */}
      <style jsx>{`
        .toggle-checkbox:checked { right: 0; border-color: #68D391; }
        .toggle-checkbox { right: 0; transition: all 0.3s; }
        .toggle-checkbox:checked + .toggle-label { background-color: #68D391; }
      `}</style>
    </div>
  );
}