import { useState } from "react"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { Header } from "@/components/shell/Header"
import { EmptyVersions } from "@/components/EmptyVersions"
import { type ViewportSize, getViewportWidth } from "@/components/shell/ViewportSelector"
import { versions } from "@versions/index"

function AppContent() {
  const [activeVersion, setActiveVersion] = useState(versions[0]?.id ?? "")
  const [viewport, setViewport] = useState<ViewportSize>("desktop")

  const ActiveComponent = versions.find((v) => v.id === activeVersion)?.component

  if (versions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <EmptyVersions />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeVersion={activeVersion}
        onVersionChange={setActiveVersion}
        viewport={viewport}
        onViewportChange={setViewport}
        versionCount={versions.length}
      />
      <main className="flex justify-center">
        <div
          style={{
            width: getViewportWidth(viewport),
            maxWidth: "100%",
          }}
          className="border-x border-border min-h-[calc(100vh-3.5rem)] bg-background"
        >
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
