import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { SquareChevronLeft, SquareChevronRight, ChevronDown, ChevronRight } from "lucide-react"
import { ViewportSelector, type ViewportSize } from "./ViewportSelector"
import { ThemeToggle } from "./ThemeToggle"
import type { VariantType } from "@versions/index"

interface Version {
  id: string
  title: string
  type: VariantType
}

interface RightPanelProps {
  versions: Version[]
  activeVersion: string
  onVersionChange: (id: string) => void
  onMoveVariant: (id: string, targetType: VariantType) => void
  onRenameVariant: (id: string, title: string) => void
  onRemoveVariant: (id: string) => void
  notesMap: Record<string, { notes?: string }>
  onNotesChange: (notes: string) => void
  viewport: ViewportSize
  onViewportChange: (viewport: ViewportSize) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

interface CollapsibleSectionProps {
  title: string
  count: number
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  count,
  isExpanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 transition-colors">
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span>{title}</span>
        <span className="text-xs">({count})</span>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}

export function RightPanel({
  versions,
  activeVersion,
  onVersionChange,
  onMoveVariant,
  onRenameVariant,
  onRemoveVariant,
  notesMap,
  onNotesChange,
  viewport,
  onViewportChange,
  isCollapsed,
  onToggleCollapse,
}: RightPanelProps) {
  const [localNotes, setLocalNotes] = useState(notesMap[activeVersion]?.notes ?? "")
  const [expandedSections, setExpandedSections] = useState({
    final: true,
    page: true,
    element: true,
  })
  const [renameDialog, setRenameDialog] = useState<{ id: string; title: string } | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; title: string } | null>(null)

  const finalVersions = versions.filter((v) => v.type === "final")
  const pageVersions = versions.filter((v) => v.type === "page")
  const elementVersions = versions.filter((v) => v.type === "element")

  useEffect(() => {
    setLocalNotes(notesMap[activeVersion]?.notes ?? "")
  }, [notesMap, activeVersion])

  const handleBlur = useCallback(() => {
    if (localNotes !== (notesMap[activeVersion]?.notes ?? "")) {
      onNotesChange(localNotes)
    }
  }, [localNotes, notesMap, activeVersion, onNotesChange])

  const toggleSection = (section: VariantType) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getTypeLabel = (type: VariantType) => {
    switch (type) {
      case "final": return "Final"
      case "page": return "Pages"
      case "element": return "Elements"
    }
  }

  const renderContextMenuItems = (version: Version) => {
    const types: VariantType[] = ["final", "page", "element"]
    return (
      <>
        <ContextMenuItem onClick={() => setRenameDialog({ id: version.id, title: version.title })}>
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        {types
          .filter((t) => t !== version.type)
          .map((t) => (
            <ContextMenuItem key={t} onClick={() => onMoveVariant(version.id, t)}>
              Move to {getTypeLabel(t)}
            </ContextMenuItem>
          ))}
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => setDeleteDialog({ id: version.id, title: version.title })}
        >
          Remove
        </ContextMenuItem>
      </>
    )
  }

  const handleRenameSubmit = () => {
    if (renameDialog && renameDialog.title.trim()) {
      onRenameVariant(renameDialog.id, renameDialog.title.trim())
      setRenameDialog(null)
    }
  }

  const renderVersionButton = (version: Version, showTitle: boolean) => {
    const isActive = version.id === activeVersion

    if (showTitle) {
      return (
        <ContextMenu key={version.id}>
          <ContextMenuTrigger asChild>
            <button
              onClick={() => onVersionChange(version.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <span className="font-mono text-sm">{version.id}</span>
              <span className="text-xs text-muted-foreground truncate flex-1">
                {version.title}
              </span>
            </button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {renderContextMenuItems(version)}
          </ContextMenuContent>
        </ContextMenu>
      )
    }

    return (
      <ContextMenu key={version.id}>
        <ContextMenuTrigger asChild>
          <button
            onClick={() => onVersionChange(version.id)}
            className={cn(
              "w-full flex flex-col items-center py-2 transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground font-medium"
            )}
          >
            <span className="font-mono text-xs">{version.id}</span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {renderContextMenuItems(version)}
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full border-l bg-muted/50 dark:bg-black/95">
        <div className="px-3 py-2 border-b flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            title="Expand panel"
            className="h-8 w-8"
          >
            <SquareChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="py-2">
            {versions.map((version) => renderVersionButton(version, false))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border-l bg-muted/50 dark:bg-black/95">
      <div className="px-3 py-2 border-b flex items-center justify-between shrink-0">
        <div className="pl-2">
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          title="Collapse panel"
          className="text-muted-foreground h-8 w-8"
        >
          <SquareChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1">
          <CollapsibleSection
            title="Final"
            count={finalVersions.length}
            isExpanded={expandedSections.final}
            onToggle={() => toggleSection("final")}
          >
            <div className="px-2 pb-2">
              {finalVersions.length > 0 ? (
                finalVersions.map((version) => renderVersionButton(version, true))
              ) : (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  No final versions yet
                </p>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Pages"
            count={pageVersions.length}
            isExpanded={expandedSections.page}
            onToggle={() => toggleSection("page")}
          >
            <div className="px-2 pb-2">
              {pageVersions.map((version) => renderVersionButton(version, true))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Elements"
            count={elementVersions.length}
            isExpanded={expandedSections.element}
            onToggle={() => toggleSection("element")}
          >
            <div className="px-2 pb-2">
              {elementVersions.length > 0 ? (
                elementVersions.map((version) => renderVersionButton(version, true))
              ) : (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  No elements yet
                </p>
              )}
            </div>
          </CollapsibleSection>
        </div>
      </ScrollArea>

      <div className="border-t p-2 shrink-0">
        <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
        <Textarea
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          onBlur={handleBlur}
          placeholder="Add notes about this version..."
          className="min-h-[100px] resize-none"
        />
      </div>

      <div className="border-t py-3 flex justify-center shrink-0">
        <ViewportSelector value={viewport} onChange={onViewportChange} />
      </div>

      <Dialog open={renameDialog !== null} onOpenChange={(open) => !open && setRenameDialog(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename variant</DialogTitle>
          </DialogHeader>
          <Input
            value={renameDialog?.title ?? ""}
            onChange={(e) => setRenameDialog((prev) => prev ? { ...prev, title: e.target.value } : null)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
            placeholder="Enter new name..."
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog !== null} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Remove variant</DialogTitle>
            <DialogDescription>
              This will permanently delete "{deleteDialog?.title}" and its component file from the codebase. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog) {
                  onRemoveVariant(deleteDialog.id)
                  setDeleteDialog(null)
                }
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
