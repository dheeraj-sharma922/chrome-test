"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalsRecommModel = void 0;
const moment = require("moment");
class PortalsRecommModel {
    constructor(value) {
        this.value = value;
    }
    static init(value) {
        return new PortalsRecommModel(value);
    }
    get data() { return this.value; }
    get id() { return this.value.id; }
    updateDataValues(values) {
        const now = moment().toDate();
        const validValues = values.filter((v) => v.date.getTime() < now.getTime());
        let latestRecord = validValues[0];
        for (const record of validValues) {
            if ((record.date.getTime() > latestRecord.date.getTime() && !isNaN(record.value)) || isNaN(latestRecord.value)) {
                latestRecord = record;
            }
        }
        console.log("latestRecord.date--->", latestRecord.date);
        this.value.updatedAt = latestRecord.date;
    }
}
exports.PortalsRecommModel = PortalsRecommModel;
//# sourceMappingURL=portals-recomm.model.js.map