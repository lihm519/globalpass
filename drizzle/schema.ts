import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * E-SIM 套餐表
 */
export const esimPackages = mysqlTable("esim_packages", {
  id: int("id").autoincrement().primaryKey(),
  provider: varchar("provider", { length: 64 }).notNull(), // 供应商: Airalo, Nomad
  country: varchar("country", { length: 128 }).notNull(), // 国家名称
  planName: varchar("planName", { length: 256 }).notNull(), // 套餐名称
  dataType: varchar("dataType", { length: 32 }).notNull(), // 数据类型: Data, Unlimited
  dataAmount: varchar("dataAmount", { length: 64 }).notNull(), // 数据量: 1GB, 3GB, Unlimited
  validity: varchar("validity", { length: 64 }).notNull(), // 有效期: 3 Days, 7 Days, 30 Days
  price: varchar("price", { length: 32 }).notNull(), // 价格 (USD)
  network: varchar("network", { length: 256 }), // 网络运营商
  link: text("link"), // 购买链接
  rawData: text("rawData"), // 原始 JSON 数据
  lastChecked: timestamp("lastChecked").defaultNow().notNull(), // 最后检查时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EsimPackage = typeof esimPackages.$inferSelect;
export type InsertEsimPackage = typeof esimPackages.$inferInsert;