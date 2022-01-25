"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalsRecommImportService = void 0;
const portals_recomm_model_1 = require("./portals-recomm.model");
// import moment = require('moment')
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
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
    'Portal Name': 0,
    category: 1,
    Return: 2,
    'Primary Message': 3,
    'Secondary Message': 4,
    'Announcement Primary': 5,
    'Announcement Secondary': 6
};
class PortalsRecommImportService {
    constructor(store, logger) {
        this.store = store;
        this.logger = logger;
    }
    async importCSV(filepath) {
        const content = fs.readFileSync(filepath);
        const records = parse(content, {
            trim: true,
            skip_lines_with_error: true,
            skip_lines_with_empty_values: true
        });
        const retailers = await Promise.all(records.slice(1).map(async (r) => this.mapToRetailer(r, records[1])));
        this.logger.info('All retailer mapped');
        const pageSize = 1000;
        for (let i = 0; i < retailers.length; i += pageSize) {
            await Promise.all(retailers.slice(i, i + pageSize).map(async (retailer) => this.store.updatePortalRetailer(retailer)));
        }
        this.logger.info('All retailers saved');
    }
    async mapToRetailer(record, headers) {
        const name = record[COL['Portal Name']];
        const portalId = await this.store.lookupPortalIdByCardName(name, true);
        const portalValue = {
            id: '',
            portalId,
            announcementPrimary: record[COL['Announcement Primary']],
            announcementSecondary: record[COL['Secondary Message']],
            return: parseInt(record[COL.Return]),
            category: record[COL.category],
            messagePrimary: record[COL['Primary Message']],
            messageSecondary: record[COL['Secondary Message']],
        };
        const model = portals_recomm_model_1.PortalsRecommModel.init(portalValue);
        return model;
    }
}
exports.PortalsRecommImportService = PortalsRecommImportService;
//# sourceMappingURL=portals-recomm-import.service.js.map