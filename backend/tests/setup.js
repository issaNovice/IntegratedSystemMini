import { jest } from "@jest/globals";
import * as db from "../src/db.js";

// Mock database query globally
jest.spyOn(db.pool, "query").mockImplementation(async (sql, params) => {
  if (sql.includes("SELECT * FROM users WHERE email")) {
    if (params[0] === "existing@example.com") return [[{ email: "existing@example.com", password_hash: "hashed" }]];
    if (params[0] === "notfound@example.com") return [[]];
  }

  if (sql.includes("INSERT INTO users")) {
    return [{ insertId: 1 }];
  }

  if (sql.includes("SELECT customer_id FROM customer")) {
    if (params.customer_name === "John Doe") return [[{ customer_id: 1 }]];
    return [[]];
  }

  if (sql.includes("INSERT INTO rental")) {
    return [{ insertId: 123 }];
  }

  return [[]]; // default mock
});
