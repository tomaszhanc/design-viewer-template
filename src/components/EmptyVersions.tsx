import { FileCode2 } from "lucide-react"

export function EmptyVersions() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-8">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <FileCode2 className="size-8 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">No versions yet</h2>
          <p className="text-sm text-muted-foreground">
            Create your first mockup by adding a component to the versions folder.
          </p>
        </div>

        <div className="w-full rounded-lg border bg-muted/50 p-4 text-left">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            versions/Version01.tsx
          </p>
          <pre className="text-sm font-mono text-foreground/80 overflow-x-auto">
{`export function Version01() {
  return (
    <div className="p-6">
      {/* Your mockup here */}
    </div>
  )
}`}
          </pre>
        </div>

        <p className="text-xs text-muted-foreground">
          Then export it in <code className="font-mono bg-muted px-1 py-0.5 rounded">versions/index.ts</code>
        </p>
      </div>
    </div>
  )
}