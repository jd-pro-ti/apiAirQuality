import { obtenerUltimosDatosFirebase } from "../services/firebaseRealtime.js";
import {
  guardarEnFirestore,
  buscarPorUbicacionFirestore,
  obtenerUltimaPorCiudadFirestore,
  obtenerHistorialPorCiudad,
  obtenerCiudadesDisponibles,
  normalizarCiudad
} from "../services/firestore.js";

let intervaloActivo = false;

// ============================================================
// 🟢 OBTENER ÚLTIMA MEDICIÓN + GUARDADO AUTOMÁTICO
// ============================================================
export const obtenerUltima = async (req, res) => {
  try {
    const datos = await obtenerUltimosDatosFirebase();

    // Activar guardado automático si no está activo
    if (!intervaloActivo) {
      intervaloActivo = true;
      
      // Guardar inmediatamente la primera medición
      await guardarEnFirestore(datos);
      
      // Configurar intervalo para guardados futuros
      setInterval(async () => {
        try {
          const nuevosDatos = await obtenerUltimosDatosFirebase();
          await guardarEnFirestore(nuevosDatos);
          console.log("🔄 Medición automática guardada");
        } catch (error) {
          console.error("❌ Error en guardado automático:", error);
        }
      }, 10000); // Cada 10 segundos
    }

    res.json({ 
      ok: true, 
      datos,
      mensaje: intervaloActivo ? "Medición obtenida + guardado automático ACTIVADO" : "Medición obtenida"
    });
  } catch (error) {
    console.error("❌ Error en obtenerUltima:", error);
    res.status(500).json({ ok: false, msg: "Error obteniendo datos" });
  }
};

// ============================================================
// 🟦 BUSCAR POR GPS
// ============================================================
export const obtenerPorUbicacion = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ 
        ok: false, 
        msg: "Se requieren parámetros lat y lon" 
      });
    }

    const datos = await buscarPorUbicacionFirestore(lat, lon);

    if (!datos) {
      return res.status(404).json({ 
        ok: false, 
        msg: "No se encontraron mediciones en esa ubicación" 
      });
    }

    res.json({ ok: true, datos });
  } catch (error) {
    console.error("❌ Error en obtenerPorUbicacion:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

// ============================================================
// 🟣 OBTENER ÚLTIMA MEDICIÓN POR CIUDAD
// ============================================================
export const obtenerPorCiudad = async (req, res) => {
  try {
    const { ciudad } = req.query;

    if (!ciudad) {
      return res.status(400).json({ 
        ok: false, 
        msg: "Se requiere parámetro ciudad" 
      });
    }

    const datos = await obtenerUltimaPorCiudadFirestore(ciudad);

    if (!datos) {
      return res.status(404).json({
        ok: false,
        msg: `No existen lecturas para la ciudad: ${ciudad}`
      });
    }

    res.json({
      ok: true,
      ciudad: normalizarCiudad(ciudad),
      datos,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Error en obtenerPorCiudad:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

// ============================================================
// 📊 OBTENER HISTORIAL DE CIUDAD (NUEVO ENDPOINT)
// ============================================================
export const obtenerHistorial = async (req, res) => {
  try {
    const { ciudad, limite = "24" } = req.query;

    if (!ciudad) {
      return res.status(400).json({ 
        ok: false, 
        msg: "Se requiere parámetro ciudad" 
      });
    }

    const historial = await obtenerHistorialPorCiudad(ciudad, parseInt(limite));

    res.json({
      ok: true,
      ciudad: normalizarCiudad(ciudad),
      total_registros: historial.length,
      historial
    });
  } catch (error) {
    console.error("❌ Error en obtenerHistorial:", error);
    res.status(500).json({ ok: false, msg: "Error obteniendo historial" });
  }
};

// ============================================================
// 🏙️ OBTENER CIUDADES DISPONIBLES (NUEVO ENDPOINT)
// ============================================================
export const obtenerCiudades = async (req, res) => {
  try {
    const ciudades = await obtenerCiudadesDisponibles();

    res.json({
      ok: true,
      total_ciudades: ciudades.length,
      ciudades
    });
  } catch (error) {
    console.error("❌ Error en obtenerCiudades:", error);
    res.status(500).json({ ok: false, msg: "Error obteniendo ciudades" });
  }
};

// ============================================================
// 🔧 ESTADO DEL SISTEMA (NUEVO ENDPOINT)
// ============================================================
export const obtenerEstado = async (req, res) => {
  try {
    const datos = await obtenerUltimosDatosFirebase();
    
    res.json({
      ok: true,
      sistema: "Operativo",
      guardado_automatico: intervaloActivo ? "ACTIVADO" : "INACTIVO",
      ultima_lectura: datos,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Error en obtenerEstado:", error);
    res.status(500).json({ 
      ok: false, 
      sistema: "Con errores",
      error: error.message 
    });
  }
};