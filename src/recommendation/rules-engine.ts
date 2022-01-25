import { Rule } from './rules-engine/rule'
import { DateRangeRule } from './rules-engine/date-range.rule'
import { SecondaryCardRule } from './rules-engine/secondary-card.rule'
import { CardValue } from '../card/card.value'
import { RecommendationModel } from './recommendation.model'

export class RulesEngine {
  constructor(
      protected rules: Rule[] = [ new DateRangeRule(), new SecondaryCardRule() ]
  ) {}

  public apply(recommendation: RecommendationModel, walletCards: CardValue[]) {
    for (const rule of this.rules) {
      rule.apply(recommendation, walletCards)
    }
  }

  public rank(recommendations: RecommendationModel[]) {
    recommendations.sort((a, b) => {
      return b.getValue().return - a.getValue().return
    })
  }

  public dedupe(recommendations: RecommendationModel[]) {
    recommendations.forEach((recommendation, index) => {
      if (!recommendation.isValid()) {
        return
      }

      const lowestIndex = recommendations.findIndex((r) => r.getCard().id === recommendation.getCard().id && r.isValid())
      if (lowestIndex !== index) {
        recommendation.addError({ error: 'Higher Valid Recommendation Exists for Same Card', type: 'DUPLICATE' })
      }
    })
  }
}
