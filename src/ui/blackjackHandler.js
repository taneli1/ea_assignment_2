import { EType } from "../base/gameEvent.js"
import { Table } from "../base/table.js"
import { Blackjack } from "../games/blackjack.js"

/**
 * Handles events + ui updating for the bj game.
 * Current impl only suitable for a single player + dealer.
 */
export class BlackjackHandler {
  containerPlayerActions = document.getElementById("player-actions")
  containerDealerCards = document.getElementById("container-dealer-cards")
  containerPlayerCards = document.getElementById("container-player-cards")

  textDealerValue = document.getElementById("text-dealer-value")
  textPlayerValue = document.getElementById("text-player-value")

  btnDraw = document.getElementById("bj-btn-draw")
  btnStand = document.getElementById("bj-btn-stand")
  btnRestart = document.getElementById("btn-game-restart")

  gameResult = document.getElementById("game-result")
  gameResultText = document.getElementById("game-result-text")

  /**
   * @param {Table} table
   */
  constructor(table) {
    this.table = table

    this.btnDraw.addEventListener("click", () => {
      table.performPlayerAction(Blackjack.PACTION_DRAW)
    })

    this.btnStand.addEventListener("click", () => {
      table.performPlayerAction(Blackjack.PACTION_STAND)
    })

    this.btnRestart.addEventListener("click", () => {
      table.resetGame()
      this.gameResult.classList.add("hidden")
      this.containerDealerCards.replaceChildren()
      this.containerPlayerCards.replaceChildren()
      this.textDealerValue.innerText = ""
      this.textPlayerValue.innerText = ""
      table.startGame()
    })
  }

  onGameEventReceived = (event) => {
    console.log(`Event received: ${event.type.toString()}`)
    switch (event.type) {
      case EType.CardDrawn:
        this.#cardDraw(event)
        break
      case EType.PlayerActionRequired:
        this.#requestPlayerAction(event)
        break
      case EType.PlayerAction:
        this.#playerAction(event)
        break
      case EType.GameEnd:
        this.#gameEnd(event)
        break
      default:
        console.error(
          `This GameEvent handler can't handle this type of event: ${event.type}`
        )
    }
  }

  #cardDraw = async (ev) => {
    const pid = ev.data.pid
    const card = ev.data.card
    const playerNumber = this.table.getPlayerNumber(pid)
    const cardEl = BlackjackHandler.createCard(card)

    // Dealer
    if (playerNumber === 0) {
      const children = this.containerDealerCards.children

      // Replace upside down card if it exists
      if (
        children.length == 2 &&
        (await this.table.getDealerCards()).length == 2
      ) {
        this.containerDealerCards.replaceChild(cardEl, children[1])
        this.textDealerValue.innerText = Blackjack.handValue(
          await this.table.getDealerCards()
        )
        return
      }

      this.containerDealerCards.appendChild(cardEl)
      this.textDealerValue.innerText = Blackjack.handValue(
        await this.table.getDealerCards()
      )
      return
    }

    // Only one player
    this.containerPlayerCards.appendChild(cardEl)
    this.textPlayerValue.innerText = Blackjack.handValue(
      await this.table.getPlayerCards(pid)
    )
  }

  #requestPlayerAction = (event) => {
    this.containerPlayerActions.classList.remove("hidden")
  }

  #playerAction = (event) => {
    console.log("Received player action event confirmation: " + event)
  }

  #gameEnd = (event) => {
    const playerWin = event.data.win

    if (playerWin === true) {
      this.gameResultText.innerText = "You win!"
    } else {
      this.gameResultText.innerText = "You lose."
    }

    this.gameResult.classList.remove("hidden")
    this.containerPlayerActions.classList.add("hidden")
  }

  /**
   * @param {Card} card
   */
  static createCard = (card) => {
    const e = document.createElement("img")
    e.classList = "h-60 w-25 playing-card"
    e.src = card.image
    return e
  }
}
