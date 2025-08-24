import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.058e848ee9004f09a5d8dd03c77ff5d8',
  appName: 'scan-render-remix',
  webDir: 'dist',
  server: {
    url: 'https://058e848e-e900-4f09-a5d8-dd03c77ff5d8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;