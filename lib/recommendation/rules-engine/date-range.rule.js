"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangeRule = void 0;
const rule_1 = require("./rule");
const moment = require("moment");
class DateRangeRule extends rule_1.Rule {
    constructor() {
        super(...arguments);
        this.type = 'DATE_RANGE';
    }
    apply(recommendation, wallet) {
        const meta = recommendation.getValue().meta;
        if (!meta) {
            return;
        }
        // @ts-ignore
        const startDate = moment(meta.startDate && meta.startDate.toDate());
        // @ts-ignore
        const endDate = moment(meta.endDate && meta.endDate.toDate());
        const now = moment();
        if (meta.startDate && now.isBefore(startDate)) {
            recommendation.addError({ error: 'Before start date: ' + startDate.format('M/D/Y'), type: this.type });
        }
        if (meta.endDate && now.isAfter(endDate)) {
            recommendation.addError({ error: 'After end date: ' + endDate.format('M/D/Y'), type: this.type });
        }
    }
}
exports.DateRangeRule = DateRangeRule;
//# sourceMappingURL=date-range.rule.js.map