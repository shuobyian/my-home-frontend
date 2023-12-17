import { ProductReqParams, getProducts } from "apis/product/getProducts";
import { useQuery } from "react-query";

export const useProductQuery = (params: ProductReqParams) =>
  useQuery({
    queryKey: ["item", params],
    queryFn: () => getProducts(params),
    select: ({ data }) => data,
  });
