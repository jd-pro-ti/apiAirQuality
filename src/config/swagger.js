import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Air Quality API",
      version: "1.0.0",
      description: "Documentación de la API del sistema de calidad del aire",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },

  // Aquí Swagger buscará tus rutas y los comentarios @swagger
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiMiddleware = swaggerUi;
