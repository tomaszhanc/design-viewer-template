import type { Plugin, Connect } from "vite"
import type { IncomingMessage, ServerResponse } from "node:http"
import fs from "node:fs"
import path from "node:path"

const NOTES_FILE = "versions/notes.json"
const VERSIONS_FILE = "versions/index.ts"

export function notesApiPlugin(): Plugin {
  return {
    name: "notes-api",
    configureServer(server) {
      server.middlewares.use((
        req: Connect.IncomingMessage,
        res: ServerResponse,
        next: Connect.NextFunction
      ) => {
        if (req.url === "/api/notes") {
          return handleNotesApi(req, res)
        }

        const versionTypeMatch = req.url?.match(/^\/api\/versions\/([^/]+)\/type$/)
        if (versionTypeMatch) {
          return handleVersionTypeApi(req, res, versionTypeMatch[1])
        }

        const versionTitleMatch = req.url?.match(/^\/api\/versions\/([^/]+)\/title$/)
        if (versionTitleMatch) {
          return handleVersionTitleApi(req, res, versionTitleMatch[1])
        }

        const versionDeleteMatch = req.url?.match(/^\/api\/versions\/([^/]+)$/)
        if (versionDeleteMatch && req.method === "DELETE") {
          return handleVersionDeleteApi(req, res, versionDeleteMatch[1])
        }

        next()
      })
    },
  }
}

function handleNotesApi(req: Connect.IncomingMessage, res: ServerResponse) {
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
}

function handleVersionTypeApi(req: Connect.IncomingMessage, res: ServerResponse, versionId: string) {
  if (req.method !== "POST") {
    res.statusCode = 405
    res.end(JSON.stringify({ error: "Method not allowed" }))
    return
  }

  let body = ""
  ;(req as IncomingMessage).on("data", (chunk: Buffer) => {
    body += chunk.toString()
  })
  ;(req as IncomingMessage).on("end", () => {
    try {
      const { type } = JSON.parse(body)
      if (type !== "final" && type !== "page" && type !== "element") {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Invalid type. Must be 'final', 'page' or 'element'" }))
        return
      }

      const versionsPath = path.resolve(process.cwd(), VERSIONS_FILE)
      let content = fs.readFileSync(versionsPath, "utf-8")

      const versionRegex = new RegExp(
        `(\\{\\s*id:\\s*"${versionId}"[^}]*type:\\s*)"(final|page|element)"`,
        "g"
      )

      if (!versionRegex.test(content)) {
        res.statusCode = 404
        res.end(JSON.stringify({ error: `Version ${versionId} not found` }))
        return
      }

      content = content.replace(versionRegex, `$1"${type}"`)
      fs.writeFileSync(versionsPath, content)

      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ success: true, id: versionId, type }))
    } catch {
      res.statusCode = 500
      res.end(JSON.stringify({ error: "Failed to update version type" }))
    }
  })
}

function handleVersionTitleApi(req: Connect.IncomingMessage, res: ServerResponse, versionId: string) {
  if (req.method !== "POST") {
    res.statusCode = 405
    res.end(JSON.stringify({ error: "Method not allowed" }))
    return
  }

  let body = ""
  ;(req as IncomingMessage).on("data", (chunk: Buffer) => {
    body += chunk.toString()
  })
  ;(req as IncomingMessage).on("end", () => {
    try {
      const { title } = JSON.parse(body)
      if (!title || typeof title !== "string") {
        res.statusCode = 400
        res.end(JSON.stringify({ error: "Title is required" }))
        return
      }

      const versionsPath = path.resolve(process.cwd(), VERSIONS_FILE)
      let content = fs.readFileSync(versionsPath, "utf-8")

      const versionRegex = new RegExp(
        `(\\{\\s*id:\\s*"${versionId}"[^}]*title:\\s*)"[^"]*"`,
        "g"
      )

      if (!versionRegex.test(content)) {
        res.statusCode = 404
        res.end(JSON.stringify({ error: `Version ${versionId} not found` }))
        return
      }

      content = content.replace(versionRegex, `$1"${title.replace(/"/g, '\\"')}"`)
      fs.writeFileSync(versionsPath, content)

      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ success: true, id: versionId, title }))
    } catch {
      res.statusCode = 500
      res.end(JSON.stringify({ error: "Failed to update version title" }))
    }
  })
}

function handleVersionDeleteApi(_req: Connect.IncomingMessage, res: ServerResponse, versionId: string) {
  try {
    const versionsPath = path.resolve(process.cwd(), VERSIONS_FILE)
    let content = fs.readFileSync(versionsPath, "utf-8")

    // Find the import line to get the file path
    const importRegex = new RegExp(
      `import\\s*\\{\\s*\\w+\\s*\\}\\s*from\\s*"(\\.\\/${versionId}-[^"]+)"`,
      "m"
    )
    const importMatch = content.match(importRegex)

    if (!importMatch) {
      res.statusCode = 404
      res.end(JSON.stringify({ error: `Version ${versionId} not found` }))
      return
    }

    const componentPath = importMatch[1]
    const componentFile = path.resolve(process.cwd(), "versions", `${componentPath.replace("./", "")}.tsx`)

    // Remove the import line
    content = content.replace(new RegExp(`import\\s*\\{[^}]+\\}\\s*from\\s*"${componentPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\n?`), "")

    // Remove the version entry from the array
    content = content.replace(new RegExp(`\\s*\\{[^}]*id:\\s*"${versionId}"[^}]*\\},?\\n?`), "\n")

    // Clean up any trailing commas before ]
    content = content.replace(/,(\s*\])/, "$1")

    fs.writeFileSync(versionsPath, content)

    // Delete the component file
    if (fs.existsSync(componentFile)) {
      fs.unlinkSync(componentFile)
    }

    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ success: true, id: versionId }))
  } catch (err) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: "Failed to delete version" }))
  }
}
