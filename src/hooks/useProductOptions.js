import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useProductOptions = () => {
  return useQuery({
    queryKey: ['static-product-options'], 
    queryFn: async () => {
      const [categories, brands, styles, countries, colors, sizes] = await Promise.all([
        api.get('/public/categories/subcategory'),
        api.get('/public/brands'),
        api.get('/public/styles'),
        api.get('/public/countries'),
        api.get('/public/colors'),
        api.get('/public/sizes'),
      ]);

      const extractArray = (res) => {
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        if (Array.isArray(res.data?.data?.items)) return res.data.data.items;
        return [];
      };
      return {
        categories: extractArray(categories),
        brands: extractArray(brands),
        styles: extractArray(styles),
        countries: extractArray(countries),
        colors: extractArray(colors),
        sizes: extractArray(sizes),
      };
    },
    staleTime: Infinity, 
    refetchOnWindowFocus: false,
  });
};