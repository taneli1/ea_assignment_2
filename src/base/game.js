import { Table } from "./table.js"

/**
 * 'Abstract' class for a game.
 */
export class Game {
  #table

  /**
   * @param {Table} table
   */
  setTable = (table) => {
    this.#table = table
  }

  /**
   * @returns {Table}
   */
  getTable = () => this.#table

  deal = async () => {
    throw new Error("Method 'deal()' must be implemented.")
  }

  performPlayerAction = async (action) => {
    throw new Error("Method 'performPlayerAction()' must be implemented.")
  }

  getPlayerActionOptions = async (action) => {
    throw new Error("Method 'getPlayerActionOptions()' must be implemented.")
  }

  getPlayerCards = async (playerId) => {
    throw new Error("Method 'getPlayerCards()' must be implemented.")
  }

  getDealerCards = async () => {
    throw new Error("Method 'getDealerCards()' must be implemented.")
  }

  reset = async () => {
    throw new Error("Method 'reset()' must be implemented.")
  }
}
