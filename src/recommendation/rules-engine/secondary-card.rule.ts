import { Rule } from './rule'
import { RecommendationModel } from '../recommendation.model'
import { CardValue } from '../../card/card.value'

export class SecondaryCardRule extends Rule {
  protected type = 'SECONDARY_CARD'

  public apply(recommendation: RecommendationModel, wallet: CardValue[]) {
    const meta = recommendation.getValue().meta
    if (!meta || !meta.walletMustAlsoContain) {
      return
    }

    const secondaryCardIds = meta.walletMustAlsoContain
    const walletCardIds = wallet.map((card: CardValue) => card.id)

    for (const secondaryCardId of secondaryCardIds) {
      if (secondaryCardId && !walletCardIds.includes(secondaryCardId)) {
        recommendation.addError({ error: 'Secondary Card Not Present: ' + secondaryCardId, type: this.type })
      }
    }
  }
}
