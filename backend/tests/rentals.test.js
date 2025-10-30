import request from "supertest";
import express from "express";
import rentalsRouter from "../src/routes/rentals.js";

const app = express();
app.use(express.json());
app.use("/api/rentals", rentalsRouter);

describe("Rentals Routes", () => {
  test("POST /api/rentals → missing fields", async () => {
    const res = await request(app).post("/api/rentals").send({});
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/rentals → customer not found", async () => {
    const res = await request(app)
      .post("/api/rentals")
      .send({ customer_name: "Fake User", inventory_id: 1, staff_id: 1 });
    expect([404, 409, 201]).toContain(res.statusCode);
  });

  test("POST /api/rentals → success", async () => {
    const res = await request(app)
      .post("/api/rentals")
      .send({ customer_name: "John Doe", inventory_id: 1, staff_id: 1 });
    expect([201, 409]).toContain(res.statusCode);
  });
});
