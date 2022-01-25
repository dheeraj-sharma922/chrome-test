"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitWalletCommand = void 0;
const update_wallet_command_1 = require("./update-wallet.command");
class InitWalletCommand {
    constructor(store) {
        this.store = store;
    }
    async execute({ cardIds }) {
        const walletId = await this.store.createWallet();
        await new update_wallet_command_1.UpdateWalletCommand(this.store).execute({ walletId, cardIds });
        return { walletId };
    }
}
exports.InitWalletCommand = InitWalletCommand;
//# sourceMappingURL=init-wallet.command.js.map