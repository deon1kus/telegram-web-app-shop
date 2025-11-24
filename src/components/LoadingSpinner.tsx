/**
 * Универсальный компонент загрузки
 * Используется для индикации загрузки данных
 */

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullScreen?: boolean;
}

function LoadingSpinner({ 
  size = 'default', 
  tip = 'Загрузка...',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <Spin
      size={size}
      tip={tip}
      indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />}
    />
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        minHeight: '200px'
      }}
    >
      {spinner}
    </div>
  );
}

export default LoadingSpinner;

