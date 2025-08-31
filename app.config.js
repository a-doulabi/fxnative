export default ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      metaData: {
        // رشته ساده به جای JSON
        "expo-channel-name": "production"
      }
    }
  };
};
