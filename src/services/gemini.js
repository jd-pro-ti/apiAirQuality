import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================
// 🔑 CONFIGURACIÓN GEMINI AI - PLAN GRATUITO
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// ============================================================
// 🎯 MODELO OPTIMIZADO - GEMINI 1.5 FLASH (GRATIS)
// ============================================================
const MODEL_CONFIG = {
  default: "gemini-1.5-flash",  // ✅ 1,000 consultas GRATIS por día
  maxTokens: 500,               // ✅ Optimizado para reducir costos
  temperature: 0.7              // ✅ Balance entre creatividad y consistencia
};

// ============================================================
// 📊 CONTROL DE USO GRATUITO
// ============================================================

let contadorConsultas = {
  hoy: 0,
  fecha: new Date().toDateString(),
  maxDiario: 1000  // Límite gratis de Gemini
};

const actualizarContador = () => {
  const hoy = new Date().toDateString();
  if (contadorConsultas.fecha !== hoy) {
    // Reiniciar contador al nuevo día
    contadorConsultas = {
      hoy: 0,
      fecha: hoy,
      maxDiario: 1000
    };
  }
};

const puedeUsarGemini = () => {
  actualizarContador();
  return contadorConsultas.hoy < contadorConsultas.maxDiario;
};

const registrarConsulta = () => {
  contadorConsultas.hoy++;
};

// ============================================================
// 🎯 RECOMENDACIONES PREDEFINIDAS (RESPALDO DE ALTA CALIDAD)
// ============================================================

const RECOMENDACIONES_PREDEFINIDAS = {
  Buena: `
## 🎯 CALIDAD DEL AIRE - BUENA 🌤️

### ✅ ACTIVIDADES RECOMENDADAS:
• **Ejercicio intensivo** - Ideal para correr, ciclismo o deportes al aire libre
• **Actividades familiares** - Paseos en parque, picnic y juegos exteriores
• **Ventilación natural** - Abre ventanas para renovar aire interior

### 🏥 GRUPOS SENSIBLES:
• **Todos los grupos** pueden realizar actividades normales sin restricciones
• **Personas con asma** - Condiciones ideales, llevar inhalador de prevención

### 🌅 HORARIOS SUGERIDOS:
• **Mejor horario**: 6:00 AM - 7:00 PM (todo el día favorable)
• **Actividades**: Sin limitaciones de horario

### 💡 CONSEJOS PRÁCTICOS:
• Aprovecha para secar ropa al aire libre
• Ideal para limpieza profunda y ventilación de hogar
• Perfecto para eventos deportivos al aire libre
  `,

  Moderada: `
## 🎯 CALIDAD DEL AIRE - MODERADA ⚠️

### ✅ ACTIVIDADES RECOMENDADAS:
• **Ejercicio moderado** - Caminatas, yoga suave o estiramientos
• **Actividades recreativas** - Juegos tranquilos en exteriores
• **Paseos cortos** - Máximo 1-2 horas continuas al aire libre

### ⚠️ ACTIVIDADES A LIMITAR:
• **Ejercicio intenso prolongado** - Puede causar irritación respiratoria
• **Actividades cerca de tráfico** - Evitar vías muy congestionadas

### 🏥 GRUPOS SENSIBLES:
• **Personas con asma** - Llevar inhalador de rescate
• **Adultos mayores** - Limitar esfuerzos intensos
• **Niños** - Supervisar actividad física continua

### 🌅 HORARIOS IDEALES:
• **Mejor horario**: 6:00-10:00 AM (menor contaminación)
• **Evitar**: 2:00-6:00 PM (hora pico de contaminación)

### 💡 CONSEJOS PRÁCTICOS:
• Cierra ventanas en horas pico de tráfico
• Usa mascarilla en transporte público muy lleno
• Hidrátate bien durante actividades físicas
  `,

  Pobre: `
## 🎯 CALIDAD DEL AIRE - POBRE 🚨

### ✅ ACTIVIDADES RECOMENDADAS:
• **Ejercicio en interiores** - Gimnasio, yoga en casa, centros comerciales
• **Actividades en espacios cerrados** - Cines, bibliotecas, centros comerciales
• **Reuniones indoor** - Preferir lugares con aire acondicionado

### ⚠️ ACTIVIDADES A EVITAR:
• **Ejercicio al aire libre** - Alto riesgo de irritación respiratoria
• **Actividades prolongadas en exteriores** - Limitar a menos de 30 minutos
• **Deportes intensivos** - Posible afectación cardiovascular

### 🏥 GRUPOS SENSIBLES:
• **Personas con enfermedades respiratorias** - Evitar salir innecesariamente
• **Adultos mayores** - Limitar tiempo exterior a lo esencial
• **Niños** - Actividades preferentemente en interiores
• **Embarazadas** - Consultar con médico para actividades específicas

### 🌅 HORARIOS SUGERIDOS:
• **Si debe salir**: 10:00-11:00 AM (menor concentración)
• **Evitar**: Todo el día en exteriores

### 💡 CONSEJOS PRÁCTICOS:
• Usa purificador de aire en casa si es posible
• Cierra bien ventanas y puertas
• Considera mascarilla N95 si debes estar en exteriores
• Hidrátate constantemente
• Dúchate al llegar a casa para remover partículas
  `,

  Desconocida: `
## 🎯 CALIDAD DEL AIRE - NO DISPONIBLE 🔍

### ⚠️ RECOMENDACIONES GENERALES:
• **Actúe con precaución** - No hay datos actuales disponibles
• **Siga recomendaciones locales** de autoridades de salud
• **Observe condiciones visibles** - Si hay neblina o humo, limite actividades

### 💡 CONSEJOS DE SEGURIDAD:
• Comience con actividades moderadas y evalúe comodidad respiratoria
• Si experimenta tos, irritación ocular o dificultad respiratoria, limite actividades
• Consulte fuentes oficiales para actualizaciones de calidad del aire

### 🏥 GRUPOS SENSIBLES:
• **Extrema precaución** hasta que se disponga de datos confiables
• **Limite actividades no esenciales** en exteriores
  `
};

// ============================================================
// 🛠️ FUNCIONES AUXILIARES
// ============================================================

/**
 * Formatea los datos de contaminantes para el prompt
 */
const formatearContaminantes = (contaminantes) => {
  if (!contaminantes || Object.keys(contaminantes).length === 0) {
    return "PM2.5: Datos principales disponibles\nOtros contaminantes: No medidos específicamente";
  }
  
  return Object.entries(contaminantes)
    .map(([contaminante, valor]) => {
      const unidad = obtenerUnidadContaminante(contaminante);
      return `- ${contaminante}: ${valor} ${unidad}`;
    })
    .join('\n');
};

/**
 * Obtiene la unidad de medida para cada contaminante
 */
const obtenerUnidadContaminante = (contaminante) => {
  const unidades = {
    'pm25': 'μg/m³',
    'pm10': 'μg/m³',
    'no2': 'ppb',
    'so2': 'ppb',
    'o3': 'ppb',
    'co': 'ppm',
    'co2': 'ppm',
    'temperatura': '°C',
    'humedad': '%'
  };
  
  return unidades[contaminante.toLowerCase()] || 'unidades';
};

/**
 * Determina nivel de riesgo basado en PM2.5
 */
const determinarNivelRiesgo = (pm25) => {
  if (!pm25) return 'Desconocido';
  
  if (pm25 <= 12) return 'Bajo';
  if (pm25 <= 35) return 'Moderado';
  if (pm25 <= 55) return 'Alto';
  return 'Muy Alto';
};

/**
 * Obtiene recomendaciones predefinidas basadas en calidad
 */
const obtenerRecomendacionesPredefinidas = (calidad, ciudad) => {
  const recomendacionBase = RECOMENDACIONES_PREDEFINIDAS[calidad] || RECOMENDACIONES_PREDEFINIDAS.Moderada;
  return recomendacionBase.replace(/🎯 RECOMENDACIONES PARA/g, `🎯 RECOMENDACIONES PARA ${ciudad.toUpperCase()}`);
};

// ============================================================
// 🧠 FUNCIONES PRINCIPALES DE GEMINI (OPTIMIZADAS)
// ============================================================

/**
 * Genera recomendaciones personalizadas con Gemini 1.5 Flash (GRATIS)
 */
export const generarRecomendacionesGemini = async (datosCiudad) => {
  try {
    // Verificar si podemos usar Gemini (límite gratis)
    if (!genAI || !puedeUsarGemini()) {
      console.log("🔸 Usando recomendaciones predefinidas (Gemini no disponible o límite alcanzado)");
      const calidad = datosCiudad.calidadActual || 'Moderada';
      return {
        recomendaciones: obtenerRecomendacionesPredefinidas(calidad, datosCiudad.ciudad),
        timestamp: new Date().toISOString(),
        modelo: "predefinido",
        fuente: "sistema",
        consultasHoy: contadorConsultas.hoy,
        limiteDiario: contadorConsultas.maxDiario
      };
    }

    // ✅ USAR GEMINI 1.5 FLASH (GRATIS)
    const model = genAI.getGenerativeModel({ 
      model: MODEL_CONFIG.default,
      generationConfig: {
        temperature: MODEL_CONFIG.temperature,
        maxOutputTokens: MODEL_CONFIG.maxTokens,
        topP: 0.8,
        topK: 40
      }
    });
    
    const prompt = `
Eres un especialista en calidad del aire. Genera recomendaciones PRÁCTICAS basadas en:

CIUDAD: ${datosCiudad.ciudad}
CALIDAD: ${datosCiudad.calidadActual} (PM2.5: ${datosCiudad.pm25} μg/m³)
TENDENCIA: ${datosCiudad.tendencia}

Formato requerido:
## 🎯 RECOMENDACIONES PARA ${datosCiudad.ciudad}

### ✅ ACTIVIDADES RECOMENDADAS:
• [Actividad 1] - [Breve razón]
• [Actividad 2] - [Breve razón]

### ⚠️ PRECAUCIONES:
• [Precaución 1] - [Razón específica]

### 🏥 GRUPOS SENSIBLES:
• [Grupo] - [Recomendación]

### 🌅 HORARIOS:
• Mejor: [horario] - [razón]

### 💡 CONSEJOS:
• [Consejo práctico 1]
• [Consejo práctico 2]

Máximo 400 palabras. Tono alentador pero realista.
    `;

    console.log(`🧠 Consultando Gemini... (${contadorConsultas.hoy + 1}/${contadorConsultas.maxDiario})`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Registrar la consulta exitosa
    registrarConsulta();
    
    console.log("✅ Gemini respondió exitosamente");
    
    return {
      recomendaciones: text,
      timestamp: new Date().toISOString(),
      modelo: MODEL_CONFIG.default,
      fuente: "gemini-ai",
      consultasHoy: contadorConsultas.hoy,
      limiteDiario: contadorConsultas.maxDiario,
      costo: "GRATIS (plan diario)"
    };
    
  } catch (error) {
    console.error('❌ Error con Gemini AI:', error.message);
    // Fallback a recomendaciones predefinidas
    const calidad = datosCiudad.calidadActual || 'Moderada';
    return {
      recomendaciones: obtenerRecomendacionesPredefinidas(calidad, datosCiudad.ciudad),
      timestamp: new Date().toISOString(),
      modelo: "predefinido (fallback)",
      fuente: "sistema",
      consultasHoy: contadorConsultas.hoy,
      limiteDiario: contadorConsultas.maxDiario,
      error: error.message
    };
  }
};

/**
 * Analiza contaminantes específicos
 */
export const analizarContaminantesGemini = async (contaminantes) => {
  try {
    if (!genAI || !puedeUsarGemini()) {
      return {
        analisis: "🔍 Análisis no disponible. Límite diario alcanzado o Gemini no configurado.",
        timestamp: new Date().toISOString(),
        fuente: "sistema"
      };
    }

    const model = genAI.getGenerativeModel({ 
      model: MODEL_CONFIG.default,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300,
      }
    });
    
    const prompt = `
Analiza brevemente estos contaminantes:

${formatearContaminantes(contaminantes)}

En máximo 150 palabras total:
1. Fuentes principales
2. Efectos en salud
3. Cómo reducir exposición
    `;

    registrarConsulta();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      analisis: response.text(),
      timestamp: new Date().toISOString(),
      fuente: "gemini-ai",
      costo: "GRATIS"
    };
    
  } catch (error) {
    console.error('❌ Error analizando contaminantes:', error);
    return {
      analisis: "⚠️ Análisis no disponible temporalmente.",
      timestamp: new Date().toISOString(),
      fuente: "sistema"
    };
  }
};

/**
 * Genera alertas de salud personalizadas
 */
export const generarAlertaSaludGemini = async (datosSalud) => {
  try {
    if (!genAI || !puedeUsarGemini()) {
      return {
        alerta: "🔔 Sistema de alertas no disponible. Límite diario alcanzado.",
        nivelRiesgo: determinarNivelRiesgo(datosSalud.pm25),
        timestamp: new Date().toISOString(),
        fuente: "sistema"
      };
    }

    const model = genAI.getGenerativeModel({ 
      model: MODEL_CONFIG.default,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 200,
      }
    });
    
    const prompt = `
Evalúa riesgo salud con:
- PM2.5: ${datosSalud.pm25} μg/m³
- Calidad: ${datosSalud.calidad}

Genera alerta breve con:
- Nivel riesgo
- Síntomas a observar
- Medidas preventivas

Máximo 150 palabras.
    `;

    registrarConsulta();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      alerta: response.text(),
      nivelRiesgo: determinarNivelRiesgo(datosSalud.pm25),
      timestamp: new Date().toISOString(),
      fuente: "gemini-ai",
      costo: "GRATIS"
    };
    
  } catch (error) {
    console.error('❌ Error generando alerta:', error);
    return {
      alerta: "⚠️ Alertas no disponibles temporalmente.",
      nivelRiesgo: determinarNivelRiesgo(datosSalud.pm25),
      timestamp: new Date().toISOString(),
      fuente: "sistema"
    };
  }
};

/**
 * Genera resumen ejecutivo con Gemini
 */
export const generarResumenEjecutivo = async (datosCompletos) => {
  try {
    if (!genAI || !puedeUsarGemini()) {
      return "📊 Resumen no disponible. Límite diario de consultas alcanzado.";
    }

    const model = genAI.getGenerativeModel({ 
      model: MODEL_CONFIG.default,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 150,
      }
    });
    
    const prompt = `
Resumen ejecutivo BREVE (100 palabras) sobre:

CIUDAD: ${datosCompletos.ciudad}
CALIDAD: ${datosCompletos.calidadActual}
PM2.5: ${datosCompletos.pm25} μg/m³

Incluye:
- Situación actual
- Expectativas del día
- Mensaje clave población

Tono informativo.
    `;

    registrarConsulta();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
    
  } catch (error) {
    console.error('❌ Error generando resumen:', error);
    return "📋 Resumen no disponible. Condiciones permiten actividades normales con precaución.";
  }
};

/**
 * Obtiene estadísticas de uso
 */
export const obtenerEstadisticasUso = () => {
  actualizarContador();
  return {
    consultasHoy: contadorConsultas.hoy,
    limiteDiario: contadorConsultas.maxDiario,
    consultasRestantes: contadorConsultas.maxDiario - contadorConsultas.hoy,
    fecha: contadorConsultas.fecha,
    costo: "GRATIS (Gemini 1.5 Flash)",
    estado: contadorConsultas.hoy < contadorConsultas.maxDiario ? "DISPONIBLE" : "LÍMITE ALCANZADO"
  };
};