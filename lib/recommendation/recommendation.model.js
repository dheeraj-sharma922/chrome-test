"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationModel = void 0;
class RecommendationModel {
    constructor(value, card, errors = []) {
        this.value = value;
        this.card = card;
        this.errors = errors;
    }
    static init(value, card) {
        return new RecommendationModel(value, card);
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
        return this.card;
    }
    equals(other) {
        if (other === undefined) {
            return false;
        }
        return other.getValue().id === this.getValue().id;
    }
}
exports.RecommendationModel = RecommendationModel;
//# sourceMappingURL=recommendation.model.js.map