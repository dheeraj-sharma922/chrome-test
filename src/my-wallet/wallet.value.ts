export interface WalletValue {
  walletId: string
  cardIds: string[]
  loyaltyIds: Array<{
    portal_id: string,
    status: number
  }>
}
