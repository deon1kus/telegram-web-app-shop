/* eslint-disable implicit-arrow-linebreak */
import { ParsedProductFromChannel } from "@framework/types";
import { useMutation } from "@tanstack/react-query";
import { logError, logInfo, logSuccess } from "@utils/logger";

import Api from "../utils/api-config";

interface PublishProductFromChannelParams {
  parsed_product: ParsedProductFromChannel;
  user_id: string;
  auto_publish?: boolean;
}

interface PublishProductResponse {
  success: boolean;
  message: string;
  product_id?: number;
  product?: unknown;
}

const publishProductFromChannel = async (
  params: PublishProductFromChannelParams
): Promise<PublishProductResponse> => {
  try {
    logInfo('ChannelPublish', 'Publishing product from channel', { 
      product_name: params.parsed_product.product_name,
      message_id: params.parsed_product.channel_message_id 
    });

    const { data } = await Api.post('/channel/publish-product', {
      parsed_product: params.parsed_product,
      user_id: params.user_id,
      auto_publish: params.auto_publish ?? false
    });

    logSuccess('ChannelPublish', 'Product published successfully', { 
      product_id: data.product_id,
      product_name: params.parsed_product.product_name 
    });

    return data;
  } catch (error) {
    logError('ChannelPublish', 'Failed to publish product', error instanceof Error ? error : undefined, { 
      product_name: params.parsed_product.product_name 
    });
    throw error;
  }
};

export const usePublishProductFromChannel = () =>
  useMutation({
    mutationKey: ['publish-product-from-channel'],
    mutationFn: publishProductFromChannel
  });



