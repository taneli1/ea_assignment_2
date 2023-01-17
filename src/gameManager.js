import { Table } from "./base/table.js"
import { Deck } from "./base/deck.js"
import { Player, Dealer } from "./base/player.js"
import { Blackjack } from "./games/blackjack.js"

export class GameManager {
  /**
   * Setup a Table of blackjack.
   *
   * Note: UI does not support more than 1 player.
   * @param {string[]} playerNames
   * @returns {Table}
   */
  static setupBlackjackTable = (playerNames) => {
    const table = this.#createTable(playerNames)
    const bj = new Blackjack()
    table.registerGame(bj)
    return table
  }

  static #createTable = (playerNames) => {
    const dealer = new Dealer()
    const players = playerNames.map((it) => new Player(it))
    const deck = new Deck(6)
    return new Table(dealer, players, deck)
  }
}
