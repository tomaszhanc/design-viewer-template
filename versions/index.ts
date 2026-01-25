import type { ComponentType } from "react"

export type VariantType = "final" | "page" | "element"

export interface Version {
  id: string
  title: string
  type: VariantType
  component: ComponentType
}

export const versions: Version[] = [
]
