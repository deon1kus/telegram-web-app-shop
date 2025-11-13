/* eslint-disable camelcase */
/* eslint-disable implicit-arrow-linebreak */
import { TypeSlider } from "@framework/types";
import { useQuery } from "@tanstack/react-query";

import Api from "../utils/api-config";

const fetch = async ({ queryKey }: any) => {
  const [_key] = queryKey;
  const { data } = await Api.get("/main_slider");
  // Если API возвращает массив напрямую
  if (Array.isArray(data)) {
    return data as TypeSlider[];
  }
  // Если API возвращает объект с полем sliders
  if (data && data.sliders) {
    return data.sliders as TypeSlider[];
  }
  // Если данных нет, вернуть пустой массив
  return [] as TypeSlider[];
};

export const useGetSliders = () => useQuery<TypeSlider[]>(["masters"], fetch);
