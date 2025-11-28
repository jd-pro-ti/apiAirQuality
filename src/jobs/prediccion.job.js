import { obtenerUltimosDatosFirebase } from "../services/firebaseRealtime.js";
import { predecirCalidadAire } from "../services/prediccionService.js";

export const iniciarPrediccionJob = () => {
  setInterval(async () => {
    const datos = await obtenerUltimosDatosFirebase();
    const prediccion = predecirCalidadAire(datos);

    console.log("📈 Nueva predicción:", prediccion);
  }, 10000); // 10 segundos
};
