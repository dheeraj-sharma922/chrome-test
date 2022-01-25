import { ImportService } from '../data-import/import.service'
import { Logger } from '../logger/logger'
import { RecommendationStore } from './recommendation.store'
import { CardStore } from '../card/card-store'
import { RecommendationValue } from './recommendation.value'
import { CardValue } from '../card/card.value'
import moment = require('moment')

const fs = require('fs')
const parse = require('csv-parse/lib/sync')

interface RecommendationImportRecord {
  'Credit Card': string
  'Category': string
  'Return': string
  'Primary Message': string
  'Secondary Message': string
  'Effective Start Date': string
  'Effective End Date': string
  'Wallet Contains': string
  'Announcement Primary': string
  'Announcement Secondary': string
}

/**
 * Test command for function console:
 * ```
 * dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com',
    id: 'gs://dataraise-retailplugin.appspot.com/data-files/card-value/Backend Templates - Card Value.csv',
    kind: 'storage#object', size: '542b', storageClass: 'data', timeCreated: '2002-10-02T10:00:00-05:00',
    name: 'data-files/card-value/Backend Templates - Card Value.csv', contentType: 'text/csv' })
 * ```
 */

export class RecommendationImportService implements ImportService {
  constructor(protected store: RecommendationStore, protected cardStore: CardStore, protected logger: Logger) {}

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

    const importStartDate = new Date()

    const cardNames = this.extractCardNames(records)
    const cards = await Promise.all(cardNames.map(async (cardName) => this.mapToCard(cardName)))

    await Promise.all(records.map(async (record: RecommendationImportRecord) => {

      const recommendation = await this.mapToRecommendation(record, cards)
      if (recommendation) {
        await this.store.updateRecommendation(recommendation)
      }

      this.logger.debug('Updated recommendation information', { ...record, ...recommendation })
    }))

    const oldRecommendations = await this.store.lookupRecommendationsOlderThanDate(importStartDate)
    await Promise.all(oldRecommendations.map(async (old) => {
      this.logger.debug('Deleting old record', { old })
      await this.store.deleteRecommendation(old.id)
    }))
  }

  protected extractCardNames(importRecords: RecommendationImportRecord[]) {
    return importRecords.map((record: RecommendationImportRecord) => record['Credit Card'])
  }

  protected async mapToCard(cardName: string): Promise<CardValue> {
    return this.cardStore.lookupCardByCardName(cardName)
  }

  protected async mapToRecommendation(importRecord: RecommendationImportRecord, cards: CardValue[]): Promise<RecommendationValue | undefined> {
    const cardId = this.lookupCardId(importRecord['Credit Card'], cards)

    if (!cardId) {
      this.logger.error('Card not found during import', importRecord)
      return
    }

    return {
      id: '',
      cardId,
      category: importRecord.Category,
      return: parseFloat(importRecord.Return),
      messagePrimary: importRecord['Primary Message'],
      messageSecondary: importRecord['Secondary Message'],
      announcementPrimary: importRecord['Announcement Primary'],
      announcementSecondary: importRecord['Announcement Secondary'],
      meta: {
        startDate: importRecord['Effective Start Date'] ? moment(importRecord['Effective Start Date']).toDate() : undefined,
        endDate: importRecord['Effective End Date'] ? moment(importRecord['Effective End Date']).toDate() : undefined,
        walletMustAlsoContain: this.lookupAdditionalWalletCardIds(importRecord['Wallet Contains'], cards)
      }
    }
  }

  protected lookupAdditionalWalletCardIds(walletCardNames: string, cards: CardValue[]): string[] | undefined {
    const cardNames = walletCardNames.split(';').map((s: string) => s.trim()).filter(Boolean)
    if (!cardNames.length) {
      return undefined
    }

    return cardNames.map(cardName => this.lookupCardId(cardName, cards)).filter(Boolean) as string[]
  }

  protected lookupCardId(cardName: string, cards: CardValue[]) {
    return ( cards.find((c) => c.name === cardName) || { id: undefined } ).id
  }
}
