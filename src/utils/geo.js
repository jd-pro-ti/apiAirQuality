// Haversine: devuelve distancia en metros
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // radio tierra en m
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const pickBestParameter = (measurements, parameter) => {
  if (!measurements || !Array.isArray(measurements)) return null;
  const item = measurements.find((m) => m.parameter === parameter);
  return item || null;
};
