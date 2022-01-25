"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalStore = void 0;
const portal_model_1 = require("./portal.model");
class PortalStore {
    constructor(db) {
        this.db = db;
    }
    collection() {
        return this.db.collection('portal_retailer');
    }
    async lookupPortalRetailer(retailer, portal) {
        const docs = await this.collection().where('portal', '==', portal).where('retailer', '==', retailer).limit(1).get();
        if (docs.empty) {
            return undefined;
        }
        const portalValue = docs.docs[0].data();
        const history = await docs.docs[0].ref.collection('history').get();
        for (const historyDoc of history.docs) {
            // @ts-ignore
            portalValue[historyDoc.id] = historyDoc;
        }
        return portal_model_1.PortalModel.init(portalValue);
    }
    async updatePortalRetailer(portalRetailer) {
        const subcollections = ['week', 'month', 'halfyear', 'year'];
        const data = Object.assign({}, portalRetailer.data);
        for (const subcollection of subcollections) {
            // @ts-ignore
            await this.collection().doc(portalRetailer.id).collection('history').doc(subcollection).set(data[subcollection]);
            // @ts-ignore
            delete data[subcollection];
        }
        await this.collection().doc(portalRetailer.id).set(Object.assign(Object.assign({}, data), { uploadedAt: new Date() }));
    }
    async lookupPortalRetailersOlderThanDate(importStartDate) {
        const result = await this.collection().where('uploadedAt', '<', importStartDate).get();
        return result.docs.map((doc) => portal_model_1.PortalModel.init(doc.data()));
    }
    async deletePortalRetailer(id) {
        await this.collection().doc(id).delete();
    }
}
exports.PortalStore = PortalStore;
//# sourceMappingURL=portal.store.js.map