export default ({ config }) => {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  return {
    ...config,
    name: "Ágora",
    slug: "agora",
    version: "0.1.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "agora",
    userInterfaceStyle: "dark",
    backgroundColor: "#0A0A0A",
    ios: {
      bundleIdentifier: "com.agora.app",
      supportsTablet: false,
      icon: "./assets/images/icon.png",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "O Ágora precisa da sua localização para mostrar alertas próximos e calcular rotas seguras.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "O Ágora usa sua localização em segundo plano para enviar alertas de emergência SOS aos seus contatos.",
        NSCameraUsageDescription: "O Ágora precisa da câmera para registrar evidências fotográficas de ocorrências."
      },
      associatedDomains: ["applinks:agora.app"],
      config: googleMapsApiKey ? {
        googleMapsApiKey,
      } : undefined
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0A0A0A"
      },
      package: "com.agora.app",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA"
      ],
      intentFilters: [
        {
          action: "VIEW",
          data: [{ scheme: "agora", host: "convite" }],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ],
      config: googleMapsApiKey ? {
        googleMaps: {
          apiKey: googleMapsApiKey,
        }
      } : undefined
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Ágora to use your location."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "O Ágora precisa de acesso à câmera para você registrar evidências de riscos."
        }
      ],
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#0A0A0A",
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 180
        }
      ],
      "@react-native-community/datetimepicker"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    }
  };
};
