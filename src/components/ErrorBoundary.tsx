import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Логируем ошибку через logger
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    // В production можно отправить в систему мониторинга
    // Например: Sentry, LogRocket и т.д.
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Alert
            message="Произошла ошибка"
            description={
              <div>
                <p>Что-то пошло не так. Пожалуйста, попробуйте обновить страницу.</p>
                {import.meta.env.DEV && this.state.error && (
                  <details style={{ marginTop: '10px', textAlign: 'left' }}>
                    <summary>Детали ошибки (только в режиме разработки)</summary>
                    <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}
              </div>
            }
            type="error"
            showIcon
            action={
              <Button size="small" onClick={this.handleReset}>
                Попробовать снова
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;



