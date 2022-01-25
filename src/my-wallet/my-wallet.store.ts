import { v4 as uuid } from 'uuid'
import { WalletValue } from './wallet.value'

export class MyWalletStore {
  constructor(protected db: FirebaseFirestore.Firestore) {}

  protected collection() {
    return this.db.collection('wallet')
  }

  public async updateWallet(walletId: string, cardIds: string[]) {
    await this.collection().doc(walletId).set({
      walletId,
      cardIds,
      updatedAt: new Date()
    })
  }

  public async createWallet(): Promise<string> {
    return uuid()
  }

  public async getWallet(walletId: string): Promise<WalletValue> {
    const wallet = await this.collection().doc(walletId).get()
    return wallet.data() as WalletValue
  }
}
