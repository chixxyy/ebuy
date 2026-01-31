import { Router } from "express";
import { updateInventory } from "../controllers/inventory.controller";

const router = Router();

// In a real app, this should be admin-protected.
// For now, leaving it public or simple for demonstration as requested.
router.post("/update", updateInventory);

export default router;
