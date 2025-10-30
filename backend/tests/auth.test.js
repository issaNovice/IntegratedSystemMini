import request from "supertest";
import express from "express";
import authRouter from "../src/routes/auth.js";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

describe("Auth Routes", () => {
  test("POST /register → should fail if fields missing", async () => {
    const res = await request(app).post("/auth/register").send({});
    expect(res.statusCode).toBe(400);
  });

  test("POST /register → should fail if email already exists", async () => {
    const res = await request(app).post("/auth/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "existing@example.com",
      password: "secret",
    });
    expect(res.statusCode).toBe(400);
  });

  test("POST /register → should succeed", async () => {
    const res = await request(app).post("/auth/register").send({
      first_name: "Jane",
      last_name: "Doe",
      email: "newuser@example.com",
      password: "secret",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /login → should fail if email not found", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "notfound@example.com",
      password: "test",
    });
    expect(res.statusCode).toBe(400);
  });
});
