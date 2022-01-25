import { PortalsRecommStore } from './portals-recomm.store'
import { MyWalletStore } from '../my-wallet/my-wallet.store'
import { RetailerStore } from '../retailer/retailer.store'
import { PortalsStore } from '../portals-new/portals.store'
import { PortalsValue } from '../portals-new/portals.value'
import { RuleErrorValue } from '../recommendation/rules-engine/rule-error.value'
import { Logger } from '../logger/logger'

interface Request {
  walletId: string
  retailer: { host: string },
  withInvalid: boolean
}

interface ResponseCard {
card : {
    name: string,
    img: string,
    url: string,
    id: string,
  },
  return: number,
  message: string,
  secondary?: string,
  announcement?: {
    primary: string
    secondary?: string
  }
  errors?: RuleErrorValue[]
}[]

interface SelectedPortalData {
  return: number,
  message: string
}



interface Response {
  knownSite: boolean
  cartPageRegex?: string
  primary?: ResponseCard
  alternate?: ResponseCard[],
  other?: ResponseCard[]
  selectedPortal?: SelectedPortalData 
}

export class PortalsRecommendationCommand {
  constructor(
      protected store: PortalsRecommStore,
      protected retailerStore: RetailerStore,
      protected myWalletStore: MyWalletStore,
      protected portalsStore: PortalsStore,
      protected defaultCategory: string = 'Other',
      protected logger: Logger = console,
  ) {}

  public async execute({ walletId, retailer, withInvalid }: Request): Promise<Response> {

    const wallet = await this.myWalletStore.getWallet(walletId)
    this.logger.debug('Wallet details', { walletId, wallet })

    const portalSelectedIds = wallet.loyaltyIds.map(({...rest}) => ({...rest})).map(ab => ab.portal_id)

    const walletPortalsCards = await Promise.all(
      portalSelectedIds.map(async (portalId: string) => this.portalsStore.lookupCard(portalId))
    )

    this.logger.debug('portal Wallet cards >>>', { walletPortalsCards })

    let recommendationsByWalletCard = await Promise.all(
        walletPortalsCards.map(async (portal: PortalsValue) => this.lookupRecommendations(portal, retailer.host))
    )
    this.logger.debug('portals by card >>>>', { recommendationsByWalletCard })

    let recommendationsByCard = recommendationsByWalletCard.filter((item) => item.return != 0 )

    recommendationsByCard.sort((a,b) => (a.return > b.return) ? -1 : ((b.return > a.return) ? 1 : 0))
 
    const primary = recommendationsByCard.length > 0 ? recommendationsByCard[0] : undefined
    recommendationsByCard.shift()
    const alternate = recommendationsByCard.length > 0 ? recommendationsByCard : undefined

    //get selected portal data
    const selectedPortal = await this.getSelectedPortal(retailer.host)
    
    return { knownSite: true, cartPageRegex: '', primary, alternate, selectedPortal }
  }

  public rank(recommendations: ResponseCard[]) {
    recommendations.sort((a, b) => {
      return b.return - a.return
    })
  }
  protected async lookupRecommendations(portal: PortalsValue, host : string) {
    this.logger.debug('portals single detail', { portal})

    const getPortalRecommendationData = await this.store.lookupRecommendationsByPortalId(portal.id, host)
    let obj;
    if(getPortalRecommendationData.length > 0){
      obj = {
        card: {img: portal.img,
        name: portal.name,
        url: portal.url,
        id: portal.id,
        },
        return: getPortalRecommendationData[0].data.return,
        message: getPortalRecommendationData[0].data.messagePrimary,
        secondary: getPortalRecommendationData[0].data.messageSecondary,
        announcement: {
            primary: getPortalRecommendationData[0].data. announcementPrimary,
            secondary: getPortalRecommendationData[0].data.announcementSecondary
        },
        errors: []
      }
    }else{
      obj = {
        card: {img: portal.img,
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
      }
    }
    return obj
  }
  
protected async getSelectedPortal(host : any): Promise<SelectedPortalData>{
  let portalId = await this.portalsStore.lookupCardByHostName(host)
  let obj;
  if(portalId != ''){
    const getPortalRecommendationData = await this.store.lookupRecommendationsByPortalId(portalId, host)
    if(getPortalRecommendationData.length > 0){
      obj = {
        return: getPortalRecommendationData[0].data.return,
        message: getPortalRecommendationData[0].data.messagePrimary
      }
    }else{
      obj = {
        return: 0,
        message: '-'
      }
    }
    return obj
  }else{
    obj = {
      return: 0,
      message: '-'
    }
    return obj
  }
  
}

}
