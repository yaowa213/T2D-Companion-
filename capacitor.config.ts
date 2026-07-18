import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'za.co.t2dcompanion.app',
  appName: 'T2D Companion',
  webDir: 'dist',
  // Fix: Removed deprecated 'bundledWebRuntime' property which is not present in CapacitorConfig type
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#2563eb',
      sound: 'beep.wav',
    },
  },
};

export default config;