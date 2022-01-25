"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_functions_1 = require("firebase-functions");
const card_import_service_1 = require("../../card/card-import.service");
const firebase_1 = require("../firebase");
const card_store_1 = require("../../card/card-store");
const admin = require("firebase-admin");
const path = require("path");
const os = require("os");
const retailer_import_service_1 = require("../../retailer/retailer-import.service");
const retailer_store_1 = require("../../retailer/retailer.store");
const recommendation_import_service_1 = require("../../recommendation/recommendation-import.service");
const recommendation_store_1 = require("../../recommendation/recommendation.store");
const config_store_1 = require("../../config/config.store");
const portal_import_service_1 = require("../../portal/portal-import.service");
const portal_store_1 = require("../../portal/portal.store");
const portals_import_service_1 = require("../../portals-new/portals-import.service");
const portals_store_1 = require("../../portals-new/portals.store");
const portals_recomm_import_service_1 = require("../../portals-recommendation/portals-recomm-import.service");
const portals_recomm_store_1 = require("../../portals-recommendation/portals-recomm.store");
const settings = {
    timeoutSeconds: 60 * 9,
    memory: '2GB'
};
const importServiceMap = [
    {
        folder: 'data-files/credit-cards',
        service: new card_import_service_1.CardImportService(new card_store_1.CardStore(firebase_1.db), firebase_functions_1.logger)
    },
    {
        folder: 'data-files/retail-classification',
        service: new retailer_import_service_1.RetailerImportService(new retailer_store_1.RetailerStore(firebase_1.db), new card_store_1.CardStore(firebase_1.db), new config_store_1.ConfigStore(firebase_1.db), firebase_functions_1.logger)
    },
    {
        folder: 'data-files/card-value',
        service: new recommendation_import_service_1.RecommendationImportService(new recommendation_store_1.RecommendationStore(firebase_1.db), new card_store_1.CardStore(firebase_1.db), firebase_functions_1.logger)
    },
    {
        folder: 'data-files/portal-retailers',
        service: new portal_import_service_1.PortalImportService(new portal_store_1.PortalStore(firebase_1.db), firebase_functions_1.logger)
    },
    {
        folder: 'data-files/test-data',
        service: new portals_import_service_1.PortalsImportService(new portals_store_1.PortalsStore(firebase_1.db), firebase_functions_1.logger)
    },
    {
        folder: 'data-files/portal-recommendation',
        service: new portals_recomm_import_service_1.PortalsRecommImportService(new portals_recomm_store_1.PortalsRecommStore(firebase_1.db), firebase_functions_1.logger)
    }
];
exports = module.exports = firebase_functions_1.runWith(settings)
    .storage.object()
    .onFinalize(async (object) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;
    if (!filePath || !fileBucket || !contentType) {
        firebase_functions_1.logger.error('Missing file information: ', { filePath, fileBucket, contentType });
        return;
    }
    let importService = null;
    for (const { folder, service } of importServiceMap) {
        if (filePath.startsWith(folder)) {
            importService = service;
        }
    }
    if (!importService) {
        firebase_functions_1.logger.info('No import service match to file path: ', { filePath, fileBucket, contentType });
        return;
    }
    if (contentType !== 'text/csv' && contentType !== 'application/octet-stream') {
        firebase_functions_1.logger.error('Invalid file format provided', { filePath, fileBucket, contentType });
        return;
    }
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    await admin.storage().bucket(fileBucket).file(filePath).download({ destination: tempFilePath });
    firebase_functions_1.logger.info('File downloaded');
    await importService.importCSV(tempFilePath);
    firebase_functions_1.logger.info('File import complete');
});
//# sourceMappingURL=data-import.js.map