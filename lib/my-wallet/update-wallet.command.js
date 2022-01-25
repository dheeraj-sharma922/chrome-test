"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWalletCommand = void 0;
class UpdateWalletCommand {
    constructor(store) {
        this.store = store;
    }
    async execute({ walletId, cardIds }) {
        await this.store.updateWallet(walletId, cardIds);
    }
}
exports.UpdateWalletCommand = UpdateWalletCommand;
//# sourceMappingURL=update-wallet.command.js.map