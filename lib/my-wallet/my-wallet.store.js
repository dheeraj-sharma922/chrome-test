"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyWalletStore = void 0;
const uuid_1 = require("uuid");
class MyWalletStore {
    constructor(db) {
        this.db = db;
    }
    collection() {
        return this.db.collection('wallet');
    }
    async updateWallet(walletId, cardIds) {
        await this.collection().doc(walletId).set({
            walletId,
            cardIds,
            updatedAt: new Date()
        });
    }
    async createWallet() {
        return uuid_1.v4();
    }
    async getWallet(walletId) {
        const wallet = await this.collection().doc(walletId).get();
        return wallet.data();
    }
}
exports.MyWalletStore = MyWalletStore;
//# sourceMappingURL=my-wallet.store.js.map