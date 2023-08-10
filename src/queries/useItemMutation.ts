import { useMutation } from "react-query";
import { postItem } from "../apis/postItem";

export interface Item {
  name: string;
  level: number;
  craftingPrice: number;
  materials: {
    name: string;
    base: boolean;
    count: number;
  }[];
}

export const useItemMutation = () =>
  useMutation({
    mutationFn: postItem,
  });
