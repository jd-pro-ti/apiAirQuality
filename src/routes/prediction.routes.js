import { Router } from "express";
import {
  obtenerPrediccion,
  obtenerAnalisisPatrones,
  obtenerPrediccionRapida
} from "../controllers/prediction.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Predicción
 *     description: Algoritmos de predicción de calidad del aire
 */

/**
 * @swagger
 * /api/prediccion:
 *   get:
 *     summary: Obtiene predicción de calidad del aire para una ciudad
 *     tags: [Predicción]
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la ciudad
 *       - in: query
 *         name: dias
 *         required: false
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Días de histórico a considerar
 *       - in: query
 *         name: formato
 *         required: false
 *         schema:
 *           type: string
 *           enum: [json, texto]
 *           default: json
 *         description: Formato de respuesta
 *     responses:
 *       200:
 *         description: Predicción generada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 ciudad:
 *                   type: string
 *                 prediccion:
 *                   type: object
 */
router.get("/", obtenerPrediccion);

/**
 * @swagger
 * /api/prediccion/patrones:
 *   get:
 *     summary: Analiza patrones históricos de contaminación
 *     tags: [Predicción]
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: meses
 *         required: false
 *         schema:
 *           type: integer
 *           default: 3
 *     responses:
 *       200:
 *         description: Análisis de patrones completado
 */
router.get("/patrones", obtenerAnalisisPatrones);

/**
 * @swagger
 * /api/prediccion/rapida:
 *   get:
 *     summary: Predicción rápida para dashboards
 *     tags: [Predicción]
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Predicción rápida generada
 */
router.get("/rapida", obtenerPrediccionRapida);

export default router;