import { CardValue } from './card.value'
import { v4 as uuid } from 'uuid'

export class CardStore {
  constructor(protected db: FirebaseFirestore.Firestore) {}

  protected collection() {
    return this.db.collection('card')
  }

  public async lookupCard(cardId: string): Promise<CardValue> {
    const doc = await this.collection().doc(cardId).get()

    return doc.exists ? doc.data() as CardValue : { id: '', name: '', img: '', rank: -1, url: '' }
  }

  public async updateCard(data: CardValue): Promise<void> {
    await this.collection().doc(data.id).set({ ...data, updatedAt: new Date })
  }

  public async lookupCardByCardName(cardName: string): Promise<CardValue> {
    const snapshot = await this.collection().where('name', '==', cardName).limit(1).get()
    if (snapshot.empty) {
      return { id: uuid(), name: cardName, img: '', rank: -1, url: '' }
    }

    return snapshot.docs[0].data() as CardValue
  }

  public async lookupCardIdByCardName(cardName: string, generateIdIfNotFound: boolean = true): Promise<string> {
    const snapshot = await this.collection().where('name', '==', cardName).limit(1).get()
    if (snapshot.empty) {
      return generateIdIfNotFound ? uuid() : ''
    }

    return snapshot.docs[0].id
  }

  public async findIdOrCreateByName(cardName: string) {
    let cardId = await this.lookupCardIdByCardName(cardName, false)
    if (!cardId) {
      cardId = uuid()
      await this.updateCard({ id: cardId, name: cardName, img: '', rank: -1, url: '' })
    }

    return cardId
  }

  public async listCards() {
    const snapshot = await this.collection().get()
    return snapshot.docs.map((doc) => doc.data())
  }

  public async listCardList() {
    let cards = await this.collection().get()
    const cardList = cards.docs.map((card) => card.data() as CardValue)
    return cardList
  }
}
