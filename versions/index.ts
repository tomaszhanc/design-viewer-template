import type { ComponentType } from "react"

export type VariantType = "final" | "page" | "element"

export const versions: { id: string; title: string; type: VariantType; component: ComponentType }[] = []
