"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetailerStore = void 0;
const retailer_model_1 = require("./retailer.model");
const uuid_1 = require("uuid");
class RetailerStore {
    constructor(db) {
        this.db = db;
    }
    collection() {
        return this.db.collection('retailer');
    }
    async initRetailer(host) {
        let model = await this.lookupRetailer(host);
        if (!model) {
            model = retailer_model_1.RetailerModel.init({
                id: uuid_1.v4(),
                cartPageRegex: '',
                host: host,
                alternateHosts: [],
                default: { category: '' },
                overrides: []
            });
        }
        return model;
    }
    async lookupRetailer(retailer) {
        let docs = await this.collection().where('host', '==', retailer).limit(1).get();
        if (docs.empty) {
            docs = await this.collection().where('alternateHosts', 'array-contains', retailer).limit(1).get();
            if (docs.empty) {
                return undefined;
            }
        }
        return retailer_model_1.RetailerModel.init(docs.docs[0].data());
    }
    async updateRetailer(retailer) {
        await this.collection().doc(retailer.id).set(Object.assign(Object.assign({}, retailer.serialize()), { updatedAt: new Date() }));
    }
    async listRetailers() {
        const snapshot = await this.collection().get();
        return snapshot.docs.map((doc) => doc.data());
    }
    async lookupRetailersOlderThanDate(importStartDate) {
        const result = await this.collection().where('updatedAt', '<', importStartDate).get();
        return result.docs.map((doc) => doc.data());
    }
    async deleteRetailer(id) {
        await this.collection().doc(id).delete();
    }
}
exports.RetailerStore = RetailerStore;
//# sourceMappingURL=retailer.store.js.map