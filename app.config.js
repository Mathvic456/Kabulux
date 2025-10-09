import 'dotenv/config';

export default {
  expo: {
    name: 'Kabulux',
    slug: 'kablux',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/log.png',
    scheme: 'kabulux',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.hunchoexpo.kablux',
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        },
      },
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-web-browser',
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: {},
      eas: {
        projectId: '9d63958b-4d22-43ac-a469-796f1bb6470f',
      },
      // This makes it easy to access your key in JS code:
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },

    owner: 'hunchoexpo',
  },
};
