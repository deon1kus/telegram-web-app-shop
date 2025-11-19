/**
 * API для отправки уведомлений в канал уведомлений
 * 
 * Используется для уведомления о создании/обновлении/удалении товаров
 */

import { useMutation } from "@tanstack/react-query";

import Api from "../utils/api-config";

interface NotificationData {
  type: 'product_created' | 'product_updated' | 'product_deleted';
  productName: string;
  productId: number;
  messageLink?: string;
  channelChatId?: string;
  messageId?: number;
}

/**
 * Отправляет уведомление в канал уведомлений
 */
const useSendTelegramNotification = () =>
  useMutation({
    mutationKey: ["send-telegram-notification"],
    mutationFn: async (data: NotificationData) => {
      const response = await Api.post("/telegram/send-notification", {
        notification_chat_id: -1003271699368, // Канал уведомлений (тот же, где товары)
        type: data.type,
        product_name: data.productName,
        product_id: data.productId,
        message_link: data.messageLink,
        channel_chat_id: data.channelChatId,
        message_id: data.messageId
      });

      return response.data;
    }
  });

export default useSendTelegramNotification;

