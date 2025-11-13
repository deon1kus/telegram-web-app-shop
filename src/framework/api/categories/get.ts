/* eslint-disable camelcase */
/* eslint-disable implicit-arrow-linebreak */
import { TypeCategories } from "@framework/types";
import { useQuery } from "@tanstack/react-query";
import qs from "query-string";

import Api from "../utils/api-config";

const fetch = async ({ queryKey }: any) => {
  const [_key, category_id] = queryKey;
  try {
    const { data } = await Api.get(
      `/categories?${qs.stringify({ category_id })}`
    );
    if (Array.isArray(data)) {
      return data as TypeCategories[];
    }
    if (data && data.categories) {
      return Array.isArray(data.categories) ? data.categories as TypeCategories[] : [];
    }
    return [] as TypeCategories[];
  } catch (error) {
    return [] as TypeCategories[];
  }
};

export interface Props {
  category_id?: number | string;
}

export const useGetCategories = ({ category_id }: Props) =>
  useQuery<TypeCategories[] | null>(["user-info", category_id], fetch);
