import { calculateWalnut, fetchExperience } from "apis/experience";
import { useMutation, useQuery } from "react-query";

export const experienceKeys = {
  all: ["experience"] as const,
};

export const useExperienceQuery = () =>
  useQuery({
    queryKey: experienceKeys.all,
    queryFn: fetchExperience,
  });

export const useCalculateWalnutMutation = () =>
  useMutation({
    mutationFn: calculateWalnut,
  });
