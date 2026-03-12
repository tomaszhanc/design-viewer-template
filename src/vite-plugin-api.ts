import type { Plugin, Connect } from "vite"
import type { IncomingMessage, ServerResponse } from "node:http"
import fs from "node:fs"
import path from "node:path"

const NOTES_FILE = "versions/notes.json"

const DEMO_VARIANTS = [
  { id: "01", title: "Homepage Hero", fn: "HomepageHero", color: "#6366f1" },
  { id: "02", title: "Pricing Table", fn: "PricingTable", color: "#ec4899" },
  { id: "03", title: "Dashboard Layout", fn: "DashboardLayout", color: "#14b8a6" },
  { id: "04", title: "Login Form", fn: "LoginForm", color: "#f59e0b" },
  { id: "05", title: "Settings Page", fn: "SettingsPage", color: "#8b5cf6" },
]

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

        if (req.url === "/api/seed-demo" && req.method === "POST") {
          return handleSeedDemo(res)
        }

        if (req.url === "/api/seed-demo" && req.method === "DELETE") {
          return handleCleanDemo(res)
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

function handleSeedDemo(res: ServerResponse) {
  try {
    const versionsDir = path.resolve(process.cwd(), "versions")

    // Create component files
    for (const v of DEMO_VARIANTS) {
      const filePath = path.join(versionsDir, `${v.id}-${v.fn}.tsx`)
      if (fs.existsSync(filePath)) continue
      fs.writeFileSync(filePath, `export function ${v.fn}() {
  const handleRemoveDemos = () => {
    fetch("/api/seed-demo", { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to clean demos")
        window.location.reload()
      })
      .catch(console.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "${v.color}10" }}>
      <div className="max-w-lg w-full space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "${v.color}" }}>
          <span className="text-2xl font-bold text-white">${v.id.toUpperCase()}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">${v.title}</h1>
        <p className="text-muted-foreground">
          This is a demo variant for testing the approve/reject workflow.
          Right-click on the variant in the sidebar to approve or reject it.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg border-2 border-dashed" style={{ borderColor: "${v.color}40" }} />
          ))}
        </div>
        <button
          onClick={handleRemoveDemos}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors underline underline-offset-4"
        >
          Remove all demos
        </button>
      </div>
    </div>
  )
}
`)
    }

    // Update versions/index.ts
    const imports = DEMO_VARIANTS.map((v) => `import { ${v.fn} } from "./${v.id}-${v.fn}"`).join("\n")
    const entries = DEMO_VARIANTS.map((v) => `  { id: "${v.id}", title: "${v.title}", component: ${v.fn} },`).join("\n")

    const indexContent = `import type { ComponentType } from "react"

${imports}

export interface Version {
  id: string
  title: string
  component: ComponentType
}

export const versions: Version[] = [
${entries}
]
`
    fs.writeFileSync(path.join(versionsDir, "index.ts"), indexContent)

    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ success: true }))
  } catch {
    res.statusCode = 500
    res.end(JSON.stringify({ error: "Failed to seed demo variants" }))
  }
}

function handleCleanDemo(res: ServerResponse) {
  try {
    const versionsDir = path.resolve(process.cwd(), "versions")

    // Remove demo component files (match by function name suffix)
    for (const v of DEMO_VARIANTS) {
      const files = fs.readdirSync(versionsDir).filter((f) => f.endsWith(`-${v.fn}.tsx`))
      for (const f of files) {
        fs.unlinkSync(path.join(versionsDir, f))
      }
    }

    const indexContent = `import type { ComponentType } from "react"

export interface Version {
  id: string
  title: string
  component: ComponentType
}

export const versions: Version[] = [
]
`
    fs.writeFileSync(path.join(versionsDir, "index.ts"), indexContent)

    const notesPath = path.resolve(process.cwd(), NOTES_FILE)
    fs.writeFileSync(notesPath, "{}")

    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ success: true }))
  } catch {
    res.statusCode = 500
    res.end(JSON.stringify({ error: "Failed to clean demo variants" }))
  }
}
