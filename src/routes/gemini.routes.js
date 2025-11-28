import { Router } from "express";
import {
  obtenerRecomendaciones,
  analizarContaminantes,
  recomendacionesRapidas
} from "../controllers/gemini.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Recomendaciones AI
 *     description: Recomendaciones inteligentes usando Gemini AI
 */

/**
 * @swagger
 * /api/recomendaciones:
 *   get:
 *     summary: Obtiene recomendaciones personalizadas usando Gemini AI
 *     tags: [Recomendaciones AI]
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la ciudad para análisis
 *     responses:
 *       200:
 *         description: Recomendaciones generadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 ciudad:
 *                   type: string
 *                 recomendaciones:
 *                   type: string
 *                 alertaSalud:
 *                   type: string
 */
router.get("/", obtenerRecomendaciones);

/**
 * @swagger
 * /api/recomendaciones/contaminantes:
 *   get:
 *     summary: Análisis detallado de contaminantes específicos
 *     tags: [Recomendaciones AI]
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Análisis de contaminantes completado
 */
router.get("/contaminantes", analizarContaminantes);

/**
 * @swagger
 * /api/recomendaciones/rapidas:
 *   get:
 *     summary: Recomendaciones rápidas para aplicaciones móviles
 *     tags: [Recomendaciones AI]
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recomendaciones rápidas generadas
 */
router.get("/rapidas", recomendacionesRapidas);

export default router;