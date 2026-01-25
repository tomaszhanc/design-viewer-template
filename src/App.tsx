import { useState, useEffect, useCallback } from "react"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { RightPanel } from "@/components/shell/RightPanel"
import { EmptyVersions } from "@/components/EmptyVersions"
import { type ViewportSize, getViewportWidth } from "@/components/shell/ViewportSelector"
import { versions } from "@versions/index"

type NotesData = Record<string, { notes?: string; source?: string; approvedAt?: string }>

function AppContent() {
  const [activeVersion, setActiveVersion] = useState(versions[0]?.id ?? "")
  const [viewport, setViewport] = useState<ViewportSize>("full")
  const [notesData, setNotesData] = useState<NotesData>({})
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(true)

  useEffect(() => {
    fetch("/api/notes")
      .then((res) => res.json())
      .then(setNotesData)
      .catch(console.error)
  }, [])

  const handleNotesChange = useCallback(
    (notes: string) => {
      const updated = {
        ...notesData,
        [activeVersion]: {
          ...notesData[activeVersion],
          notes,
        },
      }
      setNotesData(updated)
      fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(console.error)
    },
    [activeVersion, notesData]
  )

  const ActiveComponent = versions.find((v) => v.id === activeVersion)?.component

  if (versions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <EmptyVersions />
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <main className="flex-1 flex justify-center overflow-auto">
        <div
          style={{
            width: getViewportWidth(viewport),
            maxWidth: "100%",
          }}
          className="border-x border-border min-h-full bg-background"
        >
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>

      <div className={isPanelCollapsed ? "w-[48px]" : "w-[260px]"}>
        <RightPanel
          versions={versions}
          activeVersion={activeVersion}
          onVersionChange={setActiveVersion}
          notesMap={notesData}
          onNotesChange={handleNotesChange}
          viewport={viewport}
          onViewportChange={setViewport}
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
        />
      </div>
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
