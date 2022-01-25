import { RecommendationStore } from './recommendation.store'
import { MyWalletStore } from '../my-wallet/my-wallet.store'
import { RetailerStore } from '../retailer/retailer.store'
import { RetailerModel } from '../retailer/retailer.model'
import { RecommendationValue } from './recommendation.value'
import { RulesEngine } from './rules-engine'
import { CardStore } from '../card/card-store'
import { CardValue } from '../card/card.value'
import { RecommendationModel } from './recommendation.model'
import { RuleErrorValue } from './rules-engine/rule-error.value'
import { Logger } from '../logger/logger'

interface Request {
  walletId: string
  retailer: { host: string },
  withInvalid: boolean
}

interface ResponseCard {
  card: {
    name: string,
    img: string,
    url: string,
    id: string
  }
  return: number,
  message: string,
  secondary?: string,
  announcement?: {
    primary: string
    secondary?: string
  }
  errors?: RuleErrorValue[]
}[]

interface Response {
  knownSite: boolean
  cartPageRegex?: string
  primary?: ResponseCard
  alternate?: ResponseCard[],
  other?: ResponseCard[],
  bestCard?: ResponseCard
}

export class RetailerRecommendationCommand {
  constructor(
      protected store: RecommendationStore,
      protected retailerStore: RetailerStore,
      protected myWalletStore: MyWalletStore,
      protected cardStore: CardStore,
      protected defaultCategory: string = 'Other',
      protected logger: Logger = console,
      protected rules: RulesEngine = new RulesEngine()
  ) {}

  public async execute({ walletId, retailer, withInvalid }: Request): Promise<Response> {
    const retailerDetails = await this.retailerStore.lookupRetailer(retailer.host)
    this.logger.debug('retailer details', { retailerDetails })
    if (!retailerDetails) {
      this.logger.debug('Site not found: ', retailer.host)
      return { knownSite: false }
    }

    const wallet = await this.myWalletStore.getWallet(walletId)
    this.logger.debug('Wallet details', { walletId, wallet })

    const walletCards = await Promise.all(
        wallet.cardIds.map(async (cardId: string) => this.cardStore.lookupCard(cardId))
    )
    // const walletCards = await this.cardStore.listCardList()
    this.logger.debug('Wallet cards', { walletCards })

    const recommendationsByCard = await Promise.all(
        walletCards.map(async (card: CardValue) => this.lookupRecommendations(card, retailerDetails))
    )
    this.logger.debug('Recommendations by card', { recommendationsByCard })

    const allRecommendations = recommendationsByCard
        .reduce((all, cardRecommendations) => [ ...all, ...cardRecommendations ], [])

    for (const recommendation of allRecommendations) {
      this.rules.apply(recommendation, walletCards)
    }
    this.logger.debug('Recommendations with rules applied', { allRecommendations })

    this.rules.rank(allRecommendations)
    this.rules.dedupe(allRecommendations)
    this.logger.debug('Recommendations in rank order, deduped', { allRecommendations })

    const valid = allRecommendations.filter((recommendation) => recommendation.isValid())

    const primary = valid.length > 0 ? this.map(valid[0]) : undefined

    valid.shift()
    let alternateCards;
    if(valid.length > 0){
      alternateCards = valid.map((card) => this.map(card) )
    }
    const alternate = alternateCards 
    const invalid = allRecommendations.filter((recommendation) =>
        !recommendation.equals(valid[0]) && !recommendation.equals(valid[1]))
    const other = withInvalid ? invalid.map(this.map) : undefined

    //for best overall card
    const bestCard =  await this.findBestOverallCard(retailerDetails)
    

    return { knownSite: true, cartPageRegex: retailerDetails.cartPageRegex, primary, alternate, other, bestCard }
  }

  protected async lookupRecommendations(card: CardValue, retailer: RetailerModel): Promise<RecommendationModel[]> {
    const retailerClassification = retailer.lookupCard(card)
    this.logger.debug('card retail details', { retailerClassification, card })

    const categories = [ ...new Set([ this.defaultCategory, retailerClassification.category, retailer.host ]).values() ]

    const recommendations = await Promise.all(
        categories.map(async (category) => this.store.lookupRecommendationsByCardAndCategory(card, category))
    )

    return recommendations
        .reduce((all, r) => [ ...all, ...r ], [])
        .map((r: RecommendationValue) => RecommendationModel.init(r, card))
  }

  protected map(recommendation: RecommendationModel): ResponseCard {
    const value = recommendation.getValue()
    const card = recommendation.getCard()
    const errors = recommendation.getErrors()

    const announcement = !value.announcementPrimary ? undefined : {
      primary: value.announcementPrimary,
      secondary: value.announcementSecondary
    }

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
    }
  }

  protected async findBestOverallCard( retailerDetails: any ) :Promise<ResponseCard>{

    const walletCards = await this.cardStore.listCardList()
      const recommendationsByCard = await Promise.all(
        walletCards.map(async (card: CardValue) => this.lookupRecommendations(card, retailerDetails))
    )
    this.logger.debug('Best recomm by card', { recommendationsByCard })

    const allRecommendations = recommendationsByCard
        .reduce((all, cardRecommendations) => [ ...all, ...cardRecommendations ], [])

    for (const recommendation of allRecommendations) {
      this.rules.apply(recommendation, walletCards)
    }
    this.logger.debug('Best recomm with rules applied', { allRecommendations })

    this.rules.rank(allRecommendations)
    this.rules.dedupe(allRecommendations)
    this.logger.debug('Best recomm in rank order, deduped', { allRecommendations })

    const valid = allRecommendations.filter((recommendation) => recommendation.isValid())
  
    const best:any = valid.length > 0 ? this.map(valid[0]) : undefined
    return best
  }
}
