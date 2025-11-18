// Утилита для отладки загрузки приложения

export const debugLog = (message: string, data?: any) => {
  if (import.meta.env.DEV || window.location.search.includes('debug=true')) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
};

export const checkAppLoad = () => {
  const checks = {
    rootElement: !!document.getElementById('root'),
    telegramScript: !!window.Telegram,
    reactLoaded: typeof window !== 'undefined' && typeof document !== 'undefined',
    cssLoaded: document.styleSheets.length > 0
  };

  debugLog('App load checks:', checks);
  
  if (!checks.rootElement) {
    console.error('[CRITICAL] Root element not found!');
    return false;
  }

  if (!checks.telegramScript && !import.meta.env.DEV) {
    console.warn('[WARNING] Telegram script not loaded. App may not work correctly in Telegram.');
  }

  return true;
};

// Проверка загрузки критических ресурсов
export const checkResources = () => {
  const resources = {
    fonts: document.fonts?.check('12px Inter') || document.fonts?.check('12px Roboto'),
    styles: document.styleSheets.length > 0,
    scripts: document.scripts.length > 0
  };

  debugLog('Resource checks:', resources);
  return resources;
};

