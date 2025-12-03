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
      package: "com.crashingout.kablux",
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
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: {},
      eas: {
        projectId: "4781a8b8-1544-4b29-8400-9e0565a2e78f",
      },
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      googleAuthClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      wssUrl: process.env.EXPO_PUBLIC_WSS_URL,
    },

    owner: "crashingout",
  },
};
