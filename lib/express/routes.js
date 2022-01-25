"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const health_check_command_1 = require("../health-check/health-check.command");
const init_wallet_command_1 = require("../my-wallet/init-wallet.command");
const my_wallet_store_1 = require("../my-wallet/my-wallet.store");
const update_wallet_command_1 = require("../my-wallet/update-wallet.command");
const retailer_recommendation_command_1 = require("../recommendation/retailer-recommendation.command");
const retailer_store_1 = require("../retailer/retailer.store");
const recommendation_store_1 = require("../recommendation/recommendation.store");
const card_store_1 = require("../card/card-store");
const firebase_functions_1 = require("firebase-functions");
const config_store_1 = require("../config/config.store");
const portals_recomm_store_1 = require("../portals-recommendation/portals-recomm.store");
const portals_recomm_command_1 = require("../portals-recommendation/portals-recomm.command");
const portals_store_1 = require("../portals-new/portals.store");
const cors = require('cors');
exports.routes = (app, db) => {
    app.get('/health-check', async (req, res) => {
        const status = await new health_check_command_1.HealthCheckCommand(db).execute();
        res.status(status.success ? 200 : 500).json(status);
    });
    app.get('/cards', cors(), async (req, res) => {
        const store = new card_store_1.CardStore(db);
        const cards = await store.listCards();
        res.status(200).json({ cards });
    });
    app.get('/retailers', async (req, res) => {
        const store = new retailer_store_1.RetailerStore(db);
        const retailers = (await store.listRetailers())
            .map((retailer) => ({ id: retailer.id, host: retailer.host }));
        res.status(200).json({ retailers });
    });
    app.post('/my-wallet', cors(), async (req, res) => {
        const store = new my_wallet_store_1.MyWalletStore(db);
        const wallet = await new init_wallet_command_1.InitWalletCommand(store).execute({ cardIds: req.body.cardIds });
        res.status(200).json(wallet);
    });
    app.put('/my-wallet/:walletId', cors(), async (req, res) => {
        const store = new my_wallet_store_1.MyWalletStore(db);
        const params = { walletId: req.params.walletId, cardIds: req.body.cardIds };
        // @ts-ignore
        await new update_wallet_command_1.UpdateWalletCommand(store).execute(params);
        res.status(201).send();
    });
    app.get('/recommendation', cors(), async (req, res) => {
        const recommendationStore = new recommendation_store_1.RecommendationStore(db);
        const retailerStore = new retailer_store_1.RetailerStore(db);
        const walletStore = new my_wallet_store_1.MyWalletStore(db);
        const cardStore = new card_store_1.CardStore(db);
        const configStore = new config_store_1.ConfigStore(db);
        const params = {
            walletId: req.query.walletId,
            retailer: { host: req.query.retailer },
            withInvalid: req.query.withInvalid === 'yes'
        };
        if (!params.walletId || !params.retailer.host) {
            res.status(400).json({ error: 'invalid request. walletId and retailer required' });
            return;
        }
        const defaultCategory = (await configStore.getValue('retailer-recommendation')).defaultCategory;
        const resp = await new retailer_recommendation_command_1.RetailerRecommendationCommand(recommendationStore, retailerStore, walletStore, cardStore, defaultCategory, firebase_functions_1.logger)
            // @ts-ignore
            .execute(params);
        res.status(200).json(resp);
    });
    app.get('/portals-recommendation', cors(), async (req, res) => {
        console.log("por inside the API >>");
        const portalsRecommStore = new portals_recomm_store_1.PortalsRecommStore(db);
        const retailerStore = new retailer_store_1.RetailerStore(db);
        const walletStore = new my_wallet_store_1.MyWalletStore(db);
        const portalsStore = new portals_store_1.PortalsStore(db);
        const configStore = new config_store_1.ConfigStore(db);
        const params = {
            walletId: req.query.walletId,
            retailer: { host: req.query.retailer },
            withInvalid: req.query.withInvalid === 'yes'
        };
        if (!params.walletId || !params.retailer.host) {
            res.status(400).json({ error: 'invalid request. walletId and retailer required' });
            return;
        }
        const defaultCategory = (await configStore.getValue('retailer-recommendation')).defaultCategory;
        const resp = await new portals_recomm_command_1.PortalsRecommendationCommand(portalsRecommStore, retailerStore, walletStore, portalsStore, defaultCategory, firebase_functions_1.logger)
            // @ts-ignore
            .execute(params);
        res.status(200).json(resp);
    });
};
//# sourceMappingURL=routes.js.map