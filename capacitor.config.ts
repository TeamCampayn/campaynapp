import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.campayn.creator',
  appName: 'Campayn Creator',
  webDir: 'dist/client',
  server: {
    url: 'https://campaynapp.vercel.app',
    cleartext: true
  }
};

export default config;
