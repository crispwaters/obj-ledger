class Ledger {
  #values
  #logUpdates

  static setProperty (ledger, key, value) {
    if (ledger.obj[key] === undefined) {
      Object.defineProperty(ledger.obj, key, {
        get () { return ledger.#values[key] },
        set (value) {
          if (ledger.#logUpdates && value !== ledger.#values[key]) ledger.log.push({ [key]: { from: ledger.#values[key], to: value } })
          ledger.#values[key] = value
        }
      })
    }
    ledger.obj[key] = value
  }

  static deleteProperty (ledger, key) {
    if (ledger.#values[key] !== undefined) {
      ledger.log.push({ [key]: { from: ledger.#values[key], to: undefined } })
      delete ledger.#values[key]
    }
  }

  constructor (obj) {
    this.#values = {}
    this.#logUpdates = false
    this.log = []
    Object.defineProperty(this, 'original', {
      value: Object.freeze({ ...obj }),
      writable: false
    })
    Object.defineProperty(this, 'final', {
      get () { return Object.freeze({ ...this.#values }) }
    })
    Object.defineProperty(this, 'obj', {
      value: {},
      writable: false
    })
    for (const [key, value] of Object.entries(obj)) {
      Ledger.setProperty(this, key, value)
    }
    this.#logUpdates = true
  }

  set (key, value) {
    Ledger.setProperty(this, key, value)
  }

  update (values) {
    const updates = {}
    this.#logUpdates = false
    for (const [key, value] of Object.entries(values)) {
      if (this.#values[key] !== value) updates[key] = { from: this.#values[key], to: value }
      if (this.#values[key] === undefined) Ledger.setProperty(this, key, value)
      this.#values[key] = value
    }
    if (Object.keys(updates).length) this.log.push(updates)
    this.#logUpdates = true
  }
}

module.exports = Ledger
