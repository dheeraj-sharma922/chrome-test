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
    get name() { return this.value.name; }
    updateDataValues(values) {
        const now = moment().toDate();
        const validValues = values.filter((v) => v.date.getTime() < now.getTime());
        let latestRecord = validValues[0];
        for (const record of validValues) {
            if ((record.date.getTime() > latestRecord.date.getTime() && !isNaN(record.value)) || isNaN(latestRecord.value)) {
                latestRecord = record;
            }
        }
        this.value.updatedAt = latestRecord.date;
    }
}
exports.PortalsModel = PortalsModel;
//# sourceMappingURL=portals.model.js.map