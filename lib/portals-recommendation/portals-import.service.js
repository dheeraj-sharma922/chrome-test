"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalsRecommImportService = void 0;
const portals_model_1 = require("./portals.model");
// import moment = require('moment')
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const uuid_1 = require("uuid");
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
};
class PortalsRecommImportService {
    constructor(store, logger) {
        this.store = store;
        this.logger = logger;
    }
    async importCSV(filepath) {
        // const importStartDate = new Date()
        const content = fs.readFileSync(filepath);
        const records = parse(content, {
            trim: true,
            skip_lines_with_error: true,
            skip_lines_with_empty_values: true
        });
        const retailers = records.slice(2).map((r) => this.mapToRetailer(r, records[1]));
        this.logger.info('All retailer mapped');
        console.log('retailers ->>', retailers[0]);
        const pageSize = 1000;
        // for (let i = 0; i < retailers.length; i += pageSize) {
        //   await Promise.all(retailers.slice(i, i + pageSize).map((retailer) => this.store.updatePortalRetailer(retailer)))
        //   this.logger.info('Saved ' + ( i + pageSize ) + ' retailers')
        // }
        const test = [];
        test.push(retailers[0]);
        for (let i = 0; i < test.length; i += pageSize) {
            await Promise.all(test.slice(i, i + pageSize).map((retailer) => this.store.updatePortalRetailer(retailer)));
        }
        this.logger.info('All retailers saved');
        // const oldRetailer = await this.store.lookupPortalRetailersOlderThanDate(importStartDate)
        // await Promise.all(oldRetailer.map(async (old) => {
        //   this.logger.debug('Deleting old record: ' + old.id)
        //   await this.store.deletePortalRetailer(old.id)
        // }))
        // this.logger.info('Removed ' + oldRetailer.length + ' retailers')
    }
    mapToRetailer(record, headers) {
        // this.logger.info('Mapping: ' + record[COL.retailer] + ' @ ' + record[COL.portal])
        const portalValue = {
            id: uuid_1.v4(),
            name: record[COL.name] ? record[COL.name] : 'test',
            img: record[COL.image] ? record[COL.image] : 'image test',
            url: record[COL.url] ? record[COL.url] : 'test url',
            rank: record[COL.rank] ? parseInt(record[COL.rank]) : 1
        };
        // const dataPoints = record.slice(VAL_COL)
        //     .map((value, index) => ( {
        //       value: parseFloat(value),
        //       date: moment(headers[index + VAL_COL], 'M/D/YYYY').add(5, 'hours').toDate()
        //     } ))
        const model = portals_model_1.PortalsModel.init(portalValue);
        // model.updateDataValues(dataPoints)
        return model;
    }
}
exports.PortalsRecommImportService = PortalsRecommImportService;
//# sourceMappingURL=portals-import.service.js.map