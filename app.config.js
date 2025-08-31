export default {
  expo: {
    name: "Filmonix",
    slug: "filmonix",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "filmonix",
    userInterfaceStyle: "automatic",
    runtimeVersion: {
      policy: "appVersion"
    },
    updates: {
      url: "https://u.expo.dev/7c018731-19d5-48d1-aeab-9eb3300399d3", // 👈 projectId از expo.dev
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
      channel: "production" // 👈 کانالی که بیلد بهش وصله
    },
    android: {
      package: "fxman.filmonix"
    },
    ios: {
      bundleIdentifier: "fxman.filmonix"
    }
  }
};
