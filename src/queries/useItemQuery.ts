import { useQuery } from "react-query";
import { getItems } from "../apis/getItems";

export const useItemQuery = () =>
  useQuery({
    queryKey: "item",
    queryFn: () => getItems(),
    select: ({ data }) => data,
  });
