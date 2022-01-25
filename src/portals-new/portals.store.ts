import { PortalsModel } from './portals.model'
import { PortalsValue } from './portals.value'
import { v4 as uuid } from 'uuid'

export class PortalsStore {
  constructor(protected db: FirebaseFirestore.Firestore) {}

  protected collection() {
    return this.db.collection('test_portals')
  }

  public async updatePortalRetailer(portalData: PortalsModel) {
    const data = { ...portalData.data }

    const cardId = await this.lookupPortalIdByCardName(data.name, true)
    data.id = cardId
    
    await this.collection().doc(data.id).set({ ...data, updatedAt: new Date })
  }

  public async lookupPortalRetailersOlderThanDate(importStartDate: Date) {
    const result = await this.collection().where('uploadedAt', '<', importStartDate).get()
    return result.docs.map((doc) => PortalsModel.init(doc.data() as PortalsValue))
  }

  public async lookupPortalIdByCardName(portalName: string, generateIdIfNotFound: boolean = true): Promise<string> {
    const snapshot = await this.collection().where('name', '==', portalName).limit(1).get()
    if (snapshot.empty) {
      return generateIdIfNotFound ? uuid() : ''
    }

    return snapshot.docs[0].id
  }

  public async deletePortalRetailer(id: string) {
    await this.collection().doc(id).delete()
  }

  public async lookupCard(id: string): Promise<PortalsValue> {
    const doc = await this.collection().doc(id).get()

    return doc.exists ? doc.data() as PortalsValue : { id: '', name: '', img: '', rank: -1, url: '' }
  }

  public async lookupCardByHostName(host: string): Promise<any> {
    const snapshot = await this.collection().where('name', '==', host).limit(1).get()

    return snapshot.empty ? '' : snapshot.docs[0].id
  }
}

