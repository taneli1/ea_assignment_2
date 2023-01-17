import { Card } from "./card.js"

export class Deck {
  #deckId = null
  constructor(deckCount = 6) {
    this.deckCount = deckCount
  }

  /**
   * (Re)initialize this instance with a new deck of cards.
   */
  init = async () => {
    const result = await fetch(
      `https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${this.deckCount}`
    )
    const data = await result.json()
    this.#deckId = data.deck_id
    console.log("Deck initialized successfully.")
  }

  /**
   * @param {number} count number of cards drawn
   * @returns {Card} Card[]
   */
  draw = async (count = 1) => {
    const result = await fetch(
      `https://www.deckofcardsapi.com/api/deck/${
        this.#deckId
      }/draw/?count=${count}`
    )
    const data = await result.json()
    return [...data.cards].map((it) => {
      return new Card(it.value, it.suit, it.code, it.image)
    })
  }

  /**
   * @returns true if successfully shuffled
   */
  shuffle = async () => {
    const result = await fetch(
      `https://www.deckofcardsapi.com/api/deck/${this.#deckId}/shuffle/`
    )
    const data = await result.json()
    return data.shuffled
  }

  isReady = () => {
    return this.#deckId != null
  }
}
