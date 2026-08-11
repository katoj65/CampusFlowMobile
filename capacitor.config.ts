import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.campusflow.app',
  appName: 'CampusFlow',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      // Keep the native splash on screen instead of handing off to a blank
      // WebView — main.ts calls SplashScreen.hide() once the first route
      // has actually painted.
      launchAutoHide: false,
    },
  },
};

export default config;
