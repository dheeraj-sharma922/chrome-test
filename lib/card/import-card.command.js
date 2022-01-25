"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportCardCommand = void 0;
class ImportCardCommand {
    constructor(store, logger) {
        this.store = store;
        this.logger = logger;
    }
    async execute(card) {
        const cardId = await this.store.lookupCardIdByCardName(card.name, true);
        await this.store.updateCard(Object.assign(Object.assign({}, card), { id: cardId }));
        this.logger.debug('Saved card information', { card, cardId });
        card.id = cardId;
    }
}
exports.ImportCardCommand = ImportCardCommand;
//# sourceMappingURL=import-card.command.js.map