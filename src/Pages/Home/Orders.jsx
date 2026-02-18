import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Filter, ChevronDown, Eye, Edit3, 
  ChevronLeft, ChevronRight, X, Check, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api'; 
import { Link } from 'react-router-dom';

// --- Constants ---
const ORDER_STATUSES = [
  'pending', 'approved', 'processing', 'ready_to_ship', 
  'shipped', 'delivered', 'cancelled', 'rejected', 'returned'
];

// --- API Functions ---
const fetchKPI = async () => {
  const res = await api.get('/seller/orders/kpi');
  return res.data.data;
};

const fetchOrders = async (page = 1) => {
  const res = await api.get(`/seller/orders?page=${page}`);
  return res.data.data;
};

const updateOrderStatus = async ({ id, status }) => {
  const res = await api.put(`/seller/orders/${id}/status`, { status });
  return res.data;
};

export default function Orders() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // States for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // 1. Fetch KPI
  const { data: kpiData } = useQuery({
    queryKey: ['orders-kpi'],
    queryFn: fetchKPI,
    initialData: { total_orders: 0, pending_orders: 0, completed_orders: 0, total_earnings: 0 }
  });
 
  // 2. Fetch Orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders-list', page],
    queryFn: () => fetchOrders(page),
    keepPreviousData: true,
  });

  // 3. Mutation
  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders-list']);
      queryClient.invalidateQueries(['orders-kpi']);
      toast.success("Order Status updated successfully.");
      closeModal();
    },
    onError: (error) => {
      console.error(error);
       if (error.response?.data?.params) {
         const firstError = Object.values(error.response.data.params)[0];
         toast.error(firstError);
      } else {
        toast.error("Error while update status of order");
      }
    }
  });

  // --- Handlers ---
  const handleEditStatusClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (!selectedOrder) return;
    statusMutation.mutate({ 
      id: selectedOrder.id, 
      status: newStatus 
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // --- Helpers ---
  const formatDateDetails = (dateString) => {
    if (!dateString) return { dayName: '-', datePart: '-', timePart: '-' };
    const date = new Date(dateString);
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      datePart: date.toLocaleDateString('en-GB'),
      timePart: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'shipped': return 'bg-orange-50 text-orange-500 border border-orange-100';
      case 'pending': return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
      case 'cancelled': case 'rejected': return 'bg-red-50 text-red-600 border border-red-100';
      case 'approved': return 'bg-green-50 text-green-600 border border-green-100';
      default: return 'bg-gray-50 text-gray-600 border border-gray-100';
    }
  };

  const orders = ordersData?.items || [];
  const meta = ordersData?.meta || {};

  return (
    // التعديل 1: Padding متجاوب
    <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-6 font-sans text-slate-800 relative pb-20 md:pb-6">
      
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
          <span>Home</span><ChevronRight size={14} /><span className="text-teal-600 font-medium">Orders</span>
        </div>
      </div>

      {/* KPI Cards (Grid is already responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <KpiCard label="Total Orders" value={kpiData?.total_orders} />
        <KpiCard label="Pending Orders" value={kpiData?.pending_orders} />
        <KpiCard label="Completed Orders" value={kpiData?.completed_orders} />
        <KpiCard label="Total Earnings" value={`$${Number(kpiData?.total_earnings || 0).toLocaleString()}`} />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Search Bar Area */}
        <div className="p-4 md:p-6 border-b border-gray-50">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search orders..." className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-teal-500 text-sm bg-gray-50/50" />
              </div>
              {/* يمكن إضافة أزرار فلترة هنا مستقبلاً */}
           </div>
        </div>

        {/* Table Wrapper (Responsive Scroll) */}
        <div className="overflow-x-auto no-scrollbar">
          {isLoading && !ordersData ? (
             <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
          ) : (
          
          // التعديل 2: min-w-[1000px] للجدول
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 pl-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                <th className="py-4 pl-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order No.</th>
                <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">discount</th>
                <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">net_total</th>

                <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="py-4 pr-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {orders.map((order) => {
                const { dayName, datePart, timePart } = formatDateDetails(order.created_at);
                return (
                  <tr key={order.id} className="group hover:bg-gray-50/80 transition-colors">
                    {/* Order ID */}
                    <td className="py-4 pl-6 font-medium text-gray-600 whitespace-nowrap">#{order.id}</td>
                    {/* Order Number */}
                    <td className="py-4 pl-4 font-mono text-gray-500 whitespace-nowrap">#{order.order_number}</td>
                    {/* Date (Fixed Width) */}
                    <td className="py-4 text-gray-500 whitespace-nowrap">
                        <div className="flex flex-col text-xs">
                            <span className="font-semibold text-gray-700">{dayName}</span>
                            <span>{datePart} <span className="text-gray-300">|</span> {timePart}</span>
                        </div>
                    </td>
                    
                    {/* Customer */}
                    <td className="py-4 font-medium text-gray-700 whitespace-nowrap">{order.customer.name}</td>
                    
                    {/* Total */}
                    <td className="py-4 font-bold text-gray-800 whitespace-nowrap">
                     ${Number(order.financials.sub_total).toLocaleString()}
                    </td>
                     <td className="py-4 font-bold text-gray-800 whitespace-nowrap">
                     ${Number(order.financials.discount_share).toLocaleString()}
                    </td>
                     <td className="py-4 font-bold text-gray-800 whitespace-nowrap">
                     ${Number(order.financials.net_total).toLocaleString()}
                    </td>
                    
                    {/* Status */}
                    <td className="py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    
                    {/* Actions (Always visible on mobile, hover on desktop) */}
                    <td className="py-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/show-order/${order.id}`} className="p-2 bg-white border border-gray-200 rounded-lg hover:border-teal-500 hover:text-teal-600 transition shadow-sm">
                          <Eye size={16} />
                        </Link>
                        <button 
                            onClick={() => handleEditStatusClick(order)}
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition shadow-sm"
                            title="Change Status"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 md:p-6 border-t border-gray-50 gap-4">
            <span className="text-sm text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex items-center gap-2">
               <button onClick={() => setPage(old => Math.max(old - 1, 1))} disabled={!meta.prev_page_url} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1 transition"><ChevronLeft size={16} /> Prev</button>
               <button onClick={() => setPage(old => old + 1)} disabled={!meta.next_page_url} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1 transition">Next <ChevronRight size={16} /></button>
            </div>
        </div>
      </div>

      {/* --- STATUS UPDATE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          {/* التعديل 3: منع المودال من الالتصاق بالحواف في الموبايل */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800">Update Order Status</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
                <div className="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-500 uppercase font-bold mb-1">Order Number</p>
                    <p className="font-mono text-lg font-bold text-blue-900">#{selectedOrder?.order_number}</p>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Select New Status</label>
                <div className="relative">
                    <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition shadow-sm"
                    >
                        {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status.replace('_', ' ').toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {statusMutation.isError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} />
                        Failed to update status.
                    </div>
                )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button 
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
                    disabled={statusMutation.isLoading}
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSaveStatus}
                    disabled={statusMutation.isLoading}
                    className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition shadow-lg shadow-teal-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {statusMutation.isLoading ? 'Saving...' : 'Update Status'}
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// KPI Card (Styling Update)
const KpiCard = ({ label, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center h-32 hover:shadow-md transition-shadow">
    <h3 className="text-gray-500 font-medium text-sm mb-2 uppercase tracking-wide">{label}</h3>
    <p className="text-3xl font-bold text-gray-900">{value !== undefined ? value : '...'}</p>
  </div>
);