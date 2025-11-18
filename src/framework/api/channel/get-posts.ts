/* eslint-disable implicit-arrow-linebreak */
import { TelegramChannelPost } from "@framework/types";
import { useQuery } from "@tanstack/react-query";
import { logError, logInfo } from "@utils/logger";

import Api from "../utils/api-config";

interface GetChannelPostsParams {
  channel_id?: string;
  channel_username?: string;
  limit?: number;
  offset?: number;
  after_message_id?: number;
}

const fetchChannelPosts = async ({ queryKey }: any): Promise<TelegramChannelPost[]> => {
  const [_key, params] = queryKey;
  const { channel_id, channel_username, limit = 20, offset = 0, after_message_id } = params as GetChannelPostsParams;

  try {
    logInfo('ChannelAPI', 'Fetching channel posts', { channel_id, channel_username, limit, offset });
    
    const queryParams = new URLSearchParams();
    if (channel_id) queryParams.append('channel_id', channel_id);
    if (channel_username) queryParams.append('channel_username', channel_username);
    queryParams.append('limit', limit.toString());
    queryParams.append('offset', offset.toString());
    if (after_message_id) queryParams.append('after_message_id', after_message_id.toString());

    const { data } = await Api.get(`/channel/posts?${queryParams.toString()}`);
    
    logInfo('ChannelAPI', `Successfully fetched ${data?.posts?.length || 0} posts`);
    
    return data?.posts || [];
  } catch (error) {
    logError('ChannelAPI', 'Failed to fetch channel posts', error instanceof Error ? error : undefined, { params });
    throw error;
  }
};

export const useGetChannelPosts = (params: GetChannelPostsParams) =>
  useQuery<TelegramChannelPost[]>(
    ['channel-posts', params],
    fetchChannelPosts,
    {
      enabled: !!(params.channel_id || params.channel_username),
      staleTime: 5 * 60 * 1000, // 5 минут
      retry: 2
    }
  );

