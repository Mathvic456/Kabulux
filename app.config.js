import "dotenv/config";

export default {
  expo: {
    name: "Kablux",
    slug: "kablux",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/log.png",
    scheme: "kabulux",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.hunchoexpo.kablux",
      googleServicesFile: "./google-services.json",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        },
      },
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-web-browser",
      "expo-notifications",
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
    ],

    extra: {
      router: {},
      eas: {
        projectId: "9d63958b-4d22-43ac-a469-796f1bb6470f",
      },
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      wssUrl: process.env.EXPO_PUBLIC_WSS_URL,
    },

    owner: "hunchoexpo",
  },
};
