import { PortalsRecommModel } from './portals-recomm.model'
import { PortalsRecommValue } from './portals-recomm.value'
import { v4 as uuid } from 'uuid'
// import { PortalsValue } from '../portals-new/portals.value'

export class PortalsRecommStore {
  constructor(protected db: FirebaseFirestore.Firestore) {}

  protected collection() {
    return this.db.collection('portals_recommendation')
  }


  public async updatePortalRetailer(portalData: PortalsRecommModel) {
    const data = { ...portalData.data }
    
    data.id = uuid()
    
    await this.collection().doc(data.id).set({ ...data, updatedAt: new Date })
  }

  public async lookupPortalRetailersOlderThanDate(importStartDate: Date) {
    const result = await this.collection().where('uploadedAt', '<', importStartDate).get()
    return result.docs.map((doc) => PortalsRecommModel.init(doc.data() as PortalsRecommValue))
  }

  public async lookupPortalIdByCardName(portalName: string, generateIdIfNotFound: boolean = true): Promise<string> {
    const snapshot = await this.db.collection('test_portals').where('name', '==', portalName).limit(1).get()
    if (snapshot.empty) {
      return generateIdIfNotFound ? '' : ''
    }

    return snapshot.docs[0].id
  }

  public async deletePortalRetailer(id: string) {
    await this.collection().doc(id).delete()
  }

  public async lookupRecommendationsByPortalId(portalId: string, host: string){
    const snapshot = await this.collection().where('portalId', '==', portalId).where('category', '==', host).limit(1).get()
    return snapshot.docs.map((doc) => PortalsRecommModel.init(doc.data() as PortalsRecommValue))
  }
}

