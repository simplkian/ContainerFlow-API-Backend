import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "./node_modules/typescript/lib/typescript.js";

export async function resolve(specifier, context, next) {
  const stubs = {
    "@shared/schema":
      "export const users = {}; export const customers = {}; export const customerContainers = {}; export const warehouseContainers = {}; export const tasks = {}; export const activityLogs = {}; export const fillHistory = {}; export const scanEvents = {}; export const departments = {}; export const materials = {}; export const halls = {}; export const stations = {}; export const stands = {}; export const boxes = {}; export const taskEvents = {}; export const taskSchedules = {}; export const assertAutomotiveTransition = () => {}; export const getAutomotiveTimestampFieldForStatus = () => ''; export const getTimestampFieldForStatus = () => ''; export const isValidTaskTransition = () => true; export const materialsRelations = {}; export const ACTIVITY_LOG_TYPE_LABELS = {}; export const AUTOMOTIVE_TASK_STATUS_LABELS = {}; export const AUTOMOTIVE_TASK_TRANSITIONS = {}; export const AUTOMOTIVE_USER_ROLE_LABELS = {}; export const BOX_STATUS_LABELS = {}; export const BOX_STATUS_WITH_PREVIOUS = {}; export const CONTAINER_TYPES = {}; export const DAILY_TASK_STATUS_TRANSITION_ACTIONS = {}; export const DAILY_TASK_STATUS_TRANSITION_TIME = {}; export const DAILY_TASK_TYPE_TO_TASK_STATE = {}; export const DEFAULT_DAILY_TASK_TYPE = ''; export const DAILY_TASK_TYPE = {}; export const DAILY_TASK_STATUS = {}; export const DAILY_TASK_TYPE_LABELS = {}; export const DEFAULT_ADMIN_EMAIL = ''; export const DEFAULT_ADMIN_PASSWORD = ''; export const DEFAULT_ADMIN_ROLE = ''; export const MATERIAL_TYPE_LABELS = {}; export const MATERIAL_TYPE = {}; export const STATION_STATUS = {}; export const TASK_ASSIGNMENT_STATE = {}; export const TASK_EVENT_TYPE = {}; export const TASK_EVENT_TYPE_LABELS = {}; export const TASK_PRIORITY = {}; export const TASK_STATE = {}; export const TASK_STATUS_TRANSITIONS = {}; export const TASK_STATUS_TRANSITION_ACTIONS = {}; export const TASK_STATUS_TRANSITION_TIME = {}; export const TASK_TYPE = {}; export const USER_ROLE = {};",
    "drizzle-orm":
      "export const eq = () => {}; export const and = () => {}; export const desc = () => {}; export const notInArray = () => {}; export const isNull = () => {}; export const gte = () => {}; export const lte = () => {}; export const sql = () => {}; export const inArray = () => {}; export const count = () => {}; export const sum = () => {}; export const avg = () => {}; export const or = () => {}; export const ilike = () => {};",
    "./db": "export const db = {}; export async function checkDatabaseHealth(){ return { database: true }; }",
    "./config/env": "export const env = { nodeEnv: 'test', port: 0, databaseUrl: '' };",
    "./storage": "export const storage = { getUser: async () => undefined, getUserByEmail: async () => undefined, createUser: async () => { throw new Error('not implemented'); } };",
  };

  if (stubs[specifier]) {
    return {
      url: `data:text/javascript,${encodeURIComponent(stubs[specifier])}`,
      shortCircuit: true,
    };
  }

  if (specifier.startsWith("./") && !path.extname(specifier)) {
    const resolvedUrl = new URL(`${specifier}.ts`, context.parentURL);
    return {
      url: resolvedUrl.href,
      shortCircuit: true,
    };
  }

  if (specifier.startsWith("@shared/")) {
    const relativePath = specifier.replace("@shared/", "../shared/");
    const resolvedUrl = new URL(`${relativePath}.ts`, context.parentURL);
    return {
      url: resolvedUrl.href,
      shortCircuit: true,
    };
  }

  return next(specifier, context);
}

export async function load(url, context, next) {
  if (!url.endsWith(".ts")) {
    return next(url, context);
  }

  const source = await readFile(new URL(url), "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    },
    fileName: url,
  });

  return {
    format: "module",
    source: transpiled.outputText,
    shortCircuit: true,
  };
}
