"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationStore = void 0;
const uuid_1 = require("uuid");
const crypto = require('crypto');
class RecommendationStore {
    constructor(db) {
        this.db = db;
    }
    collection() {
        return this.db.collection('recommendation');
    }
    async lookupRecommendationsByCardAndCategory(card, category) {
        const result = await this.collection()
            .where('cardId', '==', card.id)
            .where('category', '==', category)
            .get();
        return result.docs.map((doc) => doc.data());
    }
    async updateRecommendation(recommendation) {
        const metaHash = crypto.createHash('sha256').update(JSON.stringify(recommendation.meta)).digest('base64');
        const results = await this.collection()
            .where('cardId', '==', recommendation.cardId)
            .where('category', '==', recommendation.category)
            .where('metaHash', '==', metaHash)
            .limit(1)
            .get();
        if (results.empty) {
            recommendation.id = uuid_1.v4();
        }
        else {
            recommendation.id = results.docs[0].id;
        }
        await this.collection().doc(recommendation.id).set(Object.assign(Object.assign({}, recommendation), { metaHash, updatedAt: new Date() }));
    }
    async lookupRecommendationsOlderThanDate(importStartDate) {
        const result = await this.collection().where('updatedAt', '<', importStartDate).get();
        return result.docs.map((doc) => doc.data());
    }
    async deleteRecommendation(id) {
        await this.collection().doc(id).delete();
    }
}
exports.RecommendationStore = RecommendationStore;
//# sourceMappingURL=recommendation.store.js.map