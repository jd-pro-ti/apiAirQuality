import { Router } from "express";
import { obtenerEstacionesCercanas, compararConEstacionCercana,obtenerCiudadesMichoacan } from "../controllers/openaq.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OpenAQ
 *   description: Endpoints para consultar la API pública de OpenAQ
 */

/**
 * @swagger
 * /api/openaq/nearest:
 *   get:
 *     summary: Obtener estaciones cercanas de OpenAQ
 *     description: Retorna una lista de estaciones OpenAQ dentro de un radio específico.
 *     tags: [OpenAQ]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitud
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitud
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *           default: 150000
 *         description: Radio de búsqueda en metros (por defecto 150 km)
 *     responses:
 *       200:
 *         description: Lista de estaciones encontradas
 *       400:
 *         description: Parámetros inválidos
 */
router.get("/nearest", obtenerEstacionesCercanas);



/**
 * @swagger
 * /api/openaq/compare:
 *   get:
 *     summary: Comparar la ubicación con la estación más cercana
 *     description: Retorna la estación más cercana y sus mediciones principales.
 *     tags: [OpenAQ]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitud del usuario
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitud del usuario
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *           default: 150000
 *         description: Radio de búsqueda en metros (por defecto 150 km)
 *     responses:
 *       200:
 *         description: Estación comparada exitosamente
 *       400:
 *         description: Parámetros inválidos
 */
router.get("/compare", compararConEstacionCercana);
/**
 * @swagger
 * /api/openaq/michoacan:
 *   get:
 *     summary: Obtener datos de ciudades importantes de Michoacán
 *     description: Retorna estaciones y mediciones de Morelia, Uruapan, Zamora, Lázaro Cárdenas y Zitácuaro.
 *     tags: [OpenAQ]
 *     responses:
 *       200:
 *         description: Datos de ciudades consultadas
 */
router.get("/michoacan", obtenerCiudadesMichoacan);

export default router;
