"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalsRecommFetchModel = void 0;
class PortalsRecommFetchModel {
    constructor(value, portalValue, errors = []) {
        this.value = value;
        this.portalValue = portalValue;
        this.errors = errors;
    }
    static init(value, portalValue) {
        return new PortalsRecommFetchModel(value, portalValue);
    }
    isValid() {
        return this.errors.length === 0;
    }
    addError(error) {
        this.errors.push(error);
    }
    getValue() {
        return this.value;
    }
    getErrors() {
        return this.errors;
    }
    getCard() {
        return this.portalValue;
    }
    equals(other) {
        if (other === undefined) {
            return false;
        }
        return other.getValue().id === this.getValue().id;
    }
}
exports.PortalsRecommFetchModel = PortalsRecommFetchModel;
//# sourceMappingURL=portals-recomm.fetch.js.map