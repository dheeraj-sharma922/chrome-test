"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardStore = void 0;
const uuid_1 = require("uuid");
class CardStore {
    constructor(db) {
        this.db = db;
    }
    collection() {
        return this.db.collection('card');
    }
    async lookupCard(cardId) {
        const doc = await this.collection().doc(cardId).get();
        return doc.exists ? doc.data() : { id: '', name: '', img: '', rank: -1, url: '' };
    }
    async updateCard(data) {
        await this.collection().doc(data.id).set(Object.assign(Object.assign({}, data), { updatedAt: new Date }));
    }
    async lookupCardByCardName(cardName) {
        const snapshot = await this.collection().where('name', '==', cardName).limit(1).get();
        if (snapshot.empty) {
            return { id: uuid_1.v4(), name: cardName, img: '', rank: -1, url: '' };
        }
        return snapshot.docs[0].data();
    }
    async lookupCardIdByCardName(cardName, generateIdIfNotFound = true) {
        const snapshot = await this.collection().where('name', '==', cardName).limit(1).get();
        if (snapshot.empty) {
            return generateIdIfNotFound ? uuid_1.v4() : '';
        }
        return snapshot.docs[0].id;
    }
    async findIdOrCreateByName(cardName) {
        let cardId = await this.lookupCardIdByCardName(cardName, false);
        if (!cardId) {
            cardId = uuid_1.v4();
            await this.updateCard({ id: cardId, name: cardName, img: '', rank: -1, url: '' });
        }
        return cardId;
    }
    async listCards() {
        const snapshot = await this.collection().get();
        return snapshot.docs.map((doc) => doc.data());
    }
    async listCardList() {
        let cards = await this.collection().get();
        const cardList = cards.docs.map((card) => card.data());
        return cardList;
    }
}
exports.CardStore = CardStore;
//# sourceMappingURL=card-store.js.map