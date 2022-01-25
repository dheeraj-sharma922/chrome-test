"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalsModel = void 0;
const moment = require("moment");
class PortalsModel {
    constructor(value) {
        this.value = value;
    }
    static init(value) {
        return new PortalsModel(value);
    }
    get data() { return this.value; }
    get id() { return this.value.id; }
    updateDataValues(values) {
        const now = moment().toDate();
        const validValues = values.filter((v) => v.date.getTime() < now.getTime());
        // this.value.week = this.extractDistributedDateValues(validValues, moment().subtract(1, 'week').toDate(), 7)
        // this.value.month = this.extractDistributedDateValues(validValues, moment().subtract(1, 'month').toDate(), 8)
        // this.value.halfyear = this.extractDistributedDateValues(validValues, moment().subtract(6, 'months').toDate(), 12)
        // this.value.year = this.extractDistributedDateValues(validValues, moment().subtract(12, 'months').toDate(), 24)
        let latestRecord = validValues[0];
        for (const record of validValues) {
            if ((record.date.getTime() > latestRecord.date.getTime() && !isNaN(record.value)) || isNaN(latestRecord.value)) {
                latestRecord = record;
            }
        }
        console.log("latestRecord.date--->", latestRecord.date);
        this.value.updatedAt = latestRecord.date;
        // this.value.value = latestRecord.value
    }
}
exports.PortalsModel = PortalsModel;
//# sourceMappingURL=portals.model.js.map