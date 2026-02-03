import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProductOptions } from '../../hooks/useProductOptions.js';
import toast from 'react-hot-toast';
import api from "../../Services/api.js";
import { Settings2 } from 'lucide-react';

export default function ShowProductTest() {

const {id}= useParams();
const queryClient = useQueryClient();
const [isEditing,setIsEditing] = useState(false);
const [formData,setFormData] = useState(null);
const [variantImages,setVariantImages] = useState({});
const [selectedImage,setSelectedImage] = useState(null);
console.log(id);
const {data:product , isLoading:productLoading , isError,error } = useQuery({
    queryKey:['product',id],
    queryFn: async()=>{
        const response  = await api.get(`/seller/products/${id}`);
        return response.data.data;
    },
    staleTime:1000*60
})
const {data:options,isLoading:OptionLoading,isError:isErrorOption,error:ErrorOption} = useProductOptions();
useEffect(()=>{
 if(isErrorOption){
    // toast.error('Faild to fetch error option.');
    toast.error("Faild fetch option ");
    console.log(ErrorOption);
 }
},[
   isErrorOption,ErrorOption
])
const toggleEdit = () =>{
    if(!isEditing){
        setFormData(product);
        // setFormData(JSON.parse(JSON.stringify(product)));
        setVariantImages({});
    }
    else {
        setFormData(null);
    }
    setIsEditing(!isEditing);
}
const handleInputchange = (e)=>{
    const {name,value} = e.target;
    setFormData(prev=>( {...prev,[name]:value})  
    )}
const handleVariantImageChange = (index , type , file)=>{
    if(file){
        setVariantImages(prev=>({
            ...prev,[index]:{
                ...prev[index],
                [type]:file
            }
        }));
    }
}
const handleVariantchange = (index,name,value)=>{
    const updatedVariants = [...formData.variants];
     if(name == 'default_value'){
      updatedVariants.forEach((v,num)=>{
        v.is_default = (index===num);
      });
    }
    else{
        updatedVariants[index] = {...updatedVariants[index],[name]:value};
    }
    setFormData(prev=>{return {...prev,variants:updatedVariants}});
}
const displaydata = isEditing? formData : product;
const subCategories = options?.categories || [];
const brands = options?.brands || [];
const styles = options?.styles || [];
const colors = options?.colors || [];
const sizes = options?.sizes || [];

const updatemutaion = useMutation({
    mutationFn:(data)=>{
      const response = api.post(`/seller/products/${id}`,data);
      return response;
    },
    onSuccess:(response)=>{
     queryClient.invalidateQueries(['product',id]);
     toast.success(response.data.message || "Product updarted successfully.");
     setIsEditing('false');
     setVariantImages({});
    },
    onError:(err)=>{
        toast.error(err.response.data.message||'Faild Update Product');
         setIsEditing('false');
         setFormData(product);
    }
  })
  const handleSave = ()=>{
    const data = new FormData();
    data.append("_method",'PUT');
    const appendIf = (key,value)=>{
        if(value !== null && value !== undefined && value !== "" ){
            data.append(key,value);
        }
    }; 
    appendIf('name_en', formData.name_en);
    appendIf('name_ar', formData.name_ar);
    appendIf('description_en', formData.description_en);
    appendIf('description_ar', formData.description_ar);
    appendIf('material', formData.material);
    appendIf('age_from', formData.age_from);
    appendIf('age_to', formData.age_to);
    appendIf('slug', formData.slug);
    appendIf('category_id', formData.category_id ?? formData.category?.id);
    appendIf('brand_id', formData.brand_id ?? formData.brand?.id);
    appendIf('style_id', formData.style_id ?? formData.style?.id);
    appendIf('country_id', formData.country_id ?? formData.country?.id);
   formData.variants.forEach((v, index) => {
        if(v.id) data.append(`variants[${index}][id]`, v.id);
        appendIf(`variants[${index}][sku]`, v.sku);
        appendIf(`variants[${index}][price]`, v.price);
        appendIf(`variants[${index}][final_price]`, v.final_price);
        appendIf(`variants[${index}][quantity]`, v.quantity);
        appendIf(`variants[${index}][is_default]`, v.is_default ? '1' : '0');
        const colorId = v.color_id ?? v.color?.id;
        const sizeId = v.size_id ?? v.size?.id;
        appendIf(`variants[${index}][color_id]`, colorId);
        appendIf(`variants[${index}][size_id]`, sizeId);

        if (variantImages[index]?.main){
            appendIf(`variants[${index}][main_img]`,variantImages[index].main);
        }
         if (variantImages[index]?.sub){
            appendIf(`variants[${index}][sub_img]`,variantImages[index].sub);
        }
    });
    updatemutaion.mutate(data);
  }

if(productLoading) return (
    <div className='bg-black text-amber-50'>Loading....</div>
) 
if(isError){
    console.log(error);
    <div className='bg-black text-amber-50'>there are error while fetch Prodcut.</div>
}

  return <>
  <div>prodct fetch success and name is {product.name_en} and ststus is {product.status}</div>
   </>
   

  
  
}
