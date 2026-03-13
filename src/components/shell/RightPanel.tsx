import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SquareChevronLeft, SquareChevronRight, Check, X, Circle, ChevronDown, ChevronRight } from "lucide-react"
import { ViewportSelector, type ViewportSize } from "./ViewportSelector"
import { ThemeToggle } from "./ThemeToggle"
import type { VariantStatus } from "@/App"

interface Version {
  id: string
  title: string
}

interface RightPanelProps {
  versions: Version[]
  activeVersion: string
  onVersionChange: (id: string) => void
  onStatusChange: (id: string, status: VariantStatus, comment?: string) => void
  notesMap: Record<string, { notes?: string; status?: VariantStatus; statusUpdatedAt?: string }>
  onNotesChange: (notes: string) => void
  viewport: ViewportSize
  onViewportChange: (viewport: ViewportSize) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const REJECTION_REASONS = [
  "Layout doesn't fit this type of app",
  "Too noisy, looks messy",
  "Dark mode is too dark",
  "Colors don't work together",
  "Spacing feels off",
  "Typography needs work",
]

export function RightPanel({
  versions,
  activeVersion,
  onVersionChange,
  onStatusChange,
  notesMap,
  onNotesChange,
  viewport,
  onViewportChange,
  isCollapsed,
  onToggleCollapse,
}: RightPanelProps) {
  const [localNotes, setLocalNotes] = useState(notesMap[activeVersion]?.notes ?? "")
  const [statusDialog, setStatusDialog] = useState<{
    id: string
    title: string
    action: "approved" | "rejected"
  } | null>(null)
  const [statusComment, setStatusComment] = useState("")
  const [reviewedExpanded, setReviewedExpanded] = useState(false)

  const getStatus = (id: string): VariantStatus => notesMap[id]?.status ?? "pending"

  const pendingVersions = versions.filter((v) => getStatus(v.id) === "pending")
  const reviewedVersions = versions.filter((v) => getStatus(v.id) !== "pending")

  useEffect(() => {
    setLocalNotes(notesMap[activeVersion]?.notes ?? "")
  }, [notesMap, activeVersion])

  const handleBlur = useCallback(() => {
    if (localNotes !== (notesMap[activeVersion]?.notes ?? "")) {
      onNotesChange(localNotes)
    }
  }, [localNotes, notesMap, activeVersion, onNotesChange])

  const statusIcon = (id: string) => {
    const status = getStatus(id)
    if (status === "approved") return <Check className="h-3 w-3 text-green-500 shrink-0" />
    if (status === "rejected") return <X className="h-3 w-3 text-red-500 shrink-0" />
    return <Circle className="h-3 w-3 text-muted-foreground/40 shrink-0" />
  }

  const openStatusDialog = (id: string, title: string, action: "approved" | "rejected") => {
    setStatusDialog({ id, title, action })
    setStatusComment(notesMap[id]?.notes ?? "")
  }

  const handleStatusSubmit = () => {
    if (statusDialog) {
      onStatusChange(statusDialog.id, statusDialog.action, statusComment || undefined)
      setStatusDialog(null)
      setStatusComment("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleStatusSubmit()
    }
  }

  const renderContextMenuItems = (version: Version) => {
    const currentStatus = getStatus(version.id)
    return (
      <>
        {currentStatus !== "approved" && (
          <ContextMenuItem onClick={() => openStatusDialog(version.id, version.title, "approved")}>
            Approve
          </ContextMenuItem>
        )}
        {currentStatus !== "rejected" && (
          <ContextMenuItem onClick={() => openStatusDialog(version.id, version.title, "rejected")}>
            Reject
          </ContextMenuItem>
        )}
      </>
    )
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
              {statusIcon(version.id)}
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
            {statusIcon(version.id)}
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
            {[...pendingVersions, ...reviewedVersions].map((version) => renderVersionButton(version, false))}
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
          {pendingVersions.length > 0 && (
            <div>
              {reviewedVersions.length > 0 && (
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                  Pending ({pendingVersions.length})
                </div>
              )}
              <div className="px-2">
                {pendingVersions.map((version) => renderVersionButton(version, true))}
              </div>
            </div>
          )}

          {reviewedVersions.length > 0 && (
            <Collapsible open={reviewedExpanded} onOpenChange={setReviewedExpanded}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/50 transition-colors">
                {reviewedExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                Reviewed ({reviewedVersions.length})
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-2 pb-1">
                  {reviewedVersions.map((version) => renderVersionButton(version, true))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
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

      <Dialog open={statusDialog !== null} onOpenChange={(open) => !open && setStatusDialog(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {statusDialog?.action === "approved" ? "Approve" : "Reject"} variant
            </DialogTitle>
            <DialogDescription>
              Add an optional comment for this decision.
            </DialogDescription>
          </DialogHeader>

          {statusDialog?.action === "rejected" && (
            <div className="flex flex-wrap gap-1.5">
              {REJECTION_REASONS.map((reason) => (
                <Button
                  key={reason}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setStatusComment((prev) => prev ? `${prev}\n${reason}` : reason)}
                >
                  {reason}
                </Button>
              ))}
            </div>
          )}

          <Textarea
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            className="min-h-[80px]"
            autoFocus
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={statusDialog?.action === "rejected" ? "destructive" : "default"}
              onClick={handleStatusSubmit}
            >
              {statusDialog?.action === "approved" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
