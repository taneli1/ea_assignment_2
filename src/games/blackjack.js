import { Game } from "../base/game.js"
import { EType, GameEvent } from "../base/gameEvent.js"
import { FaceDownCard } from "../base/card.js"

export class Blackjack extends Game {
  static PACTION_DRAW = Symbol("bj-player-draw-card")
  static PACTION_STAND = Symbol("bj-player-stand")
  static PACTION_BUST = Symbol("bj-player-bust")

  #gameEvents = []
  #faceDownHouseCard = null

  deal = async () => {
    //  --- Game start ---
    const table = this.getTable()
    const deck = table.deck
    await deck.init()
    const housePid = table.dealer.pid

    // House draw
    await this.#drawOne(housePid)

    // Players draw one
    for (const player of table.players) {
      await this.#drawOne(player.pid)
    }

    // House draw
    await this.#drawFaceDown(housePid)

    // Players draw one
    for (const player of table.players) {
      await this.#drawOne(player.pid)
    }

    // Request action from the first player to get the game started
    const pid = table.players[0].pid
    this.#promptPlayerAction(pid)
  }

  performPlayerAction = async (action) => {
    // Check if user input was requested - no pid checks though
    const lastEvent = this.#gameEvents[this.#gameEvents.length - 1]
    if (lastEvent.type !== EType.PlayerActionRequired) {
      console.log("The is not in a state to accept user input.")
      return
    }

    const pid = lastEvent.data.pid
    if (action === Blackjack.PACTION_DRAW) this.#pactionDraw(pid)
    if (action === Blackjack.PACTION_STAND) this.#pactionStand(pid)

    // After player input, run the game loop to check game state
    this.#gameLoop()
  }

  getPlayerActionOptions = async (action) => {
    throw new Error("Method 'getPlayerActionOptions()' is not implemented.")
  }

  getPlayerCards = async (playerId) => this.#getDrawnCardsFor(playerId)

  getDealerCards = async () =>
    this.#getDrawnCardsFor(this.getTable().dealer.pid).filter(
      (it) => it.value !== null
    )

  reset = async () => {
    await this.getTable().deck.shuffle()
    this.#gameEvents = []
  }

  #promptPlayerAction = (pid) => {
    const ev = new GameEvent(EType.PlayerActionRequired, { pid })
    this.#gameEvents.push(ev)
    this.getTable().notifyGameListeners(ev)
  }

  #pactionDraw = async (pid) => {
    const paction = new GameEvent(EType.PlayerAction, {
      pid,
      action: Blackjack.PACTION_DRAW,
    })
    this.#gameEvents.push(paction)
    this.getTable().notifyGameListeners(paction)
    await this.#drawOne(pid)
    this.#gameLoop()
  }

  #pactionStand = (pid) => {
    const paction = new GameEvent(EType.PlayerAction, {
      pid,
      action: Blackjack.PACTION_STAND,
    })
    this.#gameEvents.push(paction)
    this.getTable().notifyGameListeners(paction)
    this.#gameLoop()
  }

  #gameLoop = () => {
    const lastEvent = this.#gameEvents[this.#gameEvents.length - 1]
    const type = lastEvent.type
    const pid = lastEvent.data.pid
    const table = this.getTable()

    const cardDrawnByPlayer =
      type === EType.CardDrawn && pid !== table.dealer.pid

    if (cardDrawnByPlayer) {
      const playerCards = this.#getDrawnCardsFor(pid)
      const total = Blackjack.handValue(playerCards)

      if (total > 21) {
        this.#playerBust(pid)
        this.#gameLoop()
      } else this.#promptPlayerAction(pid)
      return
    }

    const playerBust =
      lastEvent.type === EType.PlayerAction &&
      lastEvent.data.action === Blackjack.PACTION_BUST

    if (playerBust) {
      const event = new GameEvent(EType.GameEnd, {
        pid,
        win: false,
      })
      this.#gameEvents.push(event)
      table.notifyGameListeners(event)
    }

    const playerStand =
      lastEvent.type === EType.PlayerAction &&
      lastEvent.data.action === Blackjack.PACTION_STAND

    // TODO More players - since the app only requires one player this is fine for now.
    if (playerStand) {
      this.#playDealer()
    }
  }

  #playerBust = (pid) => {
    const event = new GameEvent(EType.PlayerAction, {
      pid,
      action: Blackjack.PACTION_BUST,
    })
    this.#gameEvents.push(event)
    this.getTable().notifyGameListeners(event)
  }

  #playDealer = async () => {
    const table = this.getTable()
    const dpid = table.dealer.pid

    if (this.#faceDownHouseCard !== null) {
      // 'Turn' the second drawn card
      const event = new GameEvent(EType.CardDrawn, {
        pid: dpid,
        card: this.#faceDownHouseCard,
      })
      this.#gameEvents.push(event)
      table.notifyGameListeners(event)
      this.#faceDownHouseCard = null
      await this.#playDealer()
      return
    }

    const cards = this.#getDrawnCardsFor(dpid).filter((it) => it.value !== null)
    const dealerTotal = Blackjack.handValue(cards)

    if (dealerTotal < 17) {
      await this.#drawOne(dpid)
      await this.#playDealer()
      return
    }

    // Check who won TODO multiple players
    const pid = table.players[0]

    if (dealerTotal > 21) {
      this.#gameEnd(pid, true)
      return
    }

    const playerCards = this.#getDrawnCardsFor(pid)
    const playerTotal = Blackjack.handValue(playerCards)
    this.#gameEnd(pid, playerTotal >= dealerTotal)
  }

  #gameEnd = (pid, win) => {
    const event = new GameEvent(EType.GameEnd, {
      pid,
      win: win,
    })
    this.#gameEvents.push(event)
    this.getTable().notifyGameListeners(event)
  }

  // Does not return the face down dealer card
  #getDrawnCardsFor = (pid) => {
    return this.#gameEvents
      .filter(
        (event) => event.data.pid === pid && event.type === EType.CardDrawn
      )
      .map((it) => it.data.card)
  }

  #drawOne = async (pid) => {
    const table = this.getTable()
    const card = (await table.deck.draw(1))[0]
    const event = new GameEvent(EType.CardDrawn, {
      pid: pid,
      card: card,
    })
    this.#gameEvents.push(event)
    table.notifyGameListeners(event)
  }

  #drawFaceDown = async (pid) => {
    const table = this.getTable()
    const card = (await table.deck.draw(1))[0]
    const event = new GameEvent(EType.CardDrawn, {
      pid: pid,
      card: new FaceDownCard(card.id),
    })
    table.notifyGameListeners(event)
    this.#gameEvents.push(event)
    this.#faceDownHouseCard = card
  }

  /**
   * @param {Card[]} cards
   * @returns {number} total combined value of the cards
   */
  static handValue = (cards) => {
    let ace = false

    const total = cards
      .map((card) => {
        const val = card.value

        if (val === "ACE") {
          ace = true
          return 1
        }

        if (!isNaN(val)) {
          return val
        }

        // Other cards 10
        return 10
      })
      .reduce((a, b) => parseInt(a) + parseInt(b), 0)

    if (ace && total + 10 <= 21) {
      return total + 10
    }
    return total
  }
}
