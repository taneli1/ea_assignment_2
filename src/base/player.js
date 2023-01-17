export class Player {
  constructor(name) {
    this.pid = crypto.randomUUID()
    this.name = name
  }
}

export class Dealer extends Player {
  pid = crypto.randomUUID()
  name = "Dealer"
}
