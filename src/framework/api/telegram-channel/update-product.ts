/**
 * API для обновления товара из Telegram канала
 */

import { useMutation } from "@tanstack/react-query";

import Api from "../utils/api-config";

interface TelegramProductUpdate {
  messageId: number;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
  contact?: string;
  photoFileId?: string;
  photoUrl?: string;
  userId: string;
}

/**
 * Обновляет товар по message_id из Telegram
 */
const useUpdateProductFromTelegram = () =>
  useMutation({
    mutationKey: ["update-product-from-telegram"],
    mutationFn: async (data: TelegramProductUpdate) => {
      const response = await Api.put(`/products/from-telegram/${data.messageId}`, {
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        category_name: data.category,
        contact: data.contact,
        photo_file_id: data.photoFileId,
        photo_url: data.photoUrl,
        user_id: data.userId
      });

      return response.data;
    }
  });

export default useUpdateProductFromTelegram;

