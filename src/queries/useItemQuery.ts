import { ItemReqParams, getItems } from "apis/getItems";
import { useQuery } from "react-query";

export const useItemQuery = (params: ItemReqParams) =>
  useQuery({
    queryKey: ["item", params],
    queryFn: () => getItems(params),
    select: ({ data }) => data,
  });
