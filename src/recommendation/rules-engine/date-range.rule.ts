import { Rule } from './rule'
import { CardValue } from '../../card/card.value'
import { RecommendationModel } from '../recommendation.model'
import moment = require('moment')

export class DateRangeRule extends Rule {
  protected type = 'DATE_RANGE'

  public apply(recommendation: RecommendationModel, wallet: CardValue[]) {
    const meta = recommendation.getValue().meta
    if (!meta) {
      return
    }

    // @ts-ignore
    const startDate = moment(meta.startDate && meta.startDate.toDate())
    // @ts-ignore
    const endDate = moment(meta.endDate && meta.endDate.toDate())
    const now = moment()

    if (meta.startDate && now.isBefore(startDate)) {
      recommendation.addError({ error: 'Before start date: ' + startDate.format('M/D/Y'), type: this.type })
    }

    if (meta.endDate && now.isAfter(endDate)) {
      recommendation.addError({ error: 'After end date: ' + endDate.format('M/D/Y'), type: this.type })
    }
  }
}
