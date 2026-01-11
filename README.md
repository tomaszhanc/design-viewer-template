# Design Viewer Template

A simple React template for viewing and comparing multiple design versions side by side.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- shadcn/ui components

## Getting Started

```bash
pnpm install
pnpm dev
```

## Adding Versions

1. Create a new file in `versions/`: `Version{NN}.tsx` (e.g., `Version01.tsx`)

```tsx
export function Version01() {
  return (
    <div className="p-6">
      {/* Your mockup here */}
    </div>
  )
}
```

2. Register it in `versions/index.ts`:

```tsx
import { Version01 } from "./Version01"

export const versions: { id: string; component: ComponentType }[] = [
  { id: "v1", component: Version01 },
]
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
