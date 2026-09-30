export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
    url?: string;
  };
  plugins?: Record<string, any>;
}

const config: CapacitorConfig = {
  appId: 'com.nsangaweh.app',
  appName: 'NSANGAWEH',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#0B6E4F',
      sound: 'beep.wav',
    },
  },
};

export default config;
