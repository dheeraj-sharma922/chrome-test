import { PortalsRecommValue } from './portals-recomm.value'
import { PortalHistoryDateValue} from '../portal/portal-history.value'
import moment = require('moment')

export class PortalsRecommModel {
  protected constructor(protected value: PortalsRecommValue) {}

  static init(value: PortalsRecommValue) {
    return new PortalsRecommModel(value)
  }

  get data() { return this.value }

  public get id() { return this.value.id }

  public updateDataValues(values: PortalHistoryDateValue[]) {
    const now = moment().toDate()
    const validValues = values.filter((v) => v.date.getTime() < now.getTime())

    let latestRecord = validValues[0]
    for (const record of validValues) {
      if (( record.date.getTime() > latestRecord.date.getTime() && !isNaN(record.value) ) || isNaN(latestRecord.value)) {
        latestRecord = record
      }
    }
    console.log("latestRecord.date--->", latestRecord.date)
    this.value.updatedAt = latestRecord.date
  }
}
