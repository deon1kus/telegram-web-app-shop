import { useEffect, useState } from "react";
import { Button, Card, Input, message, Space, Switch, Table, Alert } from "antd";
import { SyncOutlined, SettingOutlined, CheckCircleOutlined } from "@ant-design/icons";
import Container from "@components/container";
import { useGetChannelPosts } from "@framework/api/channel/get-posts";
import { useSyncChannel, useGetSyncSettings, useSaveSyncSettings } from "@framework/api/channel/sync";
import { useParseChannelPost } from "@framework/api/channel/parse-post";
import { usePublishProductFromChannel } from "@framework/api/channel/publish-product";
import { useSendTelegramNotification } from "@framework/api/telegram-channel";
import { generateMessageLink, formatProductNotification } from "@utils/telegram-notifications";
import { CHANNELS } from "@utils/telegram-notifications";
import { logError, logInfo, logSuccess } from "@utils/logger";
import useTelegramUser from "@hooks/useTelegramUser";
import { useChannelAutoSync } from "@hooks/useChannelAutoSync";
import type { ChannelSyncSettings, TelegramChannelPost } from "@framework/types";

function ChannelManagement() {
  const user = useTelegramUser();
  const userId = user?.id?.toString() || '';

  const [channelId, setChannelId] = useState<string>('');
  const [channelUsername, setChannelUsername] = useState<string>('');
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(60);

  // Получение настроек
  const { data: syncSettings, isLoading: loadingSettings } = useGetSyncSettings();
  
  // Получение постов
  const { data: posts, isLoading: loadingPosts, refetch: refetchPosts } = useGetChannelPosts({
    channel_id: channelId || syncSettings?.channel_id,
    channel_username: channelUsername || syncSettings?.channel_username,
    limit: 20
  });

  // Синхронизация
  const syncMutation = useSyncChannel();
  const saveSettingsMutation = useSaveSyncSettings();
  const parseMutation = useParseChannelPost();
  const publishMutation = usePublishProductFromChannel();
  const sendNotificationMutation = useSendTelegramNotification();

  // Автоматическая синхронизация
  const { isActive: autoSyncActive } = useChannelAutoSync();

  // Инициализация из настроек
  useEffect(() => {
    if (syncSettings) {
      setChannelId(syncSettings.channel_id);
      setChannelUsername(syncSettings.channel_username);
      setAutoSync(syncSettings.auto_sync);
      setSyncInterval(syncSettings.sync_interval_minutes);
    }
  }, [syncSettings]);

  const handleSaveSettings = async () => {
    if (!channelId && !channelUsername) {
      message.error('Укажите ID канала или username');
      return;
    }

    try {
      logInfo('ChannelManagement', 'Saving sync settings', { channelId, channelUsername });
      
      await saveSettingsMutation.mutateAsync({
        settings: {
          channel_id: channelId,
          channel_username: channelUsername,
          auto_sync: autoSync,
          sync_interval_minutes: syncInterval,
          parse_rules: syncSettings?.parse_rules || {
            price_patterns: [],
            contact_patterns: [],
            category_keywords: {}
          }
        }
      });

      message.success('Настройки сохранены');
      logSuccess('ChannelManagement', 'Settings saved successfully');
    } catch (error) {
      message.error('Ошибка при сохранении настроек');
      logError('ChannelManagement', 'Failed to save settings', error instanceof Error ? error : undefined);
    }
  };

  const handleSync = async () => {
    try {
      logInfo('ChannelManagement', 'Starting manual sync', { channelId, channelUsername });
      
      const result = await syncMutation.mutateAsync({
        channel_id: channelId || syncSettings?.channel_id,
        channel_username: channelUsername || syncSettings?.channel_username,
        limit: 50,
        force: true
      });

      message.success(`Синхронизировано: ${result.synced_count}, Ошибок: ${result.failed_count}`);
      logSuccess('ChannelManagement', 'Sync completed', { 
        synced: result.synced_count, 
        failed: result.failed_count 
      });

      refetchPosts();
    } catch (error) {
      message.error('Ошибка при синхронизации');
      logError('ChannelManagement', 'Sync failed', error instanceof Error ? error : undefined);
    }
  };

  const handleParseAndPublish = async (post: TelegramChannelPost) => {
    try {
      logInfo('ChannelManagement', 'Parsing and publishing post', { message_id: post.message_id });
      
      // Парсим пост
      const parsed = await parseMutation.mutateAsync({
        post,
        parse_rules: syncSettings?.parse_rules
      });

      if (!parsed) {
        message.error('Не удалось распарсить пост');
        return;
      }

      // Публикуем товар
      const publishResult = await publishMutation.mutateAsync({
        parsed_product: parsed,
        user_id: userId,
        auto_publish: true
      });

      // Отправляем уведомление в канал
      if (publishResult.product_id && post.message_id) {
        try {
          const messageLink = generateMessageLink(
            CHANNELS.PRODUCTS.CHAT_ID,
            post.message_id
          );
          
          const notificationText = formatProductNotification(
            parsed.product_name,
            publishResult.product_id,
            messageLink
          );

          await sendNotificationMutation.mutateAsync({
            type: 'product_created',
            productName: parsed.product_name,
            productId: publishResult.product_id,
            messageLink: messageLink,
            channelChatId: CHANNELS.PRODUCTS.CHAT_ID,
            messageId: post.message_id
          });

          logSuccess('ChannelManagement', 'Notification sent', { 
            product_id: publishResult.product_id,
            message_id: post.message_id 
          });
        } catch (notificationError) {
          // Логируем ошибку, но не прерываем процесс
          logError('ChannelManagement', 'Failed to send notification', 
            notificationError instanceof Error ? notificationError : undefined);
        }
      }

      message.success('Товар успешно добавлен в магазин');
      logSuccess('ChannelManagement', 'Product published', { product_name: parsed.product_name });
    } catch (error) {
      message.error('Ошибка при публикации товара');
      logError('ChannelManagement', 'Publish failed', error instanceof Error ? error : undefined);
    }
  };

  const columns = [
    {
      title: 'ID сообщения',
      dataIndex: 'message_id',
      key: 'message_id',
      width: 100
    },
    {
      title: 'Текст',
      dataIndex: 'text',
      key: 'text',
      ellipsis: true,
      render: (text: string) => text?.substring(0, 100) || text?.substring(0, 100) || '-'
    },
    {
      title: 'Фото',
      dataIndex: 'photos',
      key: 'photos',
      width: 80,
      render: (photos: unknown) => {
        const photoArray = Array.isArray(photos) ? photos : [];
        return photoArray.length > 0 ? `📷 ${photoArray.length}` : '-';
      }
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (date: number) => new Date(date * 1000).toLocaleString('ru-RU')
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: TelegramChannelPost) => (
        <Button 
          size="small" 
          onClick={() => handleParseAndPublish(record)}
          loading={parseMutation.isLoading || publishMutation.isLoading}
        >
          Добавить в магазин
        </Button>
      )
    }
  ];

  return (
    <Container>
      <Card title="Управление каналом Telegram" style={{ marginBottom: 20 }}>
        {autoSyncActive && (
          <Alert
            message="Автоматическая синхронизация активна"
            type="success"
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label>ID канала:</label>
            <Input
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="@channel_username или -1001234567890"
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <label>Username канала:</label>
            <Input
              value={channelUsername}
              onChange={(e) => setChannelUsername(e.target.value)}
              placeholder="channel_username"
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <Space>
              <Switch checked={autoSync} onChange={setAutoSync} />
              <span>Автоматическая синхронизация</span>
            </Space>
          </div>

          {autoSync && (
            <div>
              <label>Интервал синхронизации (минуты):</label>
              <Input
                type="number"
                value={syncInterval}
                onChange={(e) => setSyncInterval(parseInt(e.target.value, 10) || 60)}
                min={1}
                style={{ marginTop: 8 }}
              />
            </div>
          )}

          <Space>
            <Button
              type="primary"
              onClick={handleSaveSettings}
              loading={saveSettingsMutation.isLoading}
              icon={<SettingOutlined />}
            >
              Сохранить настройки
            </Button>
            <Button
              onClick={handleSync}
              loading={syncMutation.isLoading}
              icon={<SyncOutlined />}
            >
              Синхронизировать сейчас
            </Button>
          </Space>
        </Space>
      </Card>

      <Card title="Посты из канала">
        <Table
          columns={columns}
          dataSource={posts || []}
          loading={loadingPosts}
          rowKey="message_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Container>
  );
}

export default ChannelManagement;

