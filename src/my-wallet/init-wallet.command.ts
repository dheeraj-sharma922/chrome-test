import { MyWalletStore } from './my-wallet.store'
import { UpdateWalletCommand } from './update-wallet.command'

interface InitWalletCommandRequest {
  cardIds: string[]
}

interface InitWalletCommandResponse {
  walletId: string
}

export class InitWalletCommand {
  constructor(protected store: MyWalletStore) {}

  public async execute({ cardIds }: InitWalletCommandRequest): Promise<InitWalletCommandResponse> {
    const walletId = await this.store.createWallet()

    await new UpdateWalletCommand(this.store).execute({ walletId, cardIds })
    return { walletId }
  }
}
