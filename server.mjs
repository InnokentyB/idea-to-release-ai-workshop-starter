import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 4173);
const root = fileURLToPath(new URL("./dist/", import.meta.url));
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

if (!existsSync(join(root, "index.html"))) {
  console.error("dist/index.html is missing. Run 'npm run build' first.");
  process.exit(1);
}

createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { allow: "GET, HEAD", "content-type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
    return;
  }
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    if (pathname.includes("\0")) throw new Error("Invalid path");
  } catch {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("Invalid request path");
    return;
  }
  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(root, safePath === "/" ? "index.html" : safePath);
  try {
    if (!statSync(filePath).isFile()) filePath = join(root, "index.html");
  } catch {
    filePath = join(root, "index.html");
  }

  const headers = {
    "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
    "x-content-type-options": "nosniff",
  };
  if (request.method === "HEAD") {
    response.writeHead(200, headers);
    response.end();
    return;
  }
  const stream = createReadStream(filePath);
  stream.on("error", () => {
    if (!response.headersSent) response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("File unavailable");
  });
  stream.once("open", () => {
    response.writeHead(200, headers);
    stream.pipe(response);
  });
  response.on("close", () => stream.destroy());
}).listen(port, "0.0.0.0", () => {
  console.log(`Workshop starter listening on http://0.0.0.0:${port}`);
});
