// app.config.js
export default ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      usesCleartextTraffic: true,
    },
  };
};