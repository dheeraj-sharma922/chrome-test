"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalsRecommendationCommand = void 0;
[];
class PortalsRecommendationCommand {
    constructor(store, retailerStore, myWalletStore, portalsStore, defaultCategory = 'Other', logger = console) {
        this.store = store;
        this.retailerStore = retailerStore;
        this.myWalletStore = myWalletStore;
        this.portalsStore = portalsStore;
        this.defaultCategory = defaultCategory;
        this.logger = logger;
    }
    async execute({ walletId, retailer, withInvalid }) {
        const wallet = await this.myWalletStore.getWallet(walletId);
        this.logger.debug('Wallet details', { walletId, wallet });
        const portalSelectedIds = wallet.loyaltyIds.map((_a) => {
            var rest = __rest(_a, []);
            return (Object.assign({}, rest));
        }).map(ab => ab.portal_id);
        const walletPortalsCards = await Promise.all(portalSelectedIds.map(async (portalId) => this.portalsStore.lookupCard(portalId)));
        this.logger.debug('portal Wallet cards >>>', { walletPortalsCards });
        let recommendationsByWalletCard = await Promise.all(walletPortalsCards.map(async (portal) => this.lookupRecommendations(portal, retailer.host)));
        this.logger.debug('portals by card >>>>', { recommendationsByWalletCard });
        let recommendationsByCard = recommendationsByWalletCard.filter((item) => item.return != 0);
        recommendationsByCard.sort((a, b) => (a.return > b.return) ? -1 : ((b.return > a.return) ? 1 : 0));
        const primary = recommendationsByCard.length > 0 ? recommendationsByCard[0] : undefined;
        recommendationsByCard.shift();
        const alternate = recommendationsByCard.length > 0 ? recommendationsByCard : undefined;
        //get selected portal data
        const selectedPortal = await this.getSelectedPortal(retailer.host);
        return { knownSite: true, cartPageRegex: '', primary, alternate, selectedPortal };
    }
    rank(recommendations) {
        recommendations.sort((a, b) => {
            return b.return - a.return;
        });
    }
    async lookupRecommendations(portal, host) {
        this.logger.debug('portals single detail', { portal });
        const getPortalRecommendationData = await this.store.lookupRecommendationsByPortalId(portal.id, host);
        let obj;
        if (getPortalRecommendationData.length > 0) {
            obj = {
                card: { img: portal.img,
                    name: portal.name,
                    url: portal.url,
                    id: portal.id,
                },
                return: getPortalRecommendationData[0].data.return,
                message: getPortalRecommendationData[0].data.messagePrimary,
                secondary: getPortalRecommendationData[0].data.messageSecondary,
                announcement: {
                    primary: getPortalRecommendationData[0].data.announcementPrimary,
                    secondary: getPortalRecommendationData[0].data.announcementSecondary
                },
                errors: []
            };
        }
        else {
            obj = {
                card: { img: portal.img,
                    name: portal.name,
                    url: portal.url,
                    id: portal.id,
                },
                return: 0,
                message: '',
                secondary: '',
                announcement: {
                    primary: '',
                    secondary: ''
                },
                errors: []
            };
        }
        return obj;
    }
    async getSelectedPortal(host) {
        let portalId = await this.portalsStore.lookupCardByHostName(host);
        let obj;
        if (portalId != '') {
            const getPortalRecommendationData = await this.store.lookupRecommendationsByPortalId(portalId, host);
            if (getPortalRecommendationData.length > 0) {
                obj = {
                    return: getPortalRecommendationData[0].data.return,
                    message: getPortalRecommendationData[0].data.messagePrimary
                };
            }
            else {
                obj = {
                    return: 0,
                    message: '-'
                };
            }
            return obj;
        }
        else {
            obj = {
                return: 0,
                message: '-'
            };
            return obj;
        }
    }
}
exports.PortalsRecommendationCommand = PortalsRecommendationCommand;
//# sourceMappingURL=portals-recomm.command.js.map