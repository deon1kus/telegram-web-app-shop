/* eslint-disable implicit-arrow-linebreak */
import { ParsedProductFromChannel, TelegramChannelPost } from "@framework/types";
import { useMutation } from "@tanstack/react-query";
import { logError, logInfo, logSuccess } from "@utils/logger";

import Api from "../utils/api-config";

interface ParsePostParams {
  post: TelegramChannelPost;
  parse_rules?: {
    price_patterns?: string[];
    contact_patterns?: string[];
    category_keywords?: Record<string, number[]>;
  };
}

const parseChannelPost = async ({ post, parse_rules }: ParsePostParams): Promise<ParsedProductFromChannel> => {
  try {
    logInfo('ChannelParser', 'Parsing channel post', { message_id: post.message_id, channel_id: post.channel_id });
    
    const { data } = await Api.post('/channel/parse-post', {
      post,
      parse_rules
    });
    
    logSuccess('ChannelParser', 'Post parsed successfully', { 
      message_id: post.message_id,
      product_name: data.product_name 
    });
    
    return data;
  } catch (error) {
    logError('ChannelParser', 'Failed to parse post', error instanceof Error ? error : undefined, { 
      message_id: post.message_id 
    });
    throw error;
  }
};

export const useParseChannelPost = () =>
  useMutation({
    mutationKey: ['parse-channel-post'],
    mutationFn: parseChannelPost
  });



