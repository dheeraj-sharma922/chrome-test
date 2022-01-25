import { ImportService } from '../data-import/import.service'
import { Logger } from '../logger/logger'
import { PortalsStore } from './portals.store'
import { PortalsModel } from './portals.model'
// import moment = require('moment')

const fs = require('fs')
const parse = require('csv-parse/lib/sync')

// import { v4 as uuid } from 'uuid'
/**
 * Test command for function console:
 * ```
 * dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com',
    id: 'gs://dataraise-retailplugin.appspot.com/data-files/portal-retailers/PortalRetailers.csv',
    kind: 'storage#object', size: '154b', storageClass: 'data', timeCreated: '2002-10-02T10:00:00-05:00',
    name: 'data-files/portal-retailers/PortalRetailers.csv', contentType: 'text/csv' })
 * ```
 */

// const VAL_COL = 6
const COL = {
  name: 0,
  image: 1,
  url: 2,
  rank: 3
}

export class PortalsImportService implements ImportService {
  constructor(
      protected store: PortalsStore,
      protected logger: Logger
  ) {}

  public async importCSV(filepath: string): Promise<void> {
 
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
    }
    this.logger.info('All retailers saved')

  }

  protected mapToRetailer(record: string[], headers: string[]): PortalsModel {

    const portalValue = {
      id: '',
      name: record[COL.name] ? record[COL.name] : 'test',
      img: record[COL.image] ? record[COL.image] : 'image test',
      url: record[COL.url]? record[COL.url] : 'test url',
      rank: record[COL.rank]? parseInt(record[COL.rank]) : 1
    }

    const model = PortalsModel.init(portalValue)

    return model
  }
}
