"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalsStore = void 0;
const portals_model_1 = require("./portals.model");
const uuid_1 = require("uuid");
class PortalsStore {
    constructor(db) {
        this.db = db;
    }
    collection() {
        return this.db.collection('test_portals');
    }
    async updatePortalRetailer(portalData) {
        const data = Object.assign({}, portalData.data);
        const cardId = await this.lookupPortalIdByCardName(data.name, true);
        data.id = cardId;
        await this.collection().doc(data.id).set(Object.assign(Object.assign({}, data), { updatedAt: new Date }));
    }
    async lookupPortalRetailersOlderThanDate(importStartDate) {
        const result = await this.collection().where('uploadedAt', '<', importStartDate).get();
        return result.docs.map((doc) => portals_model_1.PortalsModel.init(doc.data()));
    }
    async lookupPortalIdByCardName(portalName, generateIdIfNotFound = true) {
        const snapshot = await this.collection().where('name', '==', portalName).limit(1).get();
        if (snapshot.empty) {
            return generateIdIfNotFound ? uuid_1.v4() : '';
        }
        return snapshot.docs[0].id;
    }
    async deletePortalRetailer(id) {
        await this.collection().doc(id).delete();
    }
    async lookupCard(id) {
        const doc = await this.collection().doc(id).get();
        return doc.exists ? doc.data() : { id: '', name: '', img: '', rank: -1, url: '' };
    }
    async lookupCardByHostName(host) {
        const snapshot = await this.collection().where('name', '==', host).limit(1).get();
        return snapshot.empty ? '' : snapshot.docs[0].id;
    }
}
exports.PortalsStore = PortalsStore;
//# sourceMappingURL=portals.store.js.map