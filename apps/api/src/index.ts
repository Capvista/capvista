import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.routes";
import companiesRoutes from "./routes/companies.routes";
import dealsRoutes from "./routes/deals.routes";
import investmentsRoutes from "./routes/investments.routes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware (development only)
if (process.env.NODE_ENV === "development") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API version info
app.get("/v1", (req: Request, res: Response) => {
  res.json({
    message: "Capvista API v1",
    version: "0.1.0",
    endpoints: {
      auth: "/v1/auth",
      companies: "/v1/companies",
      deals: "/v1/deals",
      investments: "/v1/investments",
    },
  });
});

// Mount route handlers
app.use("/v1/auth", authRoutes);
app.use("/v1/companies", companiesRoutes);
app.use("/v1/deals", dealsRoutes);
app.use("/v1/investments", investmentsRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Capvista API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📍 Endpoints available at http://localhost:${PORT}/v1`);
});

export default app;
