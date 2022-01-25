import { PortalValue } from './portal.value'
import { PortalHistoryDateValue, PortalHistoryValue } from './portal-history.value'
import moment = require('moment')

export class PortalModel {
  protected constructor(protected value: PortalValue) {}

  static init(value: PortalValue) {
    return new PortalModel(value)
  }

  get data() { return this.value }

  get id() { return this.value.retailer.replace('/', '') + ' @ ' + this.value.portal }

  public updateDataValues(values: PortalHistoryDateValue[]) {
    const now = moment().toDate()
    const validValues = values.filter((v) => v.date.getTime() < now.getTime())

    this.value.week = this.extractDistributedDateValues(validValues, moment().subtract(1, 'week').toDate(), 7)
    this.value.month = this.extractDistributedDateValues(validValues, moment().subtract(1, 'month').toDate(), 8)
    this.value.halfyear = this.extractDistributedDateValues(validValues, moment().subtract(6, 'months').toDate(), 12)
    this.value.year = this.extractDistributedDateValues(validValues, moment().subtract(12, 'months').toDate(), 24)

    let latestRecord = validValues[0]
    for (const record of validValues) {
      if (( record.date.getTime() > latestRecord.date.getTime() && !isNaN(record.value) ) || isNaN(latestRecord.value)) {
        latestRecord = record
      }
    }

    this.value.updatedAt = latestRecord.date
    this.value.value = latestRecord.value
  }

  protected extractDistributedDateValues(values: PortalHistoryDateValue[], start: Date, dataElements: number): PortalHistoryValue {
    const applicableValues = values.filter((v) => v.date.getTime() > start.getTime())

    const numbers = applicableValues.map((v) => v.value)
        .filter((v) => !isNaN(v))
        .filter((v) => v !== 0)

    const high = Math.max(...numbers)
    const low = Math.min(...numbers)
    const average = numbers.reduce((t, c) => t + c, 0) / numbers.length

    const data = []
    for (let i = 0; i < applicableValues.length; i += Math.ceil(applicableValues.length / dataElements)) {
      data.push(applicableValues[i])
    }

    // make sure the last value is always the latest value
    data[data.length - 1] = applicableValues[applicableValues.length - 1]

    return { high, low, average, data }
  }
}
