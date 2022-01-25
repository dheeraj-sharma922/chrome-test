import { Request, Response, Router } from 'express'
import { HealthCheckCommand } from '../health-check/health-check.command'
import { InitWalletCommand } from '../my-wallet/init-wallet.command'
import { MyWalletStore } from '../my-wallet/my-wallet.store'
import { UpdateWalletCommand } from '../my-wallet/update-wallet.command'
import { RetailerRecommendationCommand } from '../recommendation/retailer-recommendation.command'
import { RetailerStore } from '../retailer/retailer.store'
import { RecommendationStore } from '../recommendation/recommendation.store'
import { CardStore } from '../card/card-store'
import { RetailerValue } from '../retailer/retailer.value'
import { logger } from 'firebase-functions'
import { ConfigStore } from '../config/config.store'
import { PortalsRecommStore } from '../portals-recommendation/portals-recomm.store'
import { PortalsRecommendationCommand } from '../portals-recommendation/portals-recomm.command'
import { PortalsStore } from '../portals-new/portals.store'

const cors = require('cors')

export const routes = (app: Router, db: FirebaseFirestore.Firestore) => {

  app.get('/health-check', async (req: Request, res: Response) => {
    const status = await new HealthCheckCommand(db).execute()
    res.status(status.success ? 200 : 500).json(status)
  })

  app.get('/cards', cors(), async (req: Request, res: Response) => {
    const store = new CardStore(db)
    const cards = await store.listCards()

    res.status(200).json({ cards })
  })

  app.get('/retailers', async (req: Request, res: Response) => {
    const store = new RetailerStore(db)
    const retailers = ( await store.listRetailers() )
        .map((retailer: RetailerValue) => ( { id: retailer.id, host: retailer.host } ))

    res.status(200).json({ retailers })
  })

  app.post('/my-wallet', cors(), async (req: Request, res: Response) => {
    const store = new MyWalletStore(db)
    const wallet = await new InitWalletCommand(store).execute({ cardIds: req.body.cardIds })

    res.status(200).json(wallet)
  })

  app.put('/my-wallet/:walletId', cors(), async (req: Request, res: Response) => {
    const store = new MyWalletStore(db)
    const params = { walletId: req.params.walletId, cardIds: req.body.cardIds }

    // @ts-ignore
    await new UpdateWalletCommand(store).execute(params)

    res.status(201).send()
  })

  app.get('/recommendation', cors(), async (req: Request, res: Response) => {
    const recommendationStore = new RecommendationStore(db)
    const retailerStore = new RetailerStore(db)
    const walletStore = new MyWalletStore(db)
    const cardStore = new CardStore(db)
    const configStore = new ConfigStore(db)

    const params = {
      walletId: req.query.walletId,
      retailer: { host: req.query.retailer },
      withInvalid: req.query.withInvalid === 'yes'
    }

    if (!params.walletId || !params.retailer.host) {
      res.status(400).json({ error: 'invalid request. walletId and retailer required' })
      return
    }

    const defaultCategory = ( await configStore.getValue('retailer-recommendation') ).defaultCategory

    const resp = await new RetailerRecommendationCommand(recommendationStore, retailerStore, walletStore, cardStore, defaultCategory, logger)
        // @ts-ignore
        .execute(params)
    res.status(200).json(resp)
  })


  app.get('/portals-recommendation', cors(), async (req: Request, res: Response) => {
    console.log("por inside the API >>")
    const portalsRecommStore = new PortalsRecommStore(db)
    const retailerStore = new RetailerStore(db)
    const walletStore = new MyWalletStore(db)
    const portalsStore = new PortalsStore(db)
    const configStore = new ConfigStore(db)

    const params = {
      walletId: req.query.walletId,
      retailer: { host: req.query.retailer },
      withInvalid: req.query.withInvalid === 'yes'
    }

    if (!params.walletId || !params.retailer.host) {
      res.status(400).json({ error: 'invalid request. walletId and retailer required' })
      return
    }

    const defaultCategory = ( await configStore.getValue('retailer-recommendation') ).defaultCategory

    const resp = await new PortalsRecommendationCommand(portalsRecommStore, retailerStore, walletStore, portalsStore, defaultCategory, logger)
        // @ts-ignore
        .execute(params)
    res.status(200).json(resp)
  })


}
