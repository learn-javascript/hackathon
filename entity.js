function Vector() {
    this.x = 0
    this.y = 0
}

module.exports = function Entity() {
    this.type = "herbivore" //not sure this is needed anymore
    this.age = 0
    this.alive = true // Instead of alive, why dont we just remove it?

    this.hunger = 1 // determines how much an entity eats range 0 - 100
    this.vector = new Vector()

    this.mass = Math.floor(Math.random() * 90 + 10)
    this.maxHealth = Math.floor(100 + (this.mass * .35)) // Loses health from being attack or w/e
    this.currentHealth = this.maxHealth
    this.maxDiet = this.currentDiet = Math.floor(this.mass * .35)
    this.dietLossPerTick = 2
    this.dietLossPerMove = 5
}