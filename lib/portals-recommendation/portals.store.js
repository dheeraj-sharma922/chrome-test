"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalsStore = void 0;
const portals_model_1 = require("./portals.model");
class PortalsStore {
    constructor(db) {
        this.db = db;
    }
    collection() {
        return this.db.collection('test_portals');
    }
    //   public async lookupPortalRetailer(retailer: string, portal: string): Promise<TestModel | undefined> {
    //     let docs = await this.collection().where('portal', '==', portal).where('retailer', '==', retailer).limit(1).get()
    //     if (docs.empty) {
    //       return undefined
    //     }
    //     const TestValue = docs.docs[0].data() as TestValue
    //     const history = await docs.docs[0].ref.collection('history').get()
    //     for (const historyDoc of history.docs) {
    //       // @ts-ignore
    //       TestValue[historyDoc.id] = historyDoc
    //     }
    //     return TestModel.init(TestValue)
    //   }
    async updatePortalRetailer(portalData) {
        // const subcollections = [ 'week', 'month', 'halfyear', 'year' ]
        const data = Object.assign({}, portalData.data);
        // for (const subcollection of subcollections) {
        //   // @ts-ignore
        //   await this.collection().doc(portalRetailer.id).collection('history').doc(subcollection).set(data[subcollection])
        //   // @ts-ignore
        //   delete data[subcollection]
        // }
        console.log("data --> ", data);
        const docs = await this.collection().limit(1).get();
        console.log("docs --> ", docs);
        await this.collection().doc(portalData.id).set(Object.assign(Object.assign({}, data), { uploadedAt: new Date() }));
    }
    async lookupPortalRetailersOlderThanDate(importStartDate) {
        const result = await this.collection().where('uploadedAt', '<', importStartDate).get();
        return result.docs.map((doc) => portals_model_1.PortalsModel.init(doc.data()));
    }
    async deletePortalRetailer(id) {
        await this.collection().doc(id).delete();
    }
}
exports.PortalsStore = PortalsStore;
//# sourceMappingURL=portals.store.js.map