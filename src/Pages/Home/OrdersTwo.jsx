import React, { useState } from 'react'
import api from '../../services/api.js'
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import toast from 'react-hot-toast';

const fetchKpi = async ()=>{
    const response = await api.get("/seller/orders/kpi");
    return response.data.data;
}

const fetchOrders = async (page = 1 )=>{
    const response = await api.get("/seller/orders",page);
     return response.data.data.items;
}

const updateOrderStatus = async ({id,status})=>{
  const response = await api.put(`/seller/orders/${id}/status`,{status})
  return response.data
}

export default function OrdersTwo() {

  const [page,setPage] = useState(1);
  const queryClient = useQueryClient();


  const [orderSelect,setOrderSelect] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const[newstatus,setNewStatus] = useState("");
  const {data:orders,isLoading:ordersLoading , isError:IsorderError, error:orderError} = useQuery({
    queryKey:['orders-list',page],
    queryFn: () => fetchOrders(page),
    keepPreviousData:true
  });
  const {data:kpisOrders,isLoading:KpiLoading , isError:iSkpiError,error:KpiError} = useQuery({
    queryKey:['ordersKpi'],
    queryFn: ()=>fetchKpi,
    initialData:{ total_orders: 0, pending_orders: 0, completed_orders: 0, total_earnings: 0 }
  })
  const CloseModal = ()=>{
    setIsModalOpen(false);
    setOrderSelect('');
  }
  
  const statusMutaion = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: ()=>{
        queryClient.invalidateQueries(['orders-list',page]);
        queryClient.invalidateQueries(['ordersKpi']);
        toast.success("Order updated successfully");
        CloseModal();
    },
    onError: (err)=>{
      toast.error(err.response.data.message?? "Error while update status order");
    }

  }) 

  // const isError = iSkpiError || IsorderError
  const error = KpiError ?? orderError ?? null;

  // if(isError)
  //   return (
  //      <h3 className='text-red-500'>Error Fetching data</h3>
  //   );

    if(error)
          console.log(error);
      // return <h3 className='text-red-500'>{error.response.data.message}</h3>

  if(ordersLoading || !orders)
      return(
      <>
     <div className='h-screen  flex items-center justify-center    '>
      <div class="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
     </div>
      </>
    );

    return (
      <> 
      <h1>success</h1>
      </>
    )
    
    

  // return (
    
  // )
}
