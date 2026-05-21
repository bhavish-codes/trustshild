import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import mockRoutes from "./routes/mock.routes";
import { errorHandler } from "./middleware/error-handler";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use("/mock-api", mockRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Background Verification Platform API is running successfully.",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      api: "/api",
      mockVerification: "/mock-api"
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.path}. Endpoint not found.`,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Main API: http://localhost:${PORT}/api`);
  console.log(`Mock Verification APIs: http://localhost:${PORT}/mock-api`);
});

export default app;
