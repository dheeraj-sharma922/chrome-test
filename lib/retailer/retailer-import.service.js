"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetailerImportService = void 0;
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
/**
 * Test command for function console:
 * ```
 * dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com',
    id: 'gs://dataraise-retailplugin.appspot.com/data-files/retail-classification/Backend Templates - Retail
     Classification.csv',
    kind: 'storage#object', size: '154b', storageClass: 'data', timeCreated: '2002-10-02T10:00:00-05:00',
    name: 'data-files/retail-classification/Backend Templates - Retail Classification.csv', contentType: 'text/csv' })
 * ```
 */
const HOST_COL = 1;
const ALT_HOST_COL = 2;
const CART_REGEX_COL = 3;
const CARD_START_COL = 5;
const HEADER_ROW = 1;
class RetailerImportService {
    constructor(store, cardStore, configStore, logger) {
        this.store = store;
        this.cardStore = cardStore;
        this.configStore = configStore;
        this.logger = logger;
    }
    async importCSV(filepath) {
        const importStartDate = new Date();
        const defaultCategory = (await this.configStore.getValue('retailer-recommendation')).defaultCategory;
        // parse the file
        const records = this.parseFile(filepath);
        // import all the cards
        const cardNames = this.extractCardNames(records);
        const cards = await Promise.all(cardNames.map(async (cardName) => this.mapToCard(cardName)));
        /// map retailers
        const hostNames = this.extractHostNames(records);
        const retailers = await Promise.all(hostNames.map(async (host) => {
            const retailer = await this.store.initRetailer(host.name);
            retailer.setDefault({ category: defaultCategory });
            retailer.setAlternateHosts(this.extractAlternateHostNames(records[host.index]));
            retailer.setCartPageRegex(this.extractCartPageRegex(records[host.index]));
            // map overrides by card
            for (let col = CARD_START_COL; col < records[host.index].length; col++) {
                const cardName = this.extractCardName(records, col);
                const card = cards.find((c) => c.name === cardName);
                if (!card) {
                    this.logger.error('Unknown card for retailer', { host, cardName });
                    continue;
                }
                const cardCategory = records[host.index][col];
                if (cardCategory.length > 0) {
                    retailer.setOverride({ cardId: card.id, category: cardCategory });
                }
            }
            this.logger.debug('Retailer processed', retailer.serialize());
            return retailer;
        }));
        // save retailers
        this.logger.debug('Processing complete, storing retailers');
        await Promise.all(retailers.map(async (retailer) => {
            await this.store.updateRetailer(retailer);
        }));
        // clear old retailers
        const oldRetailer = await this.store.lookupRetailersOlderThanDate(importStartDate);
        await Promise.all(oldRetailer.map(async (old) => {
            this.logger.debug('Deleting old record', { old });
            await this.store.deleteRetailer(old.id);
        }));
    }
    parseFile(filepath) {
        const content = fs.readFileSync(filepath);
        return parse(content, {
            trim: true,
            skip_lines_with_error: true,
            skip_lines_with_empty_values: true
        });
    }
    extractCardNames(records) {
        return records[HEADER_ROW]
            .map((value, index) => index >= CARD_START_COL ? value : undefined)
            .filter(Boolean);
    }
    extractHostNames(records) {
        return records
            .map((value, index) => index > HEADER_ROW ? { name: value[HOST_COL], index } : undefined)
            .filter(Boolean);
    }
    extractAlternateHostNames(record) {
        if (record[ALT_HOST_COL].length === 0) {
            return [];
        }
        return record[ALT_HOST_COL].split(';').map((t) => t.trim()).filter(Boolean);
    }
    extractCartPageRegex(record) {
        return record[CART_REGEX_COL];
    }
    extractCardName(records, col) {
        return records[HEADER_ROW][col];
    }
    async mapToCard(cardName) {
        return this.cardStore.lookupCardByCardName(cardName);
    }
}
exports.RetailerImportService = RetailerImportService;
//# sourceMappingURL=retailer-import.service.js.map