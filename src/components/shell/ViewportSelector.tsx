import { Smartphone, Tablet, Monitor, Maximize } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type ViewportSize = "mobile" | "tablet" | "desktop" | "full"

interface ViewportSelectorProps {
  value: ViewportSize
  onChange: (value: ViewportSize) => void
}

const viewports: { value: ViewportSize; label: string; icon: React.ReactNode }[] = [
  { value: "mobile", label: "Mobile (375px)", icon: <Smartphone className="h-4 w-4" /> },
  { value: "tablet", label: "Tablet (768px)", icon: <Tablet className="h-4 w-4" /> },
  { value: "desktop", label: "Desktop (1280px)", icon: <Monitor className="h-4 w-4" /> },
  { value: "full", label: "Full width", icon: <Maximize className="h-4 w-4" /> },
]

export function ViewportSelector({ value, onChange }: ViewportSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as ViewportSize)}
      variant="outline"
    >
      {viewports.map((viewport) => (
        <ToggleGroupItem
          key={viewport.value}
          value={viewport.value}
          aria-label={viewport.label}
          title={viewport.label}
        >
          {viewport.icon}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export function getViewportWidth(viewport: ViewportSize): string {
  switch (viewport) {
    case "mobile":
      return "375px"
    case "tablet":
      return "768px"
    case "desktop":
      return "1280px"
    case "full":
      return "100%"
  }
}
