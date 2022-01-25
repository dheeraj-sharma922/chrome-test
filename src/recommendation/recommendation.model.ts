import { RecommendationValue } from './recommendation.value'
import { CardValue } from '../card/card.value'
import { RuleErrorValue } from './rules-engine/rule-error.value'

export class RecommendationModel {
  protected constructor(
      protected value: RecommendationValue,
      protected card: CardValue,
      protected errors: RuleErrorValue[] = []) {}

  public static init(value: RecommendationValue, card: CardValue): RecommendationModel {
    return new RecommendationModel(value, card)
  }

  public isValid() {
    return this.errors.length === 0
  }

  public addError(error: RuleErrorValue) {
    this.errors.push(error)
  }

  public getValue(): RecommendationValue {
    return this.value
  }

  public getErrors(): RuleErrorValue[] {
    return this.errors
  }

  public getCard(): CardValue {
    return this.card
  }

  public equals(other: RecommendationModel | undefined) {
    if (other === undefined) {
      return false
    }

    return other.getValue().id === this.getValue().id
  }
}
