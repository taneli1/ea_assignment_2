export class Card {
  constructor(value, suit, code, image) {
    this.id = crypto.randomUUID()
    this.value = value
    this.suit = suit
    this.code = code
    this.image = image
  }
}

export class FaceDownCard extends Card {
  constructor(cardId) {
    super()
    this.id = cardId ?? crypto.randomUUID()
    this.value = null
    this.suit = null
    this.code = null
    this.image = "assets/card_bg.png"
  }
}
