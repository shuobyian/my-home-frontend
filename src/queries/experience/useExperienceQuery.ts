import { getExperience } from "apis/experience/getExperience";
import { useQuery } from "react-query";

export const useExperienceQuery = () =>
  useQuery({
    queryKey: ["experience"],
    queryFn: () => getExperience(),
    select: ({ data }) => data,
  });
