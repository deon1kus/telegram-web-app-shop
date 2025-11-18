/**
 * API для удаления товара из Telegram канала
 */

import { useMutation } from "@tanstack/react-query";

import Api from "../utils/api-config";

interface TelegramProductDelete {
  messageId: number;
  userId: string;
}

/**
 * Удаляет товар по message_id из Telegram
 */
const useDeleteProductFromTelegram = () =>
  useMutation({
    mutationKey: ["delete-product-from-telegram"],
    mutationFn: async (data: TelegramProductDelete) => {
      const response = await Api.delete(`/products/from-telegram/${data.messageId}`, {
        data: {
          user_id: data.userId
        }
      });

      return response.data;
    }
  });

export default useDeleteProductFromTelegram;

