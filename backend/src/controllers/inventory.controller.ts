import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getIO } from "../socket";

const prisma = new PrismaClient();

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { productId, newStock } = req.body;

    // Basic validation
    if (!productId || newStock === undefined) {
      return res.status(400).json({ message: "Missing productId or newStock" });
    }

    const quantity = parseInt(newStock);
    const pId = parseInt(productId);

    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ message: "Invalid stock quantity" });
    }

    // Update DB
    const product = await prisma.product.update({
      where: { id: pId },
      data: { stock: quantity },
    });

    // Broadcast to all connected clients
    const io = getIO();
    io.emit("INVENTORY_UPDATE", {
      productId: pId.toString(),
      stock: quantity, // Frontend expects 'stock', not 'newStock'
    });

    res.json({ message: "Inventory updated and broadcasted", product });
  } catch (error) {
    console.error("Inventory update error:", error);
    res.status(500).json({ message: "Error updating inventory" });
  }
};
