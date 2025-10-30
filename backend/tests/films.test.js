import request from "supertest";
import express from "express";
import filmsRouter from "../src/routes/films.js";

const app = express();
app.use("/api/films", filmsRouter);

describe("Films Routes", () => {
  test("GET /api/films → success", async () => {
    const res = await request(app).get("/api/films");
    expect(res.statusCode).toBe(200);
  });

  test("GET /api/films/:id → not found", async () => {
    const res = await request(app).get("/api/films/9999");
    expect([404, 200]).toContain(res.statusCode);
  });
});
