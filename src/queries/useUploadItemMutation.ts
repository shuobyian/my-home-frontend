import { postUploadItem } from "apis/result/postUploadItem";
import { useMutation } from "react-query";

export const useUploadItemMutation = () =>
  useMutation({
    mutationFn: postUploadItem,
  });
