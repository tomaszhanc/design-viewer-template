import { Smartphone, Tablet, Monitor, Maximize } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type ViewportSize = "mobile" | "tablet" | "desktop" | "full"

interface ViewportSelectorProps {
  value: ViewportSize
  onChange: (value: ViewportSize) => void
}

const viewports: { value: ViewportSize; label: string; width: string; icon: React.ReactNode }[] = [
  { value: "mobile", label: "Mobile", width: "375px", icon: <Smartphone className="h-4 w-4" /> },
  { value: "tablet", label: "Tablet", width: "768px", icon: <Tablet className="h-4 w-4" /> },
  { value: "desktop", label: "Desktop", width: "1280px", icon: <Monitor className="h-4 w-4" /> },
  { value: "full", label: "Full", width: "100%", icon: <Maximize className="h-4 w-4" /> },
]

export function ViewportSelector({ value, onChange }: ViewportSelectorProps) {
  const selected = viewports.find((v) => v.value === value)

  return (
    <Select value={value} onValueChange={(v) => onChange(v as ViewportSize)}>
      <SelectTrigger className="w-[160px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            {selected?.icon}
            <span>{selected?.label}</span>
            <span className="text-muted-foreground text-xs">({selected?.width})</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {viewports.map((viewport) => (
          <SelectItem key={viewport.value} value={viewport.value}>
            <div className="flex items-center gap-2">
              {viewport.icon}
              <span>{viewport.label}</span>
              <span className="text-muted-foreground text-xs">({viewport.width})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
