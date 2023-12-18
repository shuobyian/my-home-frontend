import { deleteProducts } from "apis/product/deleteProducts";
import { postProduct } from "apis/product/postProduct";
import { postProducts } from "apis/product/postProducts";
import { putProduct } from "apis/product/putProduct";
import { useMutation } from "react-query";

export const usePostProductsMutation = () =>
  useMutation({
    mutationFn: postProducts,
  });

export const usePostProductMutation = () =>
  useMutation({
    mutationFn: postProduct,
  });

export const usePutProductMutation = () =>
  useMutation({
    mutationFn: putProduct,
  });

export const useDeleteProductsMutation = () =>
  useMutation({
    mutationFn: deleteProducts,
  });
