import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ThemeToggle } from "./ThemeToggle"
import { ViewportSelector, type ViewportSize } from "./ViewportSelector"

interface HeaderProps {
  activeVersion: string
  onVersionChange: (version: string) => void
  viewport: ViewportSize
  onViewportChange: (viewport: ViewportSize) => void
  versions: { id: string; title: string }[]
}

export function Header({
  activeVersion,
  onVersionChange,
  viewport,
  onViewportChange,
  versions,
}: HeaderProps) {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <ScrollArea className="max-w-[60vw]">
          <Tabs value={activeVersion} onValueChange={onVersionChange}>
            <TabsList className="inline-flex w-max">
              {versions.map((version) => (
                <TabsTrigger key={version.id} value={version.id} title={version.title}>
                  {version.id}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="flex items-center gap-4 shrink-0">
          <ViewportSelector value={viewport} onChange={onViewportChange} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
