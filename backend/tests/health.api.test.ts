import request from "supertest";
import express from "express";
import healthRoutes from "../src/routes/health.routes";

const app = express();
app.use("/api/health", healthRoutes);

describe("Health API Integration Tests", () => {
  it("GET /api/health - should return 200 OK with service status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "OK");
  });
});
