/**
 * Events that happen in a game.
 *
 * Used to track game state internally within a game and
 * notify game listeners about events (eg. to update UI, ask for user input..).
 */
export class GameEvent {
  constructor(type, data) {
    this.type = type
    this.data = data
  }
}

/**
 * Event types to notify the listeners about
 *
 * (pid - who the event is directed to)
 */
export const EType = {
  CardDrawn: Symbol("card-drawn"), // data: { pid: string, card: Card }
  PlayerActionRequired: Symbol("player-action-required"), // data: { pid : string }
  PlayerAction: Symbol("player-action"), // data: { pid : string, action: typeOfAction(would depend on the game) }
  GameEnd: Symbol("game-end"), // data: { pid: string, win: bool }
}
