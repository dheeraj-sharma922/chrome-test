import { RetailerModel } from './retailer.model'
import { RetailerValue } from './retailer.value'

import { v4 as uuid } from 'uuid'

export class RetailerStore {
  constructor(protected db: FirebaseFirestore.Firestore) {}

  protected collection() {
    return this.db.collection('retailer')
  }

  public async initRetailer(host: string): Promise<RetailerModel> {
    let model = await this.lookupRetailer(host)
    if (!model) {
      model = RetailerModel.init({
        id: uuid(),
        cartPageRegex: '',
        host: host,
        alternateHosts: [],
        default: { category: '' },
        overrides: []
      })
    }

    return model
  }

  public async lookupRetailer(retailer: string): Promise<RetailerModel | undefined> {
    let docs = await this.collection().where('host', '==', retailer).limit(1).get()
    if (docs.empty) {
      docs = await this.collection().where('alternateHosts', 'array-contains', retailer).limit(1).get()

      if (docs.empty) {
        return undefined
      }
    }

    return RetailerModel.init(docs.docs[0].data() as RetailerValue)
  }

  public async updateRetailer(retailer: RetailerModel) {
    await this.collection().doc(retailer.id).set({ ...retailer.serialize(), updatedAt: new Date() })
  }

  public async listRetailers(): Promise<RetailerValue[]> {
    const snapshot = await this.collection().get()
    return snapshot.docs.map((doc) => doc.data()) as RetailerValue[]
  }

  public async lookupRetailersOlderThanDate(importStartDate: Date) {
    const result = await this.collection().where('updatedAt', '<', importStartDate).get()
    return result.docs.map((doc) => doc.data()) as RetailerValue[]
  }

  public async deleteRetailer(id: string) {
    await this.collection().doc(id).delete()
  }
}

