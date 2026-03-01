import "dotenv/config";

export default {
  expo: {
    name: "Kablux",
    slug: "kablux-rider",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/r-logo.png",
    scheme: "com.crashingout.kablux",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    notification: {
      color: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      },
      buildNumber: "34"
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
      versionCode: 33
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      [
        "expo-notifications",
        {
          sound: "./assets/sounds/kablux-sound.wav"
        },
      ],
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
        projectId: "cf905950-121d-4ddc-9d09-e4539b9fd7fb",
      },
    },

    owner: "agbaby02",
  },
};
