import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// ============================
// CONFIGURACIÓN FIREBASE
// ============================
const firebaseConfig = {
  apiKey: "AIzaSyDyN0hqY-Z_0urAxWwmnT1ajj27b3682HU",
  authDomain: "air-quality-48028.firebaseapp.com",
  databaseURL: "https://air-quality-48028-default-rtdb.firebaseio.com",
  projectId: "air-quality-48028",
};

// Inicializar Firebase una sola vez
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ============================
// FUNCIÓN GENERAL PARA OBTENER CUALQUIER SENSOR
// ============================
export const obtenerDatosSensor = async (sensorId = "sensor1") => {
  try {
    const sensorRef = ref(db, `sensores/${sensorId}/datos`);
    const snapshot = await get(sensorRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return { mensaje: `No hay datos en ${sensorId}` };

  } catch (error) {
    console.error("❌ Error al leer Firebase:", error);
    throw new Error("Error obteniendo datos del sensor");
  }
};

// ============================
// FUNCIÓN ORIGINAL (compatibilidad)
// ============================
export const obtenerUltimosDatosFirebase = async () => {
  return obtenerDatosSensor("sensor1");
};
