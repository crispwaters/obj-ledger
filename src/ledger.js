class Ledger {
  #values
  #logUpdates
  #log
  #audit
  #initialized

  static setProperty (ledger, key, value) {
    if (ledger.obj[key] === undefined) {
      Object.defineProperty(ledger.obj, key, {
        get () { return ledger.#values[key] },
        set (value) {
          if (value !== ledger.#values[key]) {
            if (ledger.#logUpdates) ledger.#log.push({ [key]: { from: ledger.#values[key], to: value } })
            if (ledger.#initialized) {
              if (ledger.#audit[key] === undefined) ledger.#audit[key] = []
              ledger.#audit[key].push(value)
            }
          }
          ledger.#values[key] = value
        }
      })
    }
    ledger.obj[key] = value
  }

  static deleteProperty (ledger, key) {
    if (ledger.#values[key] !== undefined) {
      ledger.obj[key] = undefined
      delete ledger.#values[key]
    }
  }

  constructor (obj) {
    this.#values = {}
    this.#logUpdates = false
    this.#initialized = false
    this.#log = []
    this.#audit = {}
    Object.defineProperty(this, 'log', {
      get () { return Object.freeze([...this.#log]) }
    })
    Object.defineProperty(this, 'audit', {
      get () { return Object.freeze({ ...this.#audit }) }
    })
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
      this.set(key, value)
    }
    this.#logUpdates = true
    this.#initialized = true
  }

  set (key, value) {
    Ledger.setProperty(this, key, value)
  }

  delete (key, value) {
    Ledger.deleteProperty(this, key, value)
  }

  update (values) {
    const updates = {}
    this.#logUpdates = false
    for (const [key, value] of Object.entries(values)) {
      if (this.obj[key] !== value) updates[key] = { from: this.#values[key], to: value }
      if (this.obj[key] === undefined) Ledger.setProperty(this, key, value)
      this.obj[key] = value
    }
    if (Object.keys(updates).length) this.#log.push(updates)
    this.#logUpdates = true
  }
}

module.exports = Ledger
