import { Game } from "./game.js"

/**
 * Table is the main component of the app.
 *
 * A Table is to be registered with a game. The registered game
 * can be played with methods of the table instance.
 *
 * Before starting a game, the table should have atleast one GameEvent listener
 * to handle all the required events for the game.
 */
export class Table {
  #game
  // Whenever an event happens in the game (eg. card drawn), notify the table listeners about it
  #gameListeners = []

  constructor(dealer, players, deck) {
    this.id = crypto.randomUUID()
    this.dealer = dealer
    this.players = players
    this.deck = deck
  }

  /**
   * Set the table to play a game.
   * @param {Game} game
   */
  registerGame = (game) => {
    this.#game = game
    game.setTable(this)
  }

  getPlayerCards = async (playerId) => {
    return await this.#game.getPlayerCards(playerId)
  }

  getDealerCards = async () => {
    return await this.#game.getDealerCards()
  }

  performPlayerAction = async (action) => {
    return await this.#game.performPlayerAction(action)
  }

  getPlayerActionOptions = async (playerId) => {
    return await this.#game.getPlayerActionOptions(action)
  }

  startGame = async () => {
    return await this.#game.deal()
  }

  resetGame = async () => {
    return await this.#game.reset()
  }

  /**
   * Return the player number of a pid in this table (from 1 upwards).
   * Dealer pid returns 0.
   *
   * @param {string} pid
   * @returns {number}
   */
  getPlayerNumber = (pid) => {
    if (pid === this.dealer.pid) {
      return 0
    }
    const p = this.players.find((it) => it.pid === pid)
    return this.players.indexOf(p) + 1
  }

  registerGameListener = (listener) => {
    this.#gameListeners.push(listener)
  }

  notifyGameListeners = (gameEvent) => {
    for (const listener of this.#gameListeners) {
      listener(gameEvent)
    }
  }
}
