import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import commentRoutes from "./routes/comment.routes";
import uploadRoutes from "./routes/upload.routes";
import cartRoutes from "./routes/cart.routes";
import inventoryRoutes from "./routes/inventory.routes";
import paymentRoutes from "./routes/payment.routes";
import { initSocket } from "./socket";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.IO
initSocket(httpServer);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/payment", paymentRoutes);

// Serve static files from uploads directory
import path from "path";
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
