const express = require("express");
const cors = require("cors");
const app = express();

// Prevent process from exiting on unhandled errors (so we can see what's wrong)
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const cookieParser = require("cookie-parser");
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const problemRoutes = require("./routes/problemRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

app.use("/api/problems", problemRoutes);
app.use("/api/submit", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./matchmaking");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true,
  }
});

// Pass io to other routes if needed
app.set('io', io);

// Initialize matchmaking sockets
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
  console.log("Available Routes:");
  console.log(" - /api/problems");
  console.log(" - /api/submit");
  console.log(" - /api/admin");
  console.log(" - /api/leaderboard");
});

server.on("error", (err) => {
  console.error("Server error:", err);
});
