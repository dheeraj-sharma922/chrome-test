export interface RecommendationValue {
  id: string
  cardId: string,
  category: string,
  return: number,
  messagePrimary: string,
  messageSecondary?: string,
  announcementPrimary?: string
  announcementSecondary?: string
  meta?: {
    startDate?: Date,
    endDate?: Date,
    walletMustAlsoContain?: string[]
  }
}
