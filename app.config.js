import "dotenv/config";

export default {
  expo: {
    name: "Kablux",
    slug: "kablux-rider",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/rider-logo.png",
    scheme: "com.crashingout.kablux",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    notification: {
      color: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      },
      buildNumber: "7"
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: false,
      package: "com.crashingout.kablux",
      googleServicesFile: "./google-services.json",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        },
      },
      versionCode: 7
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      "expo-font",
      "@react-native-google-signin/google-signin",
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
      "expo-notifications"
    ],

    extra: {
      router: {},
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      wssUrl: process.env.EXPO_PUBLIC_WSS_URL,
      eas: {
        projectId: "5048eba6-0946-40cd-97fb-f146a2a47163",
      },
    },

    owner: "agbaby",
  },
};
