export class ConfigStore {
  constructor(protected db: FirebaseFirestore.Firestore) {}

  protected collection() {
    return this.db.collection('_config')
  }

  public async getValue(key: string): Promise<any> {
    const doc = await this.collection().doc(key).get()
    return doc.data()
  }

  public async setValue(key: string, value: any) {
    await this.collection().doc(key).set(value)
  }
}
