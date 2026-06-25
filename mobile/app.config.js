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
        "CAMERA",
        "RECEIVE_BOOT_COMPLETED"  // Necessário para expo-notifications
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
      "@react-native-community/datetimepicker",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#FF1744",
          "defaultChannel": "alerts",
          "sounds": ["default"]
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      // ⚠️  Substitua pelo ID real do seu projeto EAS.
      // Encontre em: https://expo.dev/accounts/[usuário]/projects/agora
      // Ou rode: npx eas project:info
      // Sem este ID, push notifications remotas não funcionam.
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'SEU-PROJECT-ID-AQUI'
      }
    }
  };
};
