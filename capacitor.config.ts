import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tossortaste.app',
  appName: 'Toss or Taste',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#ffffff',
      showSpinner: true,
      spinnerColor: '#f97316'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#f97316'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    App: {
      launchUrl: 'com.tossortaste.app'
    }
  }
};

export default config; 