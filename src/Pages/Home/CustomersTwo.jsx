import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import api from '../../services/api.js';

 function useDebounce(value , delay){
//     const [debouncedValue, setDebouncedValue] = useState(value);
//     useEffect({
//        const handler = setTimeOut(()=>{
//         setDebouncedValue(value);
//        },delay);
//        return ()=> clearTimeout(handler);
//     }
//     ,[value,delay])
    
//     return debouncedValue;
}

export default function CustomersTwo() {

    const [page,setPage]  = useState(1);
    const [search,setSearch] = useState('');
    const deboundedSearch = useDebounce(search,800);

    const {data:cutomersData , isLoadind:customerLoad , isError , error} = useQuery({
        queryKey: ['customers',page,deboundedSearch],
        queryFn : async ()=>{
            const response = await api.get(`/seller/customers`,{
                params : {
                    page: page,
                    search: deboundedSearch || undefined,
                    per_page: 10
                }
            })
            return response.data.data.items;
        },
        keepPreviousData: true,
    })

    
  return (
    <div>CustomersTwo</div>
  )
}
