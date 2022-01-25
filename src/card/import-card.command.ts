import { CardStore } from './card-store'
import { Logger } from '../logger/logger'
import { CardValue } from './card.value'

export class ImportCardCommand {
  constructor(
      protected store: CardStore,
      protected logger: Logger
  ) {}

  public async execute(card: CardValue) {
    const cardId = await this.store.lookupCardIdByCardName(card.name, true)
    await this.store.updateCard({ ...card, id: cardId })

    this.logger.debug('Saved card information', { card, cardId })
    card.id = cardId
  }
}
