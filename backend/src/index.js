import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { healthHandler } from './routes/health.js';
import { configHandler } from './routes/config.js';
import { createPlanHandler } from './routes/plan.js';
import { orderIntentHandler, orderConfirmHandler } from './routes/order.js';
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3002;
app.use(cors());
app.use(express.json());
app.get("/health", healthHandler);
app.get("/config/contracts", configHandler);
app.post("/plan/create", createPlanHandler);
app.post("/order/intent", orderIntentHandler);
app.post("/order/confirm", orderConfirmHandler);
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map