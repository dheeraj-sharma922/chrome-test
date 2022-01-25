import { RecommendationModel } from '../recommendation.model'
import { CardValue } from '../../card/card.value'

export abstract class Rule {
  public abstract apply(recommendation: RecommendationModel, wallet: CardValue[]): void;
}
