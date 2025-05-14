import { defineNitroConfig } from "nitropack/config";
import { createServer, ViteDevServer } from "vite";
import { defineLazyEventHandler, fromNodeMiddleware } from "h3";

let viteServer: ViteDevServer | undefined;
const getViteServer = async () => {
  if (!viteServer) {
    viteServer = await createServer({
      base: "/",
      appType: "custom",
      server: { middlewareMode: true },
    });
  }
  return viteServer;
};

export default defineNitroConfig({
  srcDir: "server",
  serveStatic: true,
  compatibilityDate: "2025-05-13",
  publicAssets: [
    {
      baseURL: "/",
      dir: "public/assets", 
    },
  ],
  bundledStorage: ['templates'],
  devHandlers: [
    {
      route: "/",
      handler: defineLazyEventHandler(async () => {
        const server = await getViteServer();
        return fromNodeMiddleware(server.middlewares);
      }),
    },
    {
      route: "/:wsPath(vite|socket.io|ws)?",
      handler: defineLazyEventHandler(async () => {
        const server = await getViteServer();
        return (event) => {
          try {
            if (event.node.req.headers.upgrade === "websocket") {
              server.httpServer?.emit(
                "upgrade",
                event.node.req,
                event.node.req.socket,
                Buffer.alloc(0)
              );
            }
          } catch (err) {
            event.node.res.statusCode = 500;
            event.node.res.end("WebSocket upgrade error");
          }
        };
      }),
    },
  ],
  serverAssets: [
    {
      baseName: "templates",
      dir: ".nitro/templates",
    },
  ],
});