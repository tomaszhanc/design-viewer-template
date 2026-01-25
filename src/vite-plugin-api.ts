import type { Plugin, Connect } from "vite"
import type { IncomingMessage, ServerResponse } from "node:http"
import fs from "node:fs"
import path from "node:path"

const NOTES_FILE = "versions/notes.json"

export function notesApiPlugin(): Plugin {
  return {
    name: "notes-api",
    configureServer(server) {
      server.middlewares.use((
        req: Connect.IncomingMessage,
        res: ServerResponse,
        next: Connect.NextFunction
      ) => {
        if (req.url !== "/api/notes") {
          return next()
        }

        const notesPath = path.resolve(process.cwd(), NOTES_FILE)

        if (req.method === "GET") {
          try {
            const data = fs.existsSync(notesPath)
              ? fs.readFileSync(notesPath, "utf-8")
              : "{}"
            res.setHeader("Content-Type", "application/json")
            res.end(data)
          } catch {
            res.statusCode = 500
            res.end(JSON.stringify({ error: "Failed to read notes" }))
          }
          return
        }

        if (req.method === "POST") {
          let body = ""
          ;(req as IncomingMessage).on("data", (chunk: Buffer) => {
            body += chunk.toString()
          })
          ;(req as IncomingMessage).on("end", () => {
            try {
              const data = JSON.parse(body)
              fs.writeFileSync(notesPath, JSON.stringify(data, null, 2))
              res.setHeader("Content-Type", "application/json")
              res.end(JSON.stringify({ success: true }))
            } catch {
              res.statusCode = 500
              res.end(JSON.stringify({ error: "Failed to write notes" }))
            }
          })
          return
        }

        next()
      })
    },
  }
}
