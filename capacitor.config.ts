import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3287ebed55c1402e9e43a6e5ee3f2700',
  appName: 'Driver Tracking App',
  webDir: 'dist',
  server: {
    url: 'https://3287ebed-55c1-402e-9e43-a6e5ee3f2700.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;