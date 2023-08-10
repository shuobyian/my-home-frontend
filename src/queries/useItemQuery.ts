import { useQuery } from "react-query";
import { ItemReqParams, getItems } from "../apis/getItems";

export const useItemQuery = (params: ItemReqParams) =>
  useQuery({
    queryKey: ["item", params],
    queryFn: () => getItems(params),
    select: ({ data }) => data,
  });
