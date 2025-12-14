import express from "express";
import { env } from "./config/env";

export function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origin = req.header("origin");

    if (origin) {
      const allowedPatterns = [
        /^https?:\/\/localhost(:\d+)?$/,
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
        /\.replit\.dev$/,
        /\.replit\.app$/,
        /\.riker\.replit\.dev$/,
        /\.repl\.co$/,
      ];

      const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin)) ||
        (env.replitDevDomain && origin.includes(env.replitDevDomain));

      if (isAllowed) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        );
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-id, x-replit-user-id, x-replit-user-name, x-replit-user-roles");
        res.header("Access-Control-Allow-Credentials", "true");
      }
    } else {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-id, x-replit-user-id, x-replit-user-name, x-replit-user-roles");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}
