import { logger, RuntimeOptions, runWith } from 'firebase-functions'
import { CardImportService } from '../../card/card-import.service'
import { db } from '../firebase'
import { CardStore } from '../../card/card-store'
import { ImportService } from '../../data-import/import.service'
import * as admin from 'firebase-admin'
import * as path from 'path'
import * as os from 'os'
import { RetailerImportService } from '../../retailer/retailer-import.service'
import { RetailerStore } from '../../retailer/retailer.store'
import { RecommendationImportService } from '../../recommendation/recommendation-import.service'
import { RecommendationStore } from '../../recommendation/recommendation.store'
import { ConfigStore } from '../../config/config.store'
import { PortalImportService } from '../../portal/portal-import.service'
import { PortalStore } from '../../portal/portal.store'
import { PortalsImportService } from '../../portals-new/portals-import.service'
import { PortalsStore } from '../../portals-new/portals.store'
import { PortalsRecommImportService } from '../../portals-recommendation/portals-recomm-import.service'
import { PortalsRecommStore } from '../../portals-recommendation/portals-recomm.store'


const settings: RuntimeOptions = {
  timeoutSeconds: 60 * 9,
  memory: '2GB'
}

const importServiceMap: { folder: string, service: ImportService }[] = [
  {
    folder: 'data-files/credit-cards',
    service: new CardImportService(new CardStore(db), logger)
  },
  {
    folder: 'data-files/retail-classification',
    service: new RetailerImportService(new RetailerStore(db), new CardStore(db), new ConfigStore(db), logger)
  },
  {
    folder: 'data-files/card-value',
    service: new RecommendationImportService(new RecommendationStore(db), new CardStore(db), logger)
  },
  {
    folder: 'data-files/portal-retailers',
    service: new PortalImportService(new PortalStore(db), logger)
  },
  {
    folder: 'data-files/test-data',
    service: new PortalsImportService(new PortalsStore(db), logger)
  },
  {
    folder: 'data-files/portal-recommendation',
    service: new PortalsRecommImportService(new PortalsRecommStore(db), logger)
  }
]

exports = module.exports = runWith(settings)
    .storage.object()
    .onFinalize(async (object) => {
      const fileBucket = object.bucket
      const filePath = object.name
      const contentType = object.contentType

      if (!filePath || !fileBucket || !contentType) {
        logger.error('Missing file information: ', { filePath, fileBucket, contentType })
        return
      }

      let importService = null
      for (const { folder, service } of importServiceMap) {
        if (filePath.startsWith(folder)) {
          importService = service
        }
      }

      if (!importService) {
        logger.info('No import service match to file path: ', { filePath, fileBucket, contentType })
        return
      }

      if (contentType !== 'text/csv' && contentType !== 'application/octet-stream') {
        logger.error('Invalid file format provided', { filePath, fileBucket, contentType })
        return
      }


      const tempFilePath = path.join(os.tmpdir(), path.basename(filePath))
      await admin.storage().bucket(fileBucket).file(filePath).download({ destination: tempFilePath })
      logger.info('File downloaded')

      await importService.importCSV(tempFilePath)
      logger.info('File import complete')
    })
