/**
 * API для создания товара из Telegram канала
 * 
 * Используется для автоматической синхронизации товаров из канала
 */

import { TypeProductPost } from "@framework/types";
import { useMutation } from "@tanstack/react-query";

import Api from "../utils/api-config";

interface TelegramProductData {
  messageId: number;
  description: string;
  price: number;
  quantity?: number;
  category?: string;
  contact?: string;
  photoFileId?: string;
  photoUrl?: string;
  userId: string;
}

/**
 * Создает товар из данных Telegram сообщения
 */
const useCreateProductFromTelegram = () =>
  useMutation({
    mutationKey: ["create-product-from-telegram"],
    mutationFn: async (data: TelegramProductData) => {
      // Преобразуем данные в формат TypeProductPost
      const productData: TypeProductPost = {
        user_id: data.userId,
        product_name: data.description,
        description: data.description,
        price: data.price,
        quantity: data.quantity || 0,
        category_ids: [], // Будет заполнено на бэкенде по названию категории
        photos: data.photoUrl ? [data.photoUrl] : []
      };

      // Отправляем на специальный endpoint для товаров из Telegram
      const response = await Api.post("/products/from-telegram", {
        ...productData,
        telegram_message_id: data.messageId,
        telegram_channel_id: -1003271699368,
        category_name: data.category,
        contact: data.contact,
        photo_file_id: data.photoFileId
      });

      return response.data;
    }
  });

export default useCreateProductFromTelegram;

