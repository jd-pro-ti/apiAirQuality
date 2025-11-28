import express from "express";
import cors from "cors";
import morgan from "morgan";
import sensoresRoutes from "./routes/sensores.routes.js";
import predictionRoutes from "./routes/prediction.routes.js";
import recomendacionesRoutes from "./routes/gemini.routes.js"; 
import { swaggerSpec, swaggerUiMiddleware } from "./config/swagger.js";






import { PORT } from "./config/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Documentación Swagger
app.use("/api-docs", swaggerUiMiddleware.serve, swaggerUiMiddleware.setup(swaggerSpec));

// Rutas
app.use("/api/sensores", sensoresRoutes);
app.use("/api/prediccion", predictionRoutes);
app.use("/api/recomendaciones", recomendacionesRoutes);


// Listener Firebase (por ahora lo comentaremos)
// iniciarListener();

app.listen(PORT, () => {
  console.log(`🚀 API funcionando en http://localhost:${PORT}`);
  console.log(`📘 Documentación: http://localhost:${PORT}/api-docs`);
});
