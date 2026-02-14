import "dotenv/config";

export default {
  expo: {
    name: "Kablux",
    slug: "kablux-rider",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/log.png",
    scheme: "kabulux",
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
      buildNumber: "7"
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
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
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN,
          RNMapboxMapsVersion: "11.0.0"
        }
      ]
    ],

    extra: {
      router: {},
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      wssUrl: process.env.EXPO_PUBLIC_WSS_URL,
      eas: {
        projectId: "6d795b25-3717-4acc-a71d-91d3afb6ac76",
      },
    },

    owner: "ag0213m02",
  },
};
