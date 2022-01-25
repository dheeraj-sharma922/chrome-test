import { RetailerValue } from './retailer.value'
import { CardValue } from '../card/card.value'

export class RetailerModel {
  protected constructor(protected value: RetailerValue) {}

  public static init(value: RetailerValue): RetailerModel {
    return new RetailerModel(value)
  }

  public get id() { return this.value.id }

  public get host() { return this.value.host }

  public get cartPageRegex() { return this.value.cartPageRegex }

  public lookupCard(card: CardValue): { category: string } {
    const details = { ...this.value.default }
    const override = this.value.overrides.find((o) => o.cardId === card.id)
    if (override) {
      details.category = override.category || details.category
    }

    return details
  }

  public setDefault(data: { category: string }) {
    this.value.default = data
  }

  public setAlternateHosts(alternateHosts: string[]) {
    this.value.alternateHosts = alternateHosts
  }

  public setCartPageRegex(regex: string) {
    this.value.cartPageRegex = regex
  }

  public setOverride(override: { cardId: string; category: string }) {
    const overrideIndex = this.value.overrides
        .findIndex((o) => o.cardId === override.cardId)

    if (overrideIndex !== -1) {
      this.value.overrides[overrideIndex] = override
    }
    else {
      this.value.overrides.push(override)
    }
  }

  public serialize(): RetailerValue {
    return this.value
  }
}
