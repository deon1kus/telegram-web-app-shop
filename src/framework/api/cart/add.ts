/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable camelcase */
import { TypeAddToCart } from "@framework/types";
import { useMutation } from "@tanstack/react-query";

import Api from "../utils/api-config";

const useAddToCart = () =>
  useMutation({
    mutationKey: ["add-to-cart"],
    mutationFn: async ({ user_id, cart_items }: TypeAddToCart) => {
      try {
        const response = await Api.put("/carts", {
          user_id,
          cart_items
        });
        return response.data;
      } catch (error: any) {
        console.error('Add to cart API error:', error);
        throw error;
      }
    }
  });

export default useAddToCart;
