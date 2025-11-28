import { 
  generarPrediccionCompleta, 
  formatearPrediccionParaVisualizacion,
  analizarPatronesEstacionales 
} from "../services/prediction.js";
import { normalizarCiudad } from "../services/firestore.js";

// ============================================================
// 🎯 ENDPOINTS DE PREDICCIÓN
// ============================================================

/**
 * Obtener predicción completa en formato JSON
 */
export const obtenerPrediccion = async (req, res) => {
  try {
    const { ciudad, dias = "7", formato = "json" } = req.query;

    if (!ciudad) {
      return res.status(400).json({ 
        ok: false, 
        msg: "Se requiere parámetro ciudad" 
      });
    }

    const prediccion = await generarPrediccionCompleta(ciudad, parseInt(dias));

    if (formato === "texto") {
      const textoFormateado = formatearPrediccionParaVisualizacion(prediccion);
      return res.type('text/plain').send(textoFormateado);
    }

    res.json({
      ok: true,
      ciudad: normalizarCiudad(ciudad),
      prediccion,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error en predicción:", error);
    res.status(500).json({ 
      ok: false, 
      msg: "Error generando predicción",
      error: error.message 
    });
  }
};

/**
 * Obtener análisis de patrones históricos
 */
export const obtenerAnalisisPatrones = async (req, res) => {
  try {
    const { ciudad, meses = "3" } = req.query;

    if (!ciudad) {
      return res.status(400).json({ 
        ok: false, 
        msg: "Se requiere parámetro ciudad" 
      });
    }

    const analisis = await analizarPatronesEstacionales(ciudad, parseInt(meses));

    res.json({
      ok: true,
      ciudad: normalizarCiudad(ciudad),
      analisis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error en análisis:", error);
    res.status(500).json({ 
      ok: false, 
      msg: "Error analizando patrones" 
    });
  }
};

/**
 * Predicción rápida para dashboard
 */
export const obtenerPrediccionRapida = async (req, res) => {
  try {
    const { ciudad } = req.query;

    if (!ciudad) {
      return res.status(400).json({ 
        ok: false, 
        msg: "Se requiere parámetro ciudad" 
      });
    }

    const prediccion = await generarPrediccionCompleta(ciudad, 3); // Solo 3 días para rapidez

    // Formato simplificado para dashboards
    const respuestaSimplificada = {
      ciudad: normalizarCiudad(ciudad),
      calidadActual: prediccion.prediccionHoraria[0]?.categoria || "Desconocida",
      pm25Actual: prediccion.prediccionHoraria[0]?.pm25 || 0,
      tendencia: prediccion.tendenciaSemanal[0]?.tendencia || "→",
      proximasHoras: prediccion.prediccionHoraria.slice(0, 4),
      confianza: prediccion.confianza
    };

    res.json({
      ok: true,
      ...respuestaSimplificada,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error en predicción rápida:", error);
    res.status(500).json({ 
      ok: false, 
      msg: "Error en predicción rápida" 
    });
  }
};