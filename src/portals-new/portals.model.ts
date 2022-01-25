import { PortalsValue } from './portals.value'
import { PortalHistoryDateValue} from '../portal/portal-history.value'
import moment = require('moment')

export class PortalsModel {
  protected constructor(protected value: PortalsValue) {}

  static init(value: PortalsValue) {
    return new PortalsModel(value)
  }

  get data() { return this.value }

  public get id() { return this.value.id }
  public get name() { return this.value.name }

  public updateDataValues(values: PortalHistoryDateValue[]) {
    const now = moment().toDate()
    const validValues = values.filter((v) => v.date.getTime() < now.getTime())

    let latestRecord = validValues[0]
    for (const record of validValues) {
      if (( record.date.getTime() > latestRecord.date.getTime() && !isNaN(record.value) ) || isNaN(latestRecord.value)) {
        latestRecord = record
      }
    }
    this.value.updatedAt = latestRecord.date
  }

}
