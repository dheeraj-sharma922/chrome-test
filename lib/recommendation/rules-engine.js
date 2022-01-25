"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesEngine = void 0;
const date_range_rule_1 = require("./rules-engine/date-range.rule");
const secondary_card_rule_1 = require("./rules-engine/secondary-card.rule");
class RulesEngine {
    constructor(rules = [new date_range_rule_1.DateRangeRule(), new secondary_card_rule_1.SecondaryCardRule()]) {
        this.rules = rules;
    }
    apply(recommendation, walletCards) {
        for (const rule of this.rules) {
            rule.apply(recommendation, walletCards);
        }
    }
    rank(recommendations) {
        recommendations.sort((a, b) => {
            return b.getValue().return - a.getValue().return;
        });
    }
    dedupe(recommendations) {
        recommendations.forEach((recommendation, index) => {
            if (!recommendation.isValid()) {
                return;
            }
            const lowestIndex = recommendations.findIndex((r) => r.getCard().id === recommendation.getCard().id && r.isValid());
            if (lowestIndex !== index) {
                recommendation.addError({ error: 'Higher Valid Recommendation Exists for Same Card', type: 'DUPLICATE' });
            }
        });
    }
}
exports.RulesEngine = RulesEngine;
//# sourceMappingURL=rules-engine.js.map