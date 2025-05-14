import { defineEventHandler } from "h3";
import { useStorage } from "nitropack/runtime";
const isProd = process.env.NODE_ENV === "production";

export default defineEventHandler(async (event) => {
  console.log("index.ts");
  const indexPath = isProd ? "assets:templates:index.html" : "root:index.html";
  const template = (await useStorage().getItem(indexPath)) as string;
  return template;
});