import { Router } from "express";
import {
  obtenerUltima,
  obtenerPorUbicacion,
  obtenerPorCiudad,
  obtenerHistorial,
  obtenerCiudades,
  obtenerEstado
} from "../controllers/sensores.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Sensores
 *     description: Endpoints para gestionar mediciones del sistema de calidad del aire
 *   - name: Historial
 *     description: Endpoints para obtener datos históricos
 *   - name: Ciudades
 *     description: Endpoints para gestión de ciudades
 */

/**
 * @swagger
 * /api/sensores/ultima:
 *   get:
 *     summary: Obtiene la última lectura y activa guardado automático
 *     description: |
 *       - Obtiene la medición más reciente desde Firebase Realtime Database
 *       - Activa el guardado automático cada 10 segundos (solo en primera ejecución)
 *       - Las mediciones se guardan en estructura optimizada en Firestore
 *     tags: [Sensores]
 *     responses:
 *       200:
 *         description: Última medición obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 datos:
 *                   type: object
 *                 mensaje:
 *                   type: string
 */
router.get("/ultima", obtenerUltima);

/**
 * @swagger
 * /api/sensores/buscar:
 *   get:
 *     summary: Busca mediciones por coordenadas GPS exactas
 *     tags: [Sensores]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitud de la ubicación
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitud de la ubicación
 *     responses:
 *       200:
 *         description: Medición encontrada
 *       404:
 *         description: No se encontraron mediciones en esa ubicación
 */
router.get("/buscar", obtenerPorUbicacion);

/**
 * @swagger
 * /api/sensores/ciudad:
 *   get:
 *     summary: Obtiene la última medición de una ciudad específica
 *     tags: [Sensores]
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la ciudad (ej. maravatio, morelia)
 *     responses:
 *       200:
 *         description: Última medición de la ciudad
 *       404:
 *         description: No existen lecturas para esa ciudad
 */
router.get("/ciudad", obtenerPorCiudad);

/**
 * @swagger
 * /api/sensores/historial:
 *   get:
 *     summary: Obtiene el historial de mediciones de una ciudad
 *     tags: [Historial]
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la ciudad
 *       - in: query
 *         name: limite
 *         required: false
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Número máximo de registros a retornar
 *     responses:
 *       200:
 *         description: Historial obtenido correctamente
 */
router.get("/historial", obtenerHistorial);

/**
 * @swagger
 * /api/sensores/ciudades:
 *   get:
 *     summary: Obtiene lista de todas las ciudades con mediciones disponibles
 *     tags: [Ciudades]
 *     responses:
 *       200:
 *         description: Lista de ciudades obtenida correctamente
 */
router.get("/ciudades", obtenerCiudades);

/**
 * @swagger
 * /api/sensores/estado:
 *   get:
 *     summary: Obtiene el estado actual del sistema
 *     tags: [Sensores]
 *     responses:
 *       200:
 *         description: Estado del sistema
 */
router.get("/estado", obtenerEstado);

export default router;