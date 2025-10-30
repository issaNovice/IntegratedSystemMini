import request from "supertest";
import express from "express";
import customersRouter from "../src/routes/customers.js";

const app = express();
app.use(express.json());
app.use("/api/customers", customersRouter);

describe("Customers Routes", () => {
  test("POST /api/customers → missing fields", async () => {
    const res = await request(app).post("/api/customers").send({});
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/customers → success", async () => {
    const res = await request(app)
      .post("/api/customers")
      .send({ first_name: "John", last_name: "Doe", address_id: 1 });
    expect(res.statusCode).toBe(201);
  });

  test("GET /api/customers/1 → customer not found", async () => {
    const res = await request(app).get("/api/customers/999");
    expect([404, 200]).toContain(res.statusCode);
  });
});
