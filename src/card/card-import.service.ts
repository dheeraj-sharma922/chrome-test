import { CardStore } from './card-store'
import { ImportService } from '../data-import/import.service'
import { Logger } from '../logger/logger'
import { CardValue } from './card.value'
import { ImportCardCommand } from './import-card.command'

const fs = require('fs')
const parse = require('csv-parse/lib/sync')

interface CardImportRecord {
  'Rank': string,
  'Credit Card': string
  'Image File Name': string
  'Url': string
}

/**
 * Test command for function console:
 * ```
 * dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com',
    id: 'gs://dataraise-retailplugin.appspot.com/data-files/credit-cards/Backend Templates - Credit Cards.csv',
    kind: 'storage#object', size: '99b', storageClass: 'data', timeCreated: '2002-10-02T10:00:00-05:00',
    name: 'data-files/credit-cards/Backend Templates - Credit Cards.csv', contentType: 'text/csv' })
 * ```
 */

export class CardImportService implements ImportService {
  constructor(protected store: CardStore, protected logger: Logger) {}

  public async importCSV(filepath: string): Promise<void> {
    const content = fs.readFileSync(filepath)
    const records = parse(content, {
      columns: true,
      trim: true,
      skip_lines_with_error: true,
      skip_lines_with_empty_values: true
    })

    records.forEach((record: any) => {
      for (const key of Object.keys(record)) {
        record[key.trim()] = record[key]
      }
    })

    const importCommand = new ImportCardCommand(this.store, this.logger)

    await Promise.all(records.map(async (record: CardImportRecord) => {
      const card = await this.mapToCardValue(record)
      await importCommand.execute(card)

      this.logger.debug('Updated card information', { ...record, ...card })
    }))
  }

  protected async mapToCardValue(importRecord: CardImportRecord): Promise<CardValue> {
    return {
      id: '',
      rank: parseFloat(importRecord['Rank']) || -1,
      name: importRecord['Credit Card'],
      img: importRecord['Image File Name'],
      url: importRecord['Url']
    }
  }
}
