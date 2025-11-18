/**
 * Хук для автоматической синхронизации канала
 * Периодически проверяет новые посты и синхронизирует их
 */

import { useEffect, useRef } from "react";
import { useSyncChannel, useGetSyncSettings } from "@framework/api/channel/sync";
import { logInfo, logError } from "@utils/logger";

export const useChannelAutoSync = () => {
  const { data: syncSettings } = useGetSyncSettings();
  const syncMutation = useSyncChannel();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Очищаем предыдущий интервал
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Если автосинхронизация включена
    if (syncSettings?.auto_sync && syncSettings?.channel_id) {
      const intervalMinutes = syncSettings.sync_interval_minutes || 60;
      const intervalMs = intervalMinutes * 60 * 1000;

      logInfo('AutoSync', 'Starting auto sync', {
        channel_id: syncSettings.channel_id,
        interval_minutes: intervalMinutes
      });

      // Выполняем синхронизацию сразу
      const performSync = async () => {
        try {
          logInfo('AutoSync', 'Performing automatic sync');
          await syncMutation.mutateAsync({
            channel_id: syncSettings.channel_id,
            channel_username: syncSettings.channel_username,
            limit: 50
          });
          logInfo('AutoSync', 'Automatic sync completed');
        } catch (error) {
          logError('AutoSync', 'Automatic sync failed', error instanceof Error ? error : undefined);
        }
      };

      // Первая синхронизация
      performSync();

      // Устанавливаем интервал
      intervalRef.current = setInterval(performSync, intervalMs);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          logInfo('AutoSync', 'Auto sync stopped');
        }
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [syncSettings?.auto_sync, syncSettings?.channel_id, syncSettings?.sync_interval_minutes]);

  return {
    isActive: syncSettings?.auto_sync || false,
    intervalMinutes: syncSettings?.sync_interval_minutes || 60
  };
};

