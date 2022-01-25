import { ImportService } from '../data-import/import.service'
import { Logger } from '../logger/logger'
import { PortalStore } from './portal.store'
import { PortalModel } from './portal.model'
import moment = require('moment')

const fs = require('fs')
const parse = require('csv-parse/lib/sync')

/**
 * Test command for function console:
 * ```
 * dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com',
    id: 'gs://dataraise-retailplugin.appspot.com/data-files/portal-retailers/PortalRetailers.csv',
    kind: 'storage#object', size: '154b', storageClass: 'data', timeCreated: '2002-10-02T10:00:00-05:00',
    name: 'data-files/portal-retailers/PortalRetailers.csv', contentType: 'text/csv' })
 * ```
 */

const VAL_COL = 6
const COL = {
  category: 0,
  portal: 1,
  retailer: 2,
  portalLink: 3,
  type: 4,
  featured: 5
}

export class PortalImportService implements ImportService {
  constructor(
      protected store: PortalStore,
      protected logger: Logger
  ) {}

  public async importCSV(filepath: string): Promise<void> {
    const importStartDate = new Date()
    const content = fs.readFileSync(filepath)
    const records = parse(content, {
      trim: true,
      skip_lines_with_error: true,
      skip_lines_with_empty_values: true
    }) as string[][]

    const retailers = records.slice(2).map((r) => this.mapToRetailer(r, records[1]))
    this.logger.info('All retailer mapped')

    const pageSize = 1000
    for (let i = 0; i < retailers.length; i += pageSize) {
      await Promise.all(retailers.slice(i, i + pageSize).map((retailer) => this.store.updatePortalRetailer(retailer)))
      this.logger.info('Saved ' + ( i + pageSize ) + ' retailers')
    }
    this.logger.info('All retailers saved')

    const oldRetailer = await this.store.lookupPortalRetailersOlderThanDate(importStartDate)
    await Promise.all(oldRetailer.map(async (old) => {
      this.logger.debug('Deleting old record: ' + old.id)
      await this.store.deletePortalRetailer(old.id)
    }))
    this.logger.info('Removed ' + oldRetailer.length + ' retailers')
  }

  protected mapToRetailer(record: string[], headers: string[]): PortalModel {
    this.logger.info('Mapping: ' + record[COL.retailer] + ' @ ' + record[COL.portal])

    const portalValue = {
      categories: record[COL.category].split(',').map((t) => t.trim()),
      portal: record[COL.portal],
      retailer: record[COL.retailer],
      url: record[COL.portalLink],
      type: record[COL.type] === 'miles' ? 'miles' : 'pts',
      featured: record[COL.featured] === 'TRUE'
    }

    const dataPoints = record.slice(VAL_COL)
        .map((value, index) => ( {
          value: parseFloat(value),
          date: moment(headers[index + VAL_COL], 'M/D/YYYY').add(5, 'hours').toDate()
        } ))

    const model = PortalModel.init(portalValue)
    model.updateDataValues(dataPoints)

    return model
  }
}
