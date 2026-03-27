import "dotenv/config";

export default {
  expo: {
    name: "Kablux",
    slug: "kablux-rider",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icons/rider-logo.png",
    scheme: "com.crashingout.kablux",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    notification: {
      color: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_IOS_API_KEY,
      },
      buildNumber: "4",
      bundleIdentifier: "com.kablux.kabluxrider",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Kablux uses your location to match you with nearby drivers, calculate accurate pickup points, and provide real-time ride tracking during your trip.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Kablux uses your location in the background to track your ride in progress, notify your driver of your position, and ensure accurate drop-off at your destination even when the app is minimized.",
        NSLocationAlwaysUsageDescription: "Kablux continuously accesses your location to track active rides, update your driver with your real-time position, and send you timely pickup and drop-off notifications.",
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icons/adaptive-icon.png",
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
      versionCode: 39
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
          image: "./assets/icons/adaptive-icon.png",
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