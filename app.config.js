export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      eas: {
        projectId: "7c018731-19d5-48d1-aeab-9eb3300399d3" // 👈 همونی که توی ارور بهمون داده
      }
    },
    updates: {
      url: "https://u.expo.dev/7c018731-19d5-48d1-aeab-9eb3300399d3",
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
      channel: "production"
    }
  };
};
