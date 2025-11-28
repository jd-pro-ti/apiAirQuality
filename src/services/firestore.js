import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
  increment
} from "firebase/firestore";

// ============================================================
// 🔥 CONFIG FIREBASE
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDyN0hqY-Z_0urAxWwmnT1ajj27b3682HU",
  authDomain: "air-quality-48028.firebaseapp.com",
  databaseURL: "https://air-quality-48028-default-rtdb.firebaseio.com",
  projectId: "air-quality-48028",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ============================================================
// 📍 OBTENER CIUDAD POR GPS
// ============================================================
export const obtenerCiudadPorGPS = async (lat, lon) => {
  try {
    if (!lat || !lon) return "ubicacion_desconocida";

    const latN = Number(lat);
    const lonN = Number(lon);

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latN}&lon=${lonN}&format=json&accept-language=es`;

    const headers = {
      "User-Agent": "MiApp-CalidadAire/1.0",
      "Referer": "https://miapp.com",
    };

    let resp = await fetch(url, { headers });
    let data = await resp.json();

    if (data?.address) {
      const addr = data.address;
      const ciudad = addr.city || addr.town || addr.village || addr.hamlet || addr.county;
      if (ciudad) return normalizarCiudad(ciudad);
    }

    return "ubicacion_desconocida";
  } catch (err) {
    console.error("ERROR obteniendo ciudad:", err);
    return "ubicacion_desconocida";
  }
};

// Normalización
export const normalizarCiudad = (nombre) =>
  String(nombre)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

// ============================================================
// 🟢 GUARDAR MEDICIÓN (ESTRUCTURA OPTIMIZADA)
// ============================================================
export const guardarEnFirestore = async (datos) => {
  try {
    const gps = datos?.gps;
    let ciudad = "ubicacion_desconocida";

    if (gps?.latitud && gps?.longitud) {
      ciudad = await obtenerCiudadPorGPS(gps.latitud, gps.longitud);
    }

    ciudad = normalizarCiudad(ciudad);
    const timestamp = Timestamp.now();
    const fechaHora = new Date().toISOString().replace(/[:.]/g, '-');

    // 1. ACTUALIZAR DOCUMENTO DE CIUDAD (METADATOS)
    const ciudadRef = doc(db, "sensores", ciudad);
    await setDoc(ciudadRef, {
      nombre: ciudad,
      ultima_actualizacion: timestamp,
      total_mediciones: increment(1),
      ubicacion: {
        lat: gps?.latitud || null,
        lon: gps?.longitud || null
      }
    }, { merge: true });

    // 2. GUARDAR EN "ULTIMA_MEDICION" (ACCESO RÁPIDO)
    const ultimaMedicionRef = doc(db, "sensores", ciudad, "ultima_medicion", "current");
    await setDoc(ultimaMedicionRef, {
      ...datos,
      ciudad,
      timestamp,
      fecha_humana: new Date().toLocaleString("es-MX")
    });

    // 3. GUARDAR EN HISTORIAL (BACKUP Y ANÁLISIS)
    const historialRef = doc(db, "sensores", ciudad, "historial", fechaHora);
    await setDoc(historialRef, {
      ...datos,
      ciudad,
      timestamp,
      fecha_humana: new Date().toLocaleString("es-MX")
    });

    console.log(`📌 Guardado en: sensores/${ciudad}/ (última + historial)`);
    return { ciudad, timestamp: fechaHora };
  } catch (error) {
    console.error("❌ Error guardando en Firestore:", error);
    return null;
  }
};

// ============================================================
// 📍 BUSCAR MEDICIÓN POR GPS (OPTIMIZADO)
// ============================================================
export const buscarPorUbicacionFirestore = async (lat, lon) => {
  try {
    const latN = Number(lat);
    const lonN = Number(lon);

    // Obtener todas las ciudades
    const ciudadesSnap = await getDocs(collection(db, "sensores"));
    
    for (const ciudadDoc of ciudadesSnap.docs) {
      const ciudad = ciudadDoc.id;
      
      // Buscar en última medición de cada ciudad
      const ultimaRef = doc(db, "sensores", ciudad, "ultima_medicion", "current");
      const ultimaSnap = await getDoc(ultimaRef);
      
      if (ultimaSnap.exists()) {
        const datos = ultimaSnap.data();
        if (Number(datos.gps?.latitud) === latN && 
            Number(datos.gps?.longitud) === lonN) {
          return datos;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error buscando por GPS:", error);
    return null;
  }
};

// ============================================================
// 🔥 OBTENER ÚLTIMA MEDICIÓN DE CIUDAD (SUPER RÁPIDO)
// ============================================================
export const obtenerUltimaPorCiudadFirestore = async (ciudad) => {
  try {
    ciudad = normalizarCiudad(ciudad);
    console.log("🔍 Buscando última medición para:", ciudad);

    // Acceso directo y rápido a la última medición
    const ultimaRef = doc(db, "sensores", ciudad, "ultima_medicion", "current");
    const ultimaSnap = await getDoc(ultimaRef);

    if (!ultimaSnap.exists()) {
      console.log("❌ No hay mediciones para:", ciudad);
      return null;
    }

    console.log("✅ Última medición encontrada");
    return ultimaSnap.data();
  } catch (err) {
    console.error("💥 Error obteniendo última medición:", err);
    return null;
  }
};

// ============================================================
// 📊 OBTENER HISTORIAL DE CIUDAD (NUEVA FUNCIÓN)
// ============================================================
export const obtenerHistorialPorCiudad = async (ciudad, limite = 24) => {
  try {
    ciudad = normalizarCiudad(ciudad);
    
    const historialRef = collection(db, "sensores", ciudad, "historial");
    const q = query(historialRef, orderBy("timestamp", "desc"), limit(limite));
    const snap = await getDocs(q);
    
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("❌ Error obteniendo historial:", error);
    return [];
  }
};

// ============================================================
// 🏙️ OBTENER TODAS LAS CIUDADES DISPONIBLES (NUEVA FUNCIÓN)
// ============================================================
export const obtenerCiudadesDisponibles = async () => {
  try {
    const ciudadesSnap = await getDocs(collection(db, "sensores"));
    const ciudades = [];
    
    for (const doc of ciudadesSnap.docs) {
      const ciudadData = doc.data();
      ciudades.push({
        id: doc.id,
        nombre: ciudadData.nombre,
        ultima_actualizacion: ciudadData.ultima_actualizacion,
        total_mediciones: ciudadData.total_mediciones || 0
      });
    }
    
    return ciudades;
  } catch (error) {
    console.error("❌ Error obteniendo ciudades:", error);
    return [];
  }
};

// ============================================================
// 🗑️ LIMPIAR DATOS ANTIGUOS (FUNCIÓN UTILITARIA)
// ============================================================
export const limpiarDatosAntiguos = async (ciudad, diasARetener = 7) => {
  try {
    ciudad = normalizarCiudad(ciudad);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasARetener);
    
    const historialRef = collection(db, "sensores", ciudad, "historial");
    const snap = await getDocs(historialRef);
    
    let eliminados = 0;
    for (const doc of snap.docs) {
      const datos = doc.data();
      if (datos.timestamp && datos.timestamp.toDate() < fechaLimite) {
        // Aquí podrías agregar lógica para eliminar documentos antiguos
        // await deleteDoc(doc.ref);
        eliminados++;
      }
    }
    
    console.log(`🗑️ Marcados para eliminar: ${eliminados} registros antiguos de ${ciudad}`);
    return eliminados;
  } catch (error) {
    console.error("❌ Error limpiando datos:", error);
    return 0;
  }
};