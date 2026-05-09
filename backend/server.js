const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./db");
const authRoutes = require("./authRoutes");
const itemRoutes = require("./itemRoutes");
const chatRoutes = require("./chatRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Trust proxy headers (needed on Render / other reverse proxies)
app.set('trust proxy', 1);

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
// Security Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS - Allow requests from localhost during development, and use FRONTEND_URL when set.
const frontendUrl = process.env.FRONTEND_URL;
const corsOptions = {
  credentials: true,
  origin: frontendUrl
    ? (origin, callback) => {
        if (
          !origin ||
          origin === frontendUrl ||
          origin === "http://localhost:3000"
        ) {
          return callback(null, true);
        }
        return callback(
          new Error(`CORS policy does not allow access from ${origin}`),
        );
      }
    : true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" })); // 10mb limit for base64 image uploads

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/chat", chatRoutes);

// Helpful root route so opening backend URL doesn't show "Cannot GET /"
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lost & Found backend is running",
    frontend: "http://localhost:3000",
    health: "/api/health",
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", db: "MongoDB connected" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
