"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigStore = void 0;
class ConfigStore {
    constructor(db) {
        this.db = db;
    }
    collection() {
        return this.db.collection('_config');
    }
    async getValue(key) {
        const doc = await this.collection().doc(key).get();
        return doc.data();
    }
    async setValue(key, value) {
        await this.collection().doc(key).set(value);
    }
}
exports.ConfigStore = ConfigStore;
//# sourceMappingURL=config.store.js.map