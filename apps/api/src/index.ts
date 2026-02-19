import dotenv from "dotenv";
// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";

// Import routes
import companiesRoutes from "./routes/companies";
import usersRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import investorsRoutes from "./routes/investors";
import adminRoutes from "./routes/admin";
import dealsRoutes from "./routes/deals";
import investmentsRoutes from "./routes/investments";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use("/api/investors", investorsRoutes);

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
app.get("/api", (req: Request, res: Response) => {
  res.json({
    message: "Capvista API",
    version: "1.0.0",
    endpoints: {
      companies: "/api/companies",
      users: "/api/users",
    },
  });
});

// Mount route handlers
app.use("/api/companies", companiesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/deals", dealsRoutes);
app.use("/api/investments", investmentsRoutes);

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
  console.log(`📍 Endpoints available at http://localhost:${PORT}/api`);
});

export default app;
