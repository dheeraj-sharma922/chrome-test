"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecondaryCardRule = void 0;
const rule_1 = require("./rule");
class SecondaryCardRule extends rule_1.Rule {
    constructor() {
        super(...arguments);
        this.type = 'SECONDARY_CARD';
    }
    apply(recommendation, wallet) {
        const meta = recommendation.getValue().meta;
        if (!meta || !meta.walletMustAlsoContain) {
            return;
        }
        const secondaryCardIds = meta.walletMustAlsoContain;
        const walletCardIds = wallet.map((card) => card.id);
        for (const secondaryCardId of secondaryCardIds) {
            if (secondaryCardId && !walletCardIds.includes(secondaryCardId)) {
                recommendation.addError({ error: 'Secondary Card Not Present: ' + secondaryCardId, type: this.type });
            }
        }
    }
}
exports.SecondaryCardRule = SecondaryCardRule;
//# sourceMappingURL=secondary-card.rule.js.map