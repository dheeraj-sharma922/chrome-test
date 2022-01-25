"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetailerRecommendationCommand = void 0;
const rules_engine_1 = require("./rules-engine");
const recommendation_model_1 = require("./recommendation.model");
[];
class RetailerRecommendationCommand {
    constructor(store, retailerStore, myWalletStore, cardStore, defaultCategory = 'Other', logger = console, rules = new rules_engine_1.RulesEngine()) {
        this.store = store;
        this.retailerStore = retailerStore;
        this.myWalletStore = myWalletStore;
        this.cardStore = cardStore;
        this.defaultCategory = defaultCategory;
        this.logger = logger;
        this.rules = rules;
    }
    async execute({ walletId, retailer, withInvalid }) {
        const retailerDetails = await this.retailerStore.lookupRetailer(retailer.host);
        this.logger.debug('retailer details', { retailerDetails });
        if (!retailerDetails) {
            this.logger.debug('Site not found: ', retailer.host);
            return { knownSite: false };
        }
        const wallet = await this.myWalletStore.getWallet(walletId);
        this.logger.debug('Wallet details', { walletId, wallet });
        const walletCards = await Promise.all(wallet.cardIds.map(async (cardId) => this.cardStore.lookupCard(cardId)));
        // const walletCards = await this.cardStore.listCardList()
        this.logger.debug('Wallet cards', { walletCards });
        const recommendationsByCard = await Promise.all(walletCards.map(async (card) => this.lookupRecommendations(card, retailerDetails)));
        this.logger.debug('Recommendations by card', { recommendationsByCard });
        const allRecommendations = recommendationsByCard
            .reduce((all, cardRecommendations) => [...all, ...cardRecommendations], []);
        for (const recommendation of allRecommendations) {
            this.rules.apply(recommendation, walletCards);
        }
        this.logger.debug('Recommendations with rules applied', { allRecommendations });
        this.rules.rank(allRecommendations);
        this.rules.dedupe(allRecommendations);
        this.logger.debug('Recommendations in rank order, deduped', { allRecommendations });
        const valid = allRecommendations.filter((recommendation) => recommendation.isValid());
        const primary = valid.length > 0 ? this.map(valid[0]) : undefined;
        valid.shift();
        let alternateCards;
        if (valid.length > 0) {
            alternateCards = valid.map((card) => this.map(card));
        }
        const alternate = alternateCards;
        const invalid = allRecommendations.filter((recommendation) => !recommendation.equals(valid[0]) && !recommendation.equals(valid[1]));
        const other = withInvalid ? invalid.map(this.map) : undefined;
        //for best overall card
        const bestCard = await this.findBestOverallCard(retailerDetails);
        return { knownSite: true, cartPageRegex: retailerDetails.cartPageRegex, primary, alternate, other, bestCard };
    }
    async lookupRecommendations(card, retailer) {
        const retailerClassification = retailer.lookupCard(card);
        this.logger.debug('card retail details', { retailerClassification, card });
        const categories = [...new Set([this.defaultCategory, retailerClassification.category, retailer.host]).values()];
        const recommendations = await Promise.all(categories.map(async (category) => this.store.lookupRecommendationsByCardAndCategory(card, category)));
        return recommendations
            .reduce((all, r) => [...all, ...r], [])
            .map((r) => recommendation_model_1.RecommendationModel.init(r, card));
    }
    map(recommendation) {
        const value = recommendation.getValue();
        const card = recommendation.getCard();
        const errors = recommendation.getErrors();
        const announcement = !value.announcementPrimary ? undefined : {
            primary: value.announcementPrimary,
            secondary: value.announcementSecondary
        };
        return {
            card: {
                img: card.img,
                name: card.name,
                url: card.url,
                id: card.id
            },
            return: value.return,
            message: value.messagePrimary,
            secondary: value.messageSecondary,
            announcement,
            errors
        };
    }
    async findBestOverallCard(retailerDetails) {
        const walletCards = await this.cardStore.listCardList();
        const recommendationsByCard = await Promise.all(walletCards.map(async (card) => this.lookupRecommendations(card, retailerDetails)));
        this.logger.debug('Best recomm by card', { recommendationsByCard });
        const allRecommendations = recommendationsByCard
            .reduce((all, cardRecommendations) => [...all, ...cardRecommendations], []);
        for (const recommendation of allRecommendations) {
            this.rules.apply(recommendation, walletCards);
        }
        this.logger.debug('Best recomm with rules applied', { allRecommendations });
        this.rules.rank(allRecommendations);
        this.rules.dedupe(allRecommendations);
        this.logger.debug('Best recomm in rank order, deduped', { allRecommendations });
        const valid = allRecommendations.filter((recommendation) => recommendation.isValid());
        const best = valid.length > 0 ? this.map(valid[0]) : undefined;
        return best;
    }
}
exports.RetailerRecommendationCommand = RetailerRecommendationCommand;
//# sourceMappingURL=retailer-recommendation.command.js.map