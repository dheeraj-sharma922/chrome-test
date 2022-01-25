"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetailerModel = void 0;
class RetailerModel {
    constructor(value) {
        this.value = value;
    }
    static init(value) {
        return new RetailerModel(value);
    }
    get id() { return this.value.id; }
    get host() { return this.value.host; }
    get cartPageRegex() { return this.value.cartPageRegex; }
    lookupCard(card) {
        const details = Object.assign({}, this.value.default);
        const override = this.value.overrides.find((o) => o.cardId === card.id);
        if (override) {
            details.category = override.category || details.category;
        }
        return details;
    }
    setDefault(data) {
        this.value.default = data;
    }
    setAlternateHosts(alternateHosts) {
        this.value.alternateHosts = alternateHosts;
    }
    setCartPageRegex(regex) {
        this.value.cartPageRegex = regex;
    }
    setOverride(override) {
        const overrideIndex = this.value.overrides
            .findIndex((o) => o.cardId === override.cardId);
        if (overrideIndex !== -1) {
            this.value.overrides[overrideIndex] = override;
        }
        else {
            this.value.overrides.push(override);
        }
    }
    serialize() {
        return this.value;
    }
}
exports.RetailerModel = RetailerModel;
//# sourceMappingURL=retailer.model.js.map