"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalsRecommStore = void 0;
const portals_recomm_model_1 = require("./portals-recomm.model");
const uuid_1 = require("uuid");
// import { PortalsValue } from '../portals-new/portals.value'
class PortalsRecommStore {
    constructor(db) {
        this.db = db;
    }
    collection() {
        return this.db.collection('portals_recommendation');
    }
    async updatePortalRetailer(portalData) {
        const data = Object.assign({}, portalData.data);
        data.id = uuid_1.v4();
        await this.collection().doc(data.id).set(Object.assign(Object.assign({}, data), { updatedAt: new Date }));
    }
    async lookupPortalRetailersOlderThanDate(importStartDate) {
        const result = await this.collection().where('uploadedAt', '<', importStartDate).get();
        return result.docs.map((doc) => portals_recomm_model_1.PortalsRecommModel.init(doc.data()));
    }
    async lookupPortalIdByCardName(portalName, generateIdIfNotFound = true) {
        const snapshot = await this.db.collection('test_portals').where('name', '==', portalName).limit(1).get();
        if (snapshot.empty) {
            return generateIdIfNotFound ? '' : '';
        }
        return snapshot.docs[0].id;
    }
    async deletePortalRetailer(id) {
        await this.collection().doc(id).delete();
    }
    async lookupRecommendationsByPortalId(portalId, host) {
        const snapshot = await this.collection().where('portalId', '==', portalId).where('category', '==', host).limit(1).get();
        return snapshot.docs.map((doc) => portals_recomm_model_1.PortalsRecommModel.init(doc.data()));
    }
}
exports.PortalsRecommStore = PortalsRecommStore;
//# sourceMappingURL=portals-recomm.store.js.map