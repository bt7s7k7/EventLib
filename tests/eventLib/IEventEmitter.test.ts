import { expect } from "chai"
import { makeDisposable } from "../../src/eventLib/IDisposable"
import { $$getListeners, makeEventEmitter } from "../../src/eventLib/IEventEmitter"

describe("IEventEmitter", () => {
    it("Should not throw on valid input", () => {
        makeEventEmitter<number>()
    })

    describe("add()", () => {
        it("Should add a listener and return its id", () => {
            let disposable = makeDisposable()
            let emitter = makeEventEmitter<number>()
            let listener = (event: number) => console.log(event)
            let id = emitter.add(disposable, listener)

            expect(emitter[$$getListeners]()).to.deep.equal({ [id]: { listener, once: false, object: emitter[$$getListeners]()[id].object } })

            disposable.dispose()
            emitter.dispose()
        })

        it("Should store the correct `.once` setting", () => {
            let disposable = makeDisposable()
            let emitter = makeEventEmitter<number>()
            let listener = (event: number) => console.log(event)
            let id = emitter.add(disposable, listener, true)

            expect(emitter[$$getListeners]()).to.deep.equal({ [id]: { listener, once: true, object: emitter[$$getListeners]()[id].object } })

            disposable.dispose()
            emitter.dispose()
        })
    })

    describe("remove()", () => {
        it("Should remove a listener with the id", () => {
            let disposable = makeDisposable()
            let emitter = makeEventEmitter<number>()
            let listener = (event: number) => console.log(event)
            let id1 = emitter.add(disposable, listener)
            let id2 = emitter.add(disposable, listener)

            emitter.remove(id1)
            expect(emitter[$$getListeners]()).to.deep.equal({ [id2]: { listener, once: false, object: emitter[$$getListeners]()[id2].object } })

            disposable.dispose()
            emitter.dispose()
        })

        it("Should throw `RangeError` on wrong id", () => {
            let emitter = makeEventEmitter<number>()

            expect(() => {
                emitter.remove("wrong")
            }).to.throw(RangeError)
        })
    })

    describe("emit()", () => {
        it("Should call all callbacks", () => {
            let disposable = makeDisposable()
            let emitter = makeEventEmitter<number>()
            let count = 0
            emitter.add(disposable, () => count++)
            emitter.add(disposable, () => count++)
            emitter.add(disposable, () => count++)

            emitter.emit(0)
            expect(count).to.equal(3)

            disposable.dispose()
            emitter.dispose()
        })

        it("Should remove once listeners", () => {
            let disposable = makeDisposable()
            let emitter = makeEventEmitter<number>()
            let count = 0
            emitter.add(disposable, () => count++)
            let id = emitter.add(disposable, () => count++, true)
            emitter.add(disposable, () => count++, true)
            emitter.add(disposable, () => count++)

            emitter.emit(0)
            expect(count).to.equal(4)
            count = 0

            emitter.emit(0)
            expect(count).to.equal(2)

            disposable.dispose()
            emitter.dispose()
        })
    })

    describe("promise()", () => {
        it("Should resolve a promise on emit", (done) => {
            let disposable = makeDisposable()
            let emitter = makeEventEmitter<number>()
            let counter = 0
            emitter.promise(disposable).then(() => counter++)
            emitter.emit(0)

            setTimeout(() => {
                expect(counter).to.equal(1)
                done()

                disposable.dispose()
                emitter.dispose()
            }, 1)
        })
    })
})