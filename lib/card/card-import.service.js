"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardImportService = void 0;
const import_card_command_1 = require("./import-card.command");
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
/**
 * Test command for function console:
 * ```
 * dataImport({ bucket: 'gs://dataraise-retailplugin.appspot.com',
    id: 'gs://dataraise-retailplugin.appspot.com/data-files/credit-cards/Backend Templates - Credit Cards.csv',
    kind: 'storage#object', size: '99b', storageClass: 'data', timeCreated: '2002-10-02T10:00:00-05:00',
    name: 'data-files/credit-cards/Backend Templates - Credit Cards.csv', contentType: 'text/csv' })
 * ```
 */
class CardImportService {
    constructor(store, logger) {
        this.store = store;
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
        const importCommand = new import_card_command_1.ImportCardCommand(this.store, this.logger);
        await Promise.all(records.map(async (record) => {
            const card = await this.mapToCardValue(record);
            await importCommand.execute(card);
            this.logger.debug('Updated card information', Object.assign(Object.assign({}, record), card));
        }));
    }
    async mapToCardValue(importRecord) {
        return {
            id: '',
            rank: parseFloat(importRecord['Rank']) || -1,
            name: importRecord['Credit Card'],
            img: importRecord['Image File Name'],
            url: importRecord['Url']
        };
    }
}
exports.CardImportService = CardImportService;
//# sourceMappingURL=card-import.service.js.map