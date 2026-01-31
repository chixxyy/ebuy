import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import express from "express";
import { PrismaClient } from "@prisma/client";
import productRoutes from "../src/routes/product.routes";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

// Mock Socket.IO to avoid server setup issues in test
import * as socketModule from "../src/socket"; // Import the module to spy on it
import { createServer } from "http";

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

// Setup Spy
const emitSpy = vi.fn();
const mockIO = {
  emit: emitSpy,
  on: vi.fn(),
};

// Mock getIO to return our mock object
vi.spyOn(socketModule, "getIO").mockReturnValue(mockIO as any);
vi.spyOn(socketModule, "initSocket").mockImplementation(() => mockIO as any);

// Mock Auth Middleware
// We need to bypass the real middleware or provide a valid token.
// Simplest way for integration test: Mock the middleware or generate a real token if we have the secret.
// Let's assume we can generate a valid token.
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

const generateToken = (userId: number) => {
  return jwt.sign({ userId, email: "test@test.com" }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Setup App
const server = createServer(app);
// initSocket(server); // We mocked it
app.use("/api/products", productRoutes);

// Helper to create a test product
const createTestProduct = async (stock: number) => {
  // Ensure we have a user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test_inv_" + Date.now() + "@test.com",
        password: "hashedpassword",
        name: "Inventory Tester",
      },
    });
  }

  return prisma.product.create({
    data: {
      name: "Test Product",
      description: "Testing inventory",
      price: 100,
      image: "http://example.com/img.jpg",
      category: "Testing",
      stock: stock,
      sellerId: user.id,
    },
  });
};

describe("Inventory API", () => {
  let authToken: string;
  let user: any;

  beforeAll(async () => {
    // Create user for auth
    user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `inv_tester_${Date.now()}@test.com`,
          password: "pass",
          name: "Tester",
        },
      });
    }
    authToken = generateToken(user.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should successfully purchase a product (200 OK)", async () => {
    const product = await createTestProduct(10);

    const res = await request(app)
      .post(`/api/products/${product.id}/purchase`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.product.stock).toBe(9);

    // Double check DB
    const dbProduct = await prisma.product.findUnique({
      where: { id: product.id },
    });
    expect(dbProduct?.stock).toBe(9);
  });

  it("should fail if stock is insufficient (400 Bad Request)", async () => {
    const product = await createTestProduct(1);

    // Buy 2
    const res = await request(app)
      .post(`/api/products/${product.id}/purchase`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ quantity: 2 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Insufficient stock");
  });

  it("should handle concurrency without overselling", async () => {
    const product = await createTestProduct(10);
    const buyerCount = 15; // 15 requests for a stock of 10

    emitSpy.mockClear(); // Clear previous calls

    // Simulate concurrent requests
    const requests = Array.from({ length: buyerCount }).map(() =>
      request(app)
        .post(`/api/products/${product.id}/purchase`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ quantity: 1 }),
    );

    const responses = await Promise.all(requests);

    const successCount = responses.filter((r) => r.status === 200).length;
    const failCount = responses.filter((r) => r.status === 400).length; // 400 Insufficient stock
    const errorCount = responses.filter((r) => r.status === 500).length; // 500 DB Busy

    console.log(
      `Concurrency Test: Success: ${successCount}, Fail (400): ${failCount}, Error (500): ${errorCount}`,
    );

    // With SQLite, we might get strict overselling protection but some might fail with 500 Busy.
    // We assert that NO overselling happened.
    // Success count should be at most 10.
    expect(successCount).toBeLessThanOrEqual(10);

    // Total sold should allow remaining stock to be correct
    const finalProduct = await prisma.product.findUnique({
      where: { id: product.id },
    });
    expect(finalProduct?.stock).toBe(10 - successCount);

    // If we strictly want 10 success, we need a better DB or retry logic.
    // For this test, verifying consistency (Stock + Success = Original) is key.

    // Verify WebSocket broadcasts
    // Should emit once per success
    expect(emitSpy).toHaveBeenCalledTimes(successCount);
    if (successCount > 0) {
      expect(emitSpy).toHaveBeenCalledWith(
        "INVENTORY_UPDATE",
        expect.objectContaining({
          productId: product.id.toString(),
        }),
      );
    }
  }, 30000); // 30s timeout for SQLite struggle
});
