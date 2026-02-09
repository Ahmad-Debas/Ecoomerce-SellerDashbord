import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, Printer, Download, MapPin, 
  User, Calendar, FileText 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ShowInvoice() {
  const { id } = useParams();

  // --- Fetch Invoice Details ---
  const { data: invoiceData, isLoading, isError } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await api.get(`/seller/finance/invoices/${id}`);
      return res.data;
    },
  });

  const invoice = invoiceData?.data;

  // --- Helpers ---
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-100 text-emerald-700';
      case 'unpaid': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePrint = () => {
    if (invoice?.download_url) {
      window.open(invoice.download_url, '_blank');
    } else {
      toast.error("Invoice download link not available");
    }
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  if (isError || !invoice) return <div className="p-8 text-center text-red-500">Invoice not found.</div>;

  const address = invoice.customer?.default_address;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans pb-20">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/payments" className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Invoice Details</h1>
            <div className="text-sm text-gray-500">Payment &gt; <span className="text-teal-600 font-medium">{invoice.invoice_number}</span></div>
          </div>
        </div>
      </div>

      {/* --- Main Invoice Card --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Title Row & Action */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h2>
          
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition shadow-sm w-full md:w-auto"
          >
            <Printer size={18} /> Print Invoice
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          
          {/* --- Info Grid (Buyer & Details) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Buyer Info */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="text-teal-700 font-bold mb-4 flex items-center gap-2">
                <User size={18} /> Buyer
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3">
                  <span className="font-bold text-gray-900">Customer Name:</span>
                  <span className="col-span-2 text-gray-600">{invoice.customer?.name}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-bold text-gray-900">Email:</span>
                  <span className="col-span-2 text-gray-600 break-all">{invoice.customer?.email}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-bold text-gray-900">Address:</span>
                  <span className="col-span-2 text-gray-600">
                    {address ? (
                      <>
                        {address.building_no} {address.address_line1}, <br />
                        {address.city}, {address.country_name_en}
                      </>
                    ) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3">
                  <span className="font-bold text-gray-900">Issued Date:</span>
                  <span className="col-span-2 text-gray-600">{formatDate(invoice.created_at)}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-bold text-gray-900">Supply Date:</span>
                  <span className="col-span-2 text-gray-600">{invoice.paid_at ? formatDate(invoice.paid_at) : '-'}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-gray-900">Status:</span>
                  <div className="col-span-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 pt-2">
                  <span className="font-bold text-gray-900">Order ID:</span>
                  <span className="col-span-2 text-gray-600 font-mono">{invoice.order_number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- Items Table --- */}
          <div className="mt-8">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Product ID</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600">#{item.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View for Items */}
            <div className="md:hidden flex flex-col gap-4">
              {invoice.items.map((item) => (
                <div key={item.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-900">{item.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">#{item.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                    <span>Qty: {item.quantity} x {formatCurrency(item.unit_price)}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(item.line_total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Totals Section --- */}
          <div className="flex flex-col md:flex-row justify-end mt-8 border-t border-gray-100 pt-6">
            <div className="w-full md:w-1/3 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sub Total</span>
                <span className="font-medium text-gray-900">{invoice.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (VAT)</span>
                <span className="font-medium text-gray-900">{invoice.vat_total}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">{invoice.shipping_total}</span>
              </div>
              
              <div className="border-t border-dashed border-gray-200 my-2"></div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-teal-700">{formatCurrency(invoice.grand_total || invoice.subtotal)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}