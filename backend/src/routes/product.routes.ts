import { Router } from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  createComment,
  purchaseProduct,
} from "../controllers/product.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authenticateToken, createProduct);
router.put("/:id", authenticateToken, updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);
router.post("/:id/comments", authenticateToken, createComment);
router.post("/:id/purchase", authenticateToken, purchaseProduct);

export default router;
