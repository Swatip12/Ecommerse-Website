export const environment = {
  production: false,
  apiUrl: '/api',
  wsUrl: '/ws',
  enableDevTools: true,
  logLevel: 'warn',
  
  // Feature flags
  features: {
    enableAnalytics: true,
    enablePushNotifications: true,
    enableOfflineMode: false,
    enableServiceWorker: false
  },
  
  // Cache configuration
  cache: {
    defaultTtl: 60000, // 1 minute
    maxSize: 50,
    enablePersistence: false
  },
  
  // Performance monitoring
  monitoring: {
    enablePerformanceTracking: true,
    enableErrorTracking: true,
    sampleRate: 1.0 // 100% sampling for staging
  },
  
  // Security settings
  security: {
    enableCSP: false,
    enableSRI: false,
    tokenRefreshThreshold: 300000 // 5 minutes before expiry
  }
};