import { RecommendationValue } from './recommendation.value'
import { v4 as uuid } from 'uuid'
import { CardValue } from '../card/card.value'

const crypto = require('crypto')

export class RecommendationStore {
  constructor(protected db: FirebaseFirestore.Firestore) {}

  protected collection() {
    return this.db.collection('recommendation')
  }

  public async lookupRecommendationsByCardAndCategory(card: CardValue, category: string): Promise<RecommendationValue[]> {
    const result = await this.collection()
        .where('cardId', '==', card.id)
        .where('category', '==', category)
        .get()

    return result.docs.map((doc) => doc.data()) as RecommendationValue[]
  }

  public async updateRecommendation(recommendation: RecommendationValue) {
    const metaHash = crypto.createHash('sha256').update(JSON.stringify(recommendation.meta)).digest('base64')

    const results = await this.collection()
        .where('cardId', '==', recommendation.cardId)
        .where('category', '==', recommendation.category)
        .where('metaHash', '==', metaHash)
        .limit(1)
        .get()

    if (results.empty) {
      recommendation.id = uuid()
    }
    else {
      recommendation.id = results.docs[0].id
    }

    await this.collection().doc(recommendation.id).set({ ...recommendation, metaHash, updatedAt: new Date() })
  }

  public async lookupRecommendationsOlderThanDate(importStartDate: Date) {
    const result = await this.collection().where('updatedAt', '<', importStartDate).get()
    return result.docs.map((doc) => doc.data()) as RecommendationValue[]
  }

  public async deleteRecommendation(id: string) {
    await this.collection().doc(id).delete()
  }
}
