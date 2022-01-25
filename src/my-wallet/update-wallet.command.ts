import { MyWalletStore } from './my-wallet.store'

interface UpdateWalletCommandRequest {
  walletId: string
  cardIds: string[]
}

export class UpdateWalletCommand {
  constructor(protected store: MyWalletStore) {}

  public async execute({ walletId, cardIds }: UpdateWalletCommandRequest): Promise<void> {
    await this.store.updateWallet(walletId, cardIds)
  }
}
