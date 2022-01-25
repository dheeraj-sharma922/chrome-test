export interface RetailerValue {
  id: string
  host: string
  alternateHosts: string[],
  cartPageRegex: string
  default: {
    category: string
  },
  overrides: Array<{
    cardId: string
    category: string
  }>
}
