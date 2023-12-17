import { postProducts } from "apis/product/postProduct";
import { useMutation } from "react-query";

export const useProductMutation = () =>
  useMutation({
    mutationFn: postProducts,
  });
