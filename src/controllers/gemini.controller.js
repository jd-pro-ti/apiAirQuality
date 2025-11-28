import {
  generarRecomendacionesGemini,
  analizarContaminantesGemini,
  generarAlertaSaludGemini,
  generarResumenEjecutivo
} from "../services/gemini.js";
import { obtenerUltimaPorCiudadFirestore } from "../services/firestore.js";
import { normalizarCiudad } from "../services/firestore.js";

// ============================================================
// 🧠 ENDPOINTS DE RECOMENDACIONES CON GEMINI
// ============================================================

/**
 * Obtener recomendaciones completas para una ciudad
 */
export const obtenerRecomendaciones = async (req, res) => {
  try {
    const { ciudad } = req.query;

    if (!ciudad) {
      return res.status(400).json({
        ok: false,
        msg: "Se requiere parámetro ciudad"
      });
    }

    // 1. Obtener datos actuales de la ciudad
    const datosActuales = await obtenerUltimaPorCiudadFirestore(ciudad);
    
    if (!datosActuales) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontraron datos para ${ciudad}`
      });
    }

    // 2. Preparar datos para Gemini
    const datosParaGemini = {
      ciudad: normalizarCiudad(ciudad),
      calidadActual: datosActuales.calidad || 'Moderada',
      pm25: datosActuales.pm25 || 25,
      prediccionHoras: "Estable en próximas horas",
      tendencia: "→",
      contaminantes: {
        pm25: datosActuales.pm25,
        pm10: datosActuales.pm10,
        temperatura: datosActuales.temperatura,
        humedad: datosActuales.humedad
        // Agrega más contaminantes según tus datos
      }
    };

    // 3. Generar recomendaciones con Gemini
    const recomendaciones = await generarRecomendacionesGemini(datosParaGemini);
    
    // 4. Generar alerta de salud
    const alertaSalud = await generarAlertaSaludGemini({
      pm25: datosActuales.pm25,
      calidad: datosActuales.calidad,
      gruposSensibles: ['Niños', 'Adultos mayores', 'Personas con asma']
    });

    // 5. Generar resumen ejecutivo
    const resumen = await generarResumenEjecutivo(datosParaGemini);

    res.json({
      ok: true,
      ciudad: normalizarCiudad(ciudad),
      datosActuales: {
        pm25: datosActuales.pm25,
        calidad: datosActuales.calidad,
        timestamp: datosActuales.timestamp
      },
      recomendaciones: recomendaciones.recomendaciones,
      alertaSalud: alertaSalud.alerta,
      nivelRiesgo: alertaSalud.nivelRiesgo,
      resumenEjecutivo: resumen,
      metadata: {
        modelo: recomendaciones.modelo,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error en recomendaciones:", error);
    res.status(500).json({
      ok: false,
      msg: "Error generando recomendaciones",
      error: error.message
    });
  }
};

/**
 * Análisis detallado de contaminantes
 */
export const analizarContaminantes = async (req, res) => {
  try {
    const { ciudad } = req.query;

    if (!ciudad) {
      return res.status(400).json({
        ok: false,
        msg: "Se requiere parámetro ciudad"
      });
    }

    const datosActuales = await obtenerUltimaPorCiudadFirestore(ciudad);
    
    if (!datosActuales) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontraron datos para ${ciudad}`
      });
    }

    const contaminantes = {
      PM2_5: `${datosActuales.pm25} μg/m³`,
      PM10: datosActuales.pm10 ? `${datosActuales.pm10} μg/m³` : 'No medido',
      Temperatura: datosActuales.temperatura ? `${datosActuales.temperatura}°C` : 'No medido',
      Humedad: datosActuales.humedad ? `${datosActuales.humedad}%` : 'No medido'
    };

    const analisis = await analizarContaminantesGemini(contaminantes);

    res.json({
      ok: true,
      ciudad: normalizarCiudad(ciudad),
      contaminantes,
      analisis: analisis.analisis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error analizando contaminantes:", error);
    res.status(500).json({
      ok: false,
      msg: "Error en análisis de contaminantes"
    });
  }
};

/**
 * Recomendaciones rápidas para móviles
 */
export const recomendacionesRapidas = async (req, res) => {
  try {
    const { ciudad } = req.query;

    if (!ciudad) {
      return res.status(400).json({
        ok: false,
        msg: "Se requiere parámetro ciudad"
      });
    }

    const datosActuales = await obtenerUltimaPorCiudadFirestore(ciudad);
    
    if (!datosActuales) {
      return res.status(404).json({
        ok: false,
        msg: `No se encontraron datos para ${ciudad}`
      });
    }

    const datosParaGemini = {
      ciudad: normalizarCiudad(ciudad),
      calidadActual: datosActuales.calidad || 'Moderada',
      pm25: datosActuales.pm25 || 25
    };

    const [recomendaciones, alerta] = await Promise.all([
      generarRecomendacionesGemini(datosParaGemini),
      generarAlertaSaludGemini({
        pm25: datosActuales.pm25,
        calidad: datosActuales.calidad
      })
    ]);

    // Formato simplificado para móviles
    const respuestaRapida = {
      ciudad: normalizarCiudad(ciudad),
      calidad: datosActuales.calidad,
      pm25: datosActuales.pm25,
      nivelRiesgo: alerta.nivelRiesgo,
      recomendacionPrincipal: extraerRecomendacionPrincipal(recomendaciones.recomendaciones),
      alerta: alerta.alerta.substring(0, 150) + '...' // Resumir
    };

    res.json({
      ok: true,
      ...respuestaRapida,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error en recomendaciones rápidas:", error);
    res.status(500).json({
      ok: false,
      msg: "Error generando recomendaciones rápidas"
    });
  }
};

// Función auxiliar para extraer recomendación principal
const extraerRecomendacionPrincipal = (textoRecomendaciones) => {
  const lineas = textoRecomendaciones.split('\n');
  const actividadLinea = lineas.find(linea => 
    linea.includes('✅') || linea.includes('RECOMENDADAS') || 
    (linea.includes('-') && !linea.includes('⚠️'))
  );
  
  return actividadLinea ? actividadLinea.replace('- ', '').trim() : 
    "Condiciones normales para actividades al aire libre";
};