import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  HiPlus, HiSearch, HiFilter, 
  HiEye, HiTrash, HiChevronLeft, HiChevronRight 
} from "react-icons/hi";
import api from "../../services/api"; 
import toast from "react-hot-toast";

export default function Products() {
  const { i18n } = useTranslation(); // removed 't' if not used directly
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // --- States ---
  const pageParam = searchParams.get('page');
  const initialPage = pageParam ? parseInt(pageParam) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const searchParam = searchParams.get('search');
  const [search, setSearch] = useState(searchParam || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam || "");

  const [productToDeleteId, setProductToDeleteId] = useState(null);

  // --- 1. Debounce Logic ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      
      const params = {};
      if(search) params.search = search;
      if(currentPage !== 1) params.page = currentPage; 
      setSearchParams(params);

    }, 500);
    return () => clearTimeout(timer);
  }, [search, currentPage, setSearchParams]);

  useEffect(() => {
      if(search !== debouncedSearch) setCurrentPage(1);
  }, [debouncedSearch]);


  // --- 2. React Query (Fetch Products) ---
  const { 
    data: productsData,
    isPending, 
    isError, 
    isPlaceholderData,
    isFetching 
  } = useQuery({
    queryKey: ['seller-products', currentPage, debouncedSearch],
    queryFn: async () => {
      const response = await api.get("/seller/products", {
        params: {
          search: debouncedSearch,
          page: currentPage,
          per_page: 10,
        },
      });
      return response.data.data;
    },
    placeholderData: keepPreviousData, 
    staleTime: 5000,
  });

  // --- Derived Data ---
  const products = productsData?.items || [];
  const totalPages = productsData?.meta?.last_page || 1;

  // --- Helpers ---
  const getName = (item) => i18n.language === 'ar' ? item.name_ar : item.name_en;

  const renderColors = (colors) => {
    if (!colors || colors.length === 0) return <span className="text-gray-400 text-xs">-</span>;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {colors.map((color) => (
          <div 
            key={color.id} 
            className="w-4 h-4 rounded-full border border-gray-200 shadow-sm relative group cursor-help"
            style={{ 
              backgroundColor: color.code === 'multi' ? 'transparent' : color.code,
              backgroundImage: color.code === 'multi' ? 'linear-gradient(to right, red,orange,yellow,green,blue,indigo,violet)' : 'none'
            }}
            title={i18n.language === 'ar' ? color.name_ar : color.name_en}
          />
        ))}
      </div>
    );
  };

  // --- 3. Delete Logic ---
  const deleteProduct = async (id) => {
    return await api.delete(`/seller/products/${id}`);
  }

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    // ✅ تحسين: استقبال response لاستخراج الرسالة
    onSuccess: (response) => {
       queryClient.invalidateQueries(['seller-products', currentPage, debouncedSearch]);
       
       // إغلاق المودال
       setProductToDeleteId(null); 
       
       // عرض رسالة السيرفر
       toast.success(response?.data?.message || 'Product deleted successfully.');
    },
    onError: (error) => {
      console.log(error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Delete Product Failed");
      // ملاحظة: لا نغلق المودال هنا ليتمكن المستخدم من المحاولة مرة أخرى
    },
  });

  return (
    // ✅ إضافة relative هنا لتأكيد تموضع العناصر بداخله
    <div className="space-y-6 animate-fade-in p-4 md:p-0 relative">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Products List</p>
        </div>
      </div>

      {/* --- Main Content Card --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        
        {/* --- Toolbar --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative group w-full md:w-auto">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 w-full md:w-80 transition-all bg-gray-50 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium whitespace-nowrap">
              <HiFilter size={18} />
              <span>Filter</span>
            </button>

            <Link 
              to="/create-product" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all font-bold whitespace-nowrap"
            >
              <HiPlus size={20} />
              <span>New Product</span>
            </Link>
          </div>
        </div>

        {/* --- Table Container --- */}
        <div className={`overflow-x-auto rounded-xl border border-gray-100 relative ${isFetching ? 'opacity-70' : 'opacity-100'} transition-opacity`}>
             
             {isFetching && !isPending && (
               <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-10">
                   <div className="h-full bg-blue-500 animate-progress origin-left-right"></div>
               </div>
             )}

          <table className="w-full text-left text-sm text-gray-600 min-w-[1000px]">
            <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Image</th>
                <th className="px-6 py-4 whitespace-nowrap">Product Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Brand</th>
                <th className="px-6 py-4 whitespace-nowrap">Category</th>
                <th className="px-6 py-4 whitespace-nowrap">Colors</th>
                <th className="px-6 py-4 whitespace-nowrap">Price</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isPending ? (
                // Skeleton Loading
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-12 h-12 bg-gray-200 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 mb-2"></div><div className="h-3 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20 mx-auto"></div></td>
                  </tr>
                ))
              ) : isError ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-red-500">
                        Error loading data. Please try again.
                    </td>
                  </tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    
                    <td className="px-6 py-3">
                      <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden p-0.5 bg-white">
                        <img 
                          src={product.default_variant?.main_img || "https://placehold.co/100x100?text=No+Img"} 
                          alt={getName(product)} 
                          className="w-full h-full object-cover rounded-md group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-3 max-w-[220px]">
                      <div>
                        <p className="font-bold text-gray-800 line-clamp-2" title={getName(product)}>{getName(product)}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{product.sku}</p>
                      </div>
                    </td>

                    <td className="px-6 py-3 font-medium whitespace-nowrap">{product.brand ? getName(product.brand) : "-"}</td>

                    <td className="px-6 py-3 whitespace-nowrap">
                        <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                          {product.category ? getName(product.category) : "General"}
                        </span>
                    </td>

                    <td className="px-6 py-3 min-w-[120px]">{renderColors(product.variant_colors)}</td>

                    <td className="px-6 py-3 whitespace-nowrap">
                        <div className="font-bold text-gray-800">
                           {product.default_variant?.final_price || product.default_variant?.price} <span className="text-xs font-normal text-gray-500">SAR</span>
                        </div>
                        {product.default_variant?.discount_price > 0 && (
                             <div className="text-xs text-red-400 line-through decoration-red-400">
                                {product.default_variant?.price}
                             </div>
                        )}
                    </td>

                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Link to={`/products/${product.id}`} title="View" className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition"><HiEye size={18} /></Link>
                       
                        
                        {/* ✅ زر الحذف فقط يغير الـ state */}
                        <button 
                            title="Delete" 
                            disabled={deleteMutation.isPending} 
                            onClick={() => setProductToDeleteId(product.id)} 
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                        >
                            <HiTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <HiSearch size={40} className="mb-2 opacity-20"/>
                        <p>No products found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-gray-100 pt-6">
          <div className="text-sm text-gray-500">
            Page <span className="font-bold text-gray-900">{currentPage}</span> of {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isPlaceholderData} 
              className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition bg-white"
            >
              <HiChevronLeft /> Previous
            </button>
            
            <button 
              onClick={() => {
                  if (!isPlaceholderData && currentPage < totalPages) {
                      setCurrentPage(p => p + 1);
                  }
              }}
              disabled={currentPage >= totalPages || isPlaceholderData}
              className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition bg-white"
            >
              Next <HiChevronRight />
            </button>
          </div>
        </div>
      </div>

    
      {productToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          
          {/* Modal Content */}
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl scale-100 animate-scale-in">
            
            <h2 className="text-lg font-bold text-gray-800">تأكيد الحذف</h2>
            
            <p className="mt-2 text-sm text-gray-600">
              هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              
              {/* زر الإلغاء */}
              <button
                disabled={deleteMutation.isPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
                onClick={() => setProductToDeleteId(null)}
              >
                إلغاء
              </button>

              {/* زر تأكيد الحذف */}
              <button
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={() => deleteMutation.mutate(productToDeleteId)}
              >
                {deleteMutation.isPending ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        جاري الحذف...
                    </>
                ) : (
                    'حذف'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}