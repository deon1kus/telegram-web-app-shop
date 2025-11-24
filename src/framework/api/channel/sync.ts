/* eslint-disable implicit-arrow-linebreak */
import { ChannelSyncResult, ChannelSyncSettings } from "@framework/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { logError, logInfo, logSuccess } from "@utils/logger";

import Api from "../utils/api-config";

// Получить настройки синхронизации
const fetchSyncSettings = async (): Promise<ChannelSyncSettings | null> => {
  try {
    logInfo('ChannelSync', 'Fetching sync settings');
    const { data } = await Api.get('/channel/sync-settings');
    logSuccess('ChannelSync', 'Sync settings fetched', { channel_id: data?.channel_id });
    return data;
  } catch (error) {
    logError('ChannelSync', 'Failed to fetch sync settings', error instanceof Error ? error : undefined);
    return null;
  }
};

export const useGetSyncSettings = () =>
  useQuery<ChannelSyncSettings | null>(
    ['channel-sync-settings'],
    fetchSyncSettings,
    {
      staleTime: 10 * 60 * 1000, // 10 минут
      gcTime: 30 * 60 * 1000, // 30 минут в кеше
      retry: 1,
      refetchOnWindowFocus: false, // Не обновляем при фокусе окна
      refetchOnMount: false // Используем кеш при монтировании
    }
  );

// Сохранить настройки синхронизации
interface SaveSyncSettingsParams {
  settings: ChannelSyncSettings;
}

const saveSyncSettings = async ({ settings }: SaveSyncSettingsParams): Promise<ChannelSyncSettings> => {
  try {
    logInfo('ChannelSync', 'Saving sync settings', { channel_id: settings.channel_id });
    const { data } = await Api.post('/channel/sync-settings', settings);
    logSuccess('ChannelSync', 'Sync settings saved', { channel_id: data?.channel_id });
    return data;
  } catch (error) {
    logError('ChannelSync', 'Failed to save sync settings', error instanceof Error ? error : undefined, { settings });
    throw error;
  }
};

export const useSaveSyncSettings = () =>
  useMutation({
    mutationKey: ['save-sync-settings'],
    mutationFn: saveSyncSettings
  });

// Синхронизировать канал
interface SyncChannelParams {
  channel_id?: string;
  channel_username?: string;
  limit?: number;
  force?: boolean;
}

const syncChannel = async (params: SyncChannelParams): Promise<ChannelSyncResult> => {
  try {
    logInfo('ChannelSync', 'Starting channel sync', params);
    const { data } = await Api.post('/channel/sync', params);
    logSuccess('ChannelSync', 'Channel sync completed', { 
      synced_count: data.synced_count,
      failed_count: data.failed_count 
    });
    return data;
  } catch (error) {
    logError('ChannelSync', 'Channel sync failed', error instanceof Error ? error : undefined, { params });
    throw error;
  }
};

export const useSyncChannel = () =>
  useMutation({
    mutationKey: ['sync-channel'],
    mutationFn: syncChannel
  });



