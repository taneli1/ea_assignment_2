import { Table } from "./src/base/table.js"
import { GameManager } from "./src/gameManager.js"
import { BlackjackHandler } from "./src/ui/blackjackHandler.js"

// Init with null for intellisense
let bjTable = new Table(null, null, null)

const init = () => {
  setupBeginCard()
}

const setupBeginCard = () => {
  const nameInput = document.getElementById("input-p-name")
  const btnStart = document.getElementById("btn-start")

  nameInput.addEventListener("input", (e) => {
    const value = e.target.value
    if (value) {
      btnStart.disabled = false
    } else btnStart.disabled = true
  })

  btnStart.addEventListener("click", () => {
    const playerName = document.getElementById("input-p-name").value
    beginGame(playerName)
  })
}

const beginGame = async (playerName) => {
  displayGameUI(playerName)

  bjTable = GameManager.setupBlackjackTable([playerName])
  const handler = new BlackjackHandler(bjTable)
  bjTable.registerGameListener(handler.onGameEventReceived)
  bjTable.startGame()
}

const displayGameUI = (playerName) => {
  const beginCard = document.getElementById("card-begin")
  beginCard.classList.add("hidden")

  const bjCard = document.getElementById("card-bj")
  bjCard.classList.remove("hidden")

  document.getElementById("text-player-name").innerText = playerName
}

init()
