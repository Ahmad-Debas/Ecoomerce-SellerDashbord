import React, { useState, useEffect } from 'react';
// تأكد من استيراد keepPreviousData إذا كنت تستخدم v5
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { 
  Search, ArrowDownToLine, FileText, Eye, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
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

// ==========================================
// 1. Parent Component: Payment
// ==========================================
export default function Payments() {
  const [activeTab, setActiveTab] = useState('invoices');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans pb-20">
      
      {/* --- Header --- */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Payment & Invoicing</h1>
        <div className="text-sm text-gray-500 mt-1">Home &gt; <span className="text-teal-600 font-medium">Payment</span></div>
      </div>

      {/* --- Tabs Navigation --- */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
        {['invoices', 'payout_batches', 'revenues'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === tab 
              ? 'text-teal-700 border-b-2 border-teal-600' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* --- Tab Content (Removed animate-fadeIn to be safe) --- */}
      <div className="w-full">
        {activeTab === 'invoices' && <InvoicesView />}
        {activeTab === 'payout_batches' && (
          <div className="p-10 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
            Payout Batches Content Coming Soon...
          </div>
        )}
        {activeTab === 'revenues' && <RevenuesView />}
      </div>

    </div>
  );
}

// ==========================================
// 2. Revenues View
// ==========================================
function RevenuesView() {
  const [period, setPeriod] = useState('monthly');

  // Add isError and error to debug
  const { data: summaryData, isLoading: isSummaryLoading, isError: isSumError, error: sumError } = useQuery({
    queryKey: ['revenue_summary'],
    queryFn: async () => {
      try {
        const res = await api.get('/seller/finance/revenue/summary');
        return res.data;
      } catch (err) {
        console.error("Summary API Error:", err);
        throw err;
      }
    }
  });

  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ['revenue_chart', period],
    queryFn: async () => {
      try {
        const res = await api.get(`/seller/finance/revenue/chart?period=${period}`);
        return res.data;
      } catch (err) {
        console.error("Chart API Error:", err);
        throw err;
      }
    }
  });

  // Safe Access with Fallbacks
  const summary = summaryData?.data || { total_revenue: 0, pending_revenue: 0, paid_revenue: 0 };
  const chartItems = chartData?.data || [];

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(val || 0);

  if (isSumError) return <div className="text-red-500 p-4 bg-red-50 rounded">Error loading summary: {sumError.message}</div>;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Revenue" value={summary.total_revenue} loading={isSummaryLoading} color="text-gray-900" format={formatCurrency} />
        <SummaryCard title="Pending Revenue" value={summary.pending_revenue} loading={isSummaryLoading} color="text-orange-500" format={formatCurrency} />
        <SummaryCard title="Paid Revenue" value={summary.paid_revenue} loading={isSummaryLoading} color="text-emerald-600" format={formatCurrency} />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 md:mb-0">Revenue Analytics</h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['monthly', 'yearly'].map(p => (
              <button 
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${period === p ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px] w-full">
          {isChartLoading ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : chartItems.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartItems} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff'}} />
                <Bar dataKey="total" fill="#0D9488" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No revenue data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Component for Cards to reduce code duplication
function SummaryCard({ title, value, loading, color, format }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center py-10">
      <span className="text-gray-500 text-sm font-medium mb-2">{title}</span>
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
      ) : (
        <span className={`text-3xl font-bold ${color}`}>{format(value)}</span>
      )}
    </div>
  );
}

// ==========================================
// 3. Invoices View
// ==========================================
function InvoicesView() {
  const [page, setPage] = useState(1);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debouncedSearch = useDebounce(searchInvoice, 500);

  const { data: invoiceData, isLoading: listLoading, isError, error } = useQuery({
    queryKey: ['invoices_list', page, debouncedSearch, statusFilter, dateFrom, dateTo],
    queryFn: async () => {
      const response = await api.get('/seller/finance/invoices', {
        params: {
          page: page,
          invoice_number: debouncedSearch || undefined,
          status: statusFilter || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          per_page: 10
        }
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  const invoices = invoiceData?.data?.items || [];
  
  // KPI Query
  const { data: kpiData } = useQuery({
    queryKey: ['invoices_kpi'],
    queryFn: async () => (await api.get('/seller/finance/invoices/kpi')).data,
    staleTime: 300000
  });
  const stats = kpiData?.data || { total_invoices: 0, paid_invoices: 0, unpaid_invoices: 0 };

  // --- NEW DOWNLOAD FUNCTION ---
  const handleDownload = async (id, invoiceNumber) => {
    const toastId = toast.loading('Downloading...');
    try {
      const response = await api.get(`/seller/finance/invoices/${id}/download`, {
        responseType: 'blob', // Crucial for PDF files
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Downloaded successfully', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to download invoice', { id: toastId });
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border border-emerald-100';
      case 'unpaid': return 'bg-red-100 text-red-700 border border-red-100';
      default: return 'bg-blue-50 text-blue-700 border border-blue-100';
    }
  };

  if (isError) return <div className="text-center p-10 text-red-500">Failed to load invoices: {error.message}</div>;

  return (
    <div className="space-y-6">
       {/* KPI Section */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="px-4 py-2 text-center md:text-left"><span className="text-gray-500 text-sm block">Total</span><span className="text-2xl font-bold text-gray-900">{stats.total_invoices}</span></div>
          <div className="px-4 py-2 text-center md:text-left"><span className="text-gray-500 text-sm block">Paid</span><span className="text-2xl font-bold text-teal-600">{stats.paid_invoices}</span></div>
          <div className="px-4 py-2 text-center md:text-left"><span className="text-gray-500 text-sm block">Unpaid</span><span className="text-2xl font-bold text-red-500">{stats.unpaid_invoices}</span></div>
       </div>

       {/* Filters & Table */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
         <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="text" placeholder="Search ID..." className="px-3 py-2 border rounded-lg" value={searchInvoice} onChange={e => setSearchInvoice(e.target.value)} />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr className="border-b"><th className="px-6 py-4">Invoice</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Action</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {listLoading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-400">Loading...</td></tr>
                ) : invoices.length > 0 ? (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{inv.invoice_number}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${getStatusStyle(inv.status)}`}>{inv.status}</span></td>
                      <td className="px-6 py-4">{inv.grand_total}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <Link to={`/invoice/${inv.id}`} className="text-blue-500"><Eye size={18}/></Link>
                        {/* UPDATED BUTTON */}
                        <button 
                          onClick={() => handleDownload(inv.id, inv.invoice_number)} 
                          className="text-gray-400 hover:text-teal-600"
                        >
                          <ArrowDownToLine size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-400">No invoices found</td></tr>
                )}
              </tbody>
            </table>
         </div>
       </div>
    </div>
  );
}