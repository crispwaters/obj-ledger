class Ledger {
  #values
  #logNewProperties

  static setProperty (ledger, key, value) {
    if (ledger.obj[key] !== undefined) return
    if (ledger.#logNewProperties) ledger.log.push({ [key]: { from: ledger.#values[key], to: value } })
    ledger.#values[key] = value
    Object.defineProperty(ledger.obj, key, {
      get () { return ledger.#values[key] },
      set (value) {
        if (value !== ledger.#values[key]) ledger.log.push({ [key]: { from: ledger.#values[key], to: value } })
        ledger.#values[key] = value
      }
    })
  }

  static deleteProperty (ledger, key) {
    if (ledger.#values[key] !== undefined) {
      ledger.log.push({ [key]: { from: ledger.#values[key], to: undefined } })
      delete ledger.#values[key]
    }
  }

  constructor (obj) {
    this.#values = {}
    this.#logNewProperties = false
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
    this.#logNewProperties = true
  }

  set (key, value) {
    if (this.obj[key] !== undefined) this.obj[key] = value
    else Ledger.setProperty(this, key, value)
  }

  update (values) {
    const updates = {}
    this.#logNewProperties = false
    for (const [key, value] of Object.entries(values)) {
      if (this.#values[key] !== value) updates[key] = { from: this.#values[key], to: value }
      if (this.#values[key] === undefined) Ledger.setProperty(this, key, value)
      this.#values[key] = value
    }
    if (Object.keys(updates).length) this.log.push(updates)
    this.#logNewProperties = true
  }
}

module.exports = Ledger
