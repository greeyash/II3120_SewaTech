// Konfigurasi dinamis di atas app.json.
// EXPO_BASE_URL dipakai saat build untuk GitHub Pages (situs ada di sub-path /II3120_SewaTech).
// Saat development lokal variabel ini kosong, jadi aplikasi tetap jalan di root.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
