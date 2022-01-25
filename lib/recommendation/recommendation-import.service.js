"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationImportService = void 0;
const moment = require("moment");
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
/**
 * Test command for function console:
 * ```
 * dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com',
    id: 'gs://dataraise-retailplugin.appspot.com/data-files/card-value/Backend Templates - Card Value.csv',
    kind: 'storage#object', size: '542b', storageClass: 'data', timeCreated: '2002-10-02T10:00:00-05:00',
    name: 'data-files/card-value/Backend Templates - Card Value.csv', contentType: 'text/csv' })
 * ```
 */
class RecommendationImportService {
    constructor(store, cardStore, logger) {
        this.store = store;
        this.cardStore = cardStore;
        this.logger = logger;
    }
    async importCSV(filepath) {
        const content = fs.readFileSync(filepath);
        const records = parse(content, {
            columns: true,
            trim: true,
            skip_lines_with_error: true,
            skip_lines_with_empty_values: true
        });
        records.forEach((record) => {
            for (const key of Object.keys(record)) {
                record[key.trim()] = record[key];
            }
        });
        const importStartDate = new Date();
        const cardNames = this.extractCardNames(records);
        const cards = await Promise.all(cardNames.map(async (cardName) => this.mapToCard(cardName)));
        await Promise.all(records.map(async (record) => {
            const recommendation = await this.mapToRecommendation(record, cards);
            if (recommendation) {
                await this.store.updateRecommendation(recommendation);
            }
            this.logger.debug('Updated recommendation information', Object.assign(Object.assign({}, record), recommendation));
        }));
        const oldRecommendations = await this.store.lookupRecommendationsOlderThanDate(importStartDate);
        await Promise.all(oldRecommendations.map(async (old) => {
            this.logger.debug('Deleting old record', { old });
            await this.store.deleteRecommendation(old.id);
        }));
    }
    extractCardNames(importRecords) {
        return importRecords.map((record) => record['Credit Card']);
    }
    async mapToCard(cardName) {
        return this.cardStore.lookupCardByCardName(cardName);
    }
    async mapToRecommendation(importRecord, cards) {
        const cardId = this.lookupCardId(importRecord['Credit Card'], cards);
        if (!cardId) {
            this.logger.error('Card not found during import', importRecord);
            return;
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
        };
    }
    lookupAdditionalWalletCardIds(walletCardNames, cards) {
        const cardNames = walletCardNames.split(';').map((s) => s.trim()).filter(Boolean);
        if (!cardNames.length) {
            return undefined;
        }
        return cardNames.map(cardName => this.lookupCardId(cardName, cards)).filter(Boolean);
    }
    lookupCardId(cardName, cards) {
        return (cards.find((c) => c.name === cardName) || { id: undefined }).id;
    }
}
exports.RecommendationImportService = RecommendationImportService;
//# sourceMappingURL=recommendation-import.service.js.map