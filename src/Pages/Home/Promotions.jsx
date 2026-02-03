import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom'; // 1. استيراد هوك التنقل
import { 
  Search, Edit3, Trash2, PauseCircle, PlayCircle, 
  ChevronLeft, ChevronRight, Plus, X , AlertTriangle // 2. إضافة أيقونات جديدة
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';


// --- Debounce Hook ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Promotions() {
  const navigate = useNavigate(); // تهيئة التنقل
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);

  // --- Fetch Promotions ---
  const { data: promoData, isLoading } = useQuery({
    queryKey: ['promotions', page, debouncedSearch, dateFrom, dateTo],
    queryFn: async () => {
      const response = await api.get('/seller/promotions', {
        params: {
          page: page,
          search: debouncedSearch || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          per_page: 10
        }
      });
      return response.data;
    },
    keepPreviousData: true,
  });

  const promotions = promoData?.data?.items || [];
  const meta = promoData?.data?.meta || {};

  // --- Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/seller/promotions/${id}`),
    onSuccess: () => {
      toast.success('Promotion deleted') ;
      queryClient.invalidateQueries(['promotions']);
    },
    onError: () => toast.error('Failed to delete')
  });

  const confirmDelete = (id) => {
  toast((t) => (
    <div className="flex flex-col gap-5 p-4">
      <p className="text-sm font-medium">
         <AlertTriangle className="text-red-500" size={18} />
        Are you sure you want to delete this promotion?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1.5 rounded-md text-sm bg-black  hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            deleteMutation.mutate(id);
            toast.dismiss(t.id);
          }}
          className="px-3 py-1.5 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  ), {
    duration: Infinity,
  });
};

  // --- Helpers ---
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'draft': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'disabled': return 'bg-red-100 text-red-700 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'draft') return 'Paused';
    if (status === 'expired') return 'Completed';
    return status;
  };
  
  // --- Reset/Discard Function ---
  const handleDiscard = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    toast('Filters cleared', { icon: '🧹' });
  };

  if (isLoading && !promotions.length) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans pb-20">
      
      {/* --- Header & Actions (Responsive) --- */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Promotions</h1>
          <div className="text-sm text-gray-500 mt-1">Home &gt; <span className="text-teal-600 font-medium">Promotions</span></div>
        </div>

        {/* Action Buttons */}
        <div className="flex  items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => navigate('/create-promotion')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition shadow-sm shadow-teal-200 active:scale-95"
            >
              <Plus size={18} />
              <span>Add Promotion</span>
            </button>
        </div>

      </div>

      {/* --- Responsive Filter Bar --- */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
        
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search promotions..." 
            className="w-full pl-10 pr-4 py-3 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-sm shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
          <div className="relative">
            <input 
              type="date" 
              className="w-full appearance-none pl-3 md:pl-4 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs md:text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            {!dateFrom && <span className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs hidden md:block">From</span>}
          </div>

          <div className="relative">
             <input 
              type="date" 
              className="w-full appearance-none pl-3 md:pl-4 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs md:text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            {!dateTo && <span className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs hidden md:block">To</span>}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 1. MOBILE CARD VIEW                       */}
      {/* ========================================= */}
      <div className="flex flex-col gap-4 md:hidden">
        {promotions.length > 0 ? (
          promotions.map((promo) => (
            <div key={promo.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
              
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{promo.name}</h3>
                  <span className="text-xs text-gray-400">{promo.scope === 'all_products' ? 'All Products' : 'Selected Products'}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusStyle(promo.status)}`}>
                  {getStatusLabel(promo.status)}
                </span>
              </div>

              {/* Card Details */}
              <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <div className="flex flex-col">
                  <span className="uppercase text-[10px] text-gray-400 font-bold mb-0.5">Start</span>
                  <span className="font-medium text-gray-700">{formatDate(promo.start_date)}</span>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="uppercase text-[10px] text-gray-400 font-bold mb-0.5">End</span>
                  <span className="font-medium text-gray-700">{formatDate(promo.end_date)}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-end gap-2 mt-1 border-t border-gray-50 pt-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold">
                  <Edit3 size={14} /> Edit
                </button>
                <button 
                  onClick={() => deleteMutation.mutate(promo.id)}
                  className="p-2 rounded-lg bg-red-50 text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <button className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  {promo.status === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">No promotions found.</div>
        )}
      </div>

      {/* ========================================= */}
      {/* 2. DESKTOP TABLE VIEW                     */}
      {/* ========================================= */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                <th className="px-8 py-5 text-sm font-bold text-gray-900">Promotion Name</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-900">From</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-900">To</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-900 text-center">Status</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-900 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {promotions.length > 0 ? (
                promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50/50 transition duration-150 group">
                    <td className="px-8 py-6">
                      <div className="font-semibold text-gray-900">{promo.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{promo.scope === 'all_products' ? 'All Products' : 'Selected Products'}</div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-600">{formatDate(promo.start_date)}</td>
                    <td className="px-8 py-6 text-sm text-gray-600">{formatDate(promo.end_date)}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold capitalize border ${getStatusStyle(promo.status)}`}>
                        {getStatusLabel(promo.status)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-teal-600 hover:text-teal-800 transition" title="Edit"><Edit3 size={18} /></button>
                        <button className="text-blue-500 hover:text-blue-700 transition" title={promo.status === 'active' ? 'Pause' : 'Activate'}>
                           {promo.status === 'active' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                        </button>
                        <button onClick={() => {confirmDelete(promo.id)}} className="text-red-400 hover:text-red-600 transition" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-10 text-center text-gray-500">No promotions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Responsive Pagination --- */}
      <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs md:text-sm text-gray-500">
           Page <span className="font-bold text-gray-900">{meta.current_page}</span> of {meta.last_page}
        </div>

        <div className="flex items-center gap-2">
           <button 
              onClick={() => setPage(old => Math.max(old - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-1 text-sm text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg disabled:opacity-50 transition"
           >
             <ChevronLeft size={16} /> <span className="hidden md:inline">Previous</span>
           </button>

           <div className="flex gap-1">
             {[...Array(Math.min(meta.last_page || 1, 5))].map((_, idx) => {
                const p = idx + 1; 
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                      page === p ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
             })}
           </div>

           <button 
              onClick={() => setPage(old => (old < meta.last_page ? old + 1 : old))}
              disabled={page === meta.last_page}
              className="flex items-center gap-1 text-sm text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg disabled:opacity-50 transition"
           >
             <span className="hidden md:inline">Next</span> <ChevronRight size={16} />
           </button>
        </div>
      </div>
    </div>
  );
}