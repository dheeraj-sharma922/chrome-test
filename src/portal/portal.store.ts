import { PortalModel } from './portal.model'
import { PortalValue } from './portal.value'

export class PortalStore {
  constructor(protected db: FirebaseFirestore.Firestore) {}

  protected collection() {
    return this.db.collection('portal_retailer')
  }

  public async lookupPortalRetailer(retailer: string, portal: string): Promise<PortalModel | undefined> {
    const docs = await this.collection().where('portal', '==', portal).where('retailer', '==', retailer).limit(1).get()
    if (docs.empty) {
      return undefined
    }

    const portalValue = docs.docs[0].data() as PortalValue
    const history = await docs.docs[0].ref.collection('history').get()
    for (const historyDoc of history.docs) {
      // @ts-ignore
      portalValue[historyDoc.id] = historyDoc
    }

    return PortalModel.init(portalValue)
  }

  public async updatePortalRetailer(portalRetailer: PortalModel) {
    const subcollections = [ 'week', 'month', 'halfyear', 'year' ]
    const data = { ...portalRetailer.data }

    for (const subcollection of subcollections) {
      // @ts-ignore
      await this.collection().doc(portalRetailer.id).collection('history').doc(subcollection).set(data[subcollection])
      // @ts-ignore
      delete data[subcollection]
    }

    await this.collection().doc(portalRetailer.id).set({ ...data, uploadedAt: new Date() })
  }

  public async lookupPortalRetailersOlderThanDate(importStartDate: Date) {
    const result = await this.collection().where('uploadedAt', '<', importStartDate).get()
    return result.docs.map((doc) => PortalModel.init(doc.data() as PortalValue))
  }

  public async deletePortalRetailer(id: string) {
    await this.collection().doc(id).delete()
  }
}

