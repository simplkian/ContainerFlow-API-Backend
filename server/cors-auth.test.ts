import test from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import express from "express";

import { setupCors } from "./cors.ts";
import { requireAuth } from "./routes.ts";
import { storage } from "./storage";

async function startServer(app: express.Application) {
  const server = app.listen(0);

  await new Promise<void>((resolve) => {
    server.once("listening", () => resolve());
  });

  const address = server.address() as AddressInfo;
  return { server, port: address.port };
}

test("OPTIONS preflight without origin allows x-user-id header", async () => {
  const app = express();
  setupCors(app);

  const { server, port } = await startServer(app);

  try {
    const response = await fetch(`http://localhost:${port}/`, {
      method: "OPTIONS",
    });

    assert.equal(response.status, 200);

    const allowHeaders = response.headers.get("access-control-allow-headers");
    assert.ok(allowHeaders?.includes("x-user-id"));
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("requireAuth middleware accepts x-user-id header", async () => {
  const app = express();
  app.use(express.json());

  const originalGetUser = storage.getUser;
  storage.getUser = async (id: string) => ({
    id,
    email: "tester@example.com",
    name: "Tester",
    password: "hashed",
    role: "ADMIN",
    isActive: true,
  } as any);

  app.post("/protected", requireAuth, (req, res) => {
    res.json({
      userId: (req as any).authUser.id,
    });
  });

  const { server, port } = await startServer(app);

  try {
    const response = await fetch(`http://localhost:${port}/protected`, {
      method: "POST",
      headers: {
        "x-user-id": "user-123",
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.userId, "user-123");
  } finally {
    storage.getUser = originalGetUser;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
