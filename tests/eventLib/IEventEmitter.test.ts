import { expect } from "chai"
import { EventEmitter } from "../../src/eventLib/EventEmitter"
import { EventListener } from "../../src/eventLib/EventListener"

describe("IEventEmitter", () => {
    it("Should not throw on valid input", () => {
        new EventEmitter<number>()
    })

    describe("add()", () => {
        it("Should add a listener and return its id", () => {
            let listenerObject = new EventListener()
            let emitter = new EventEmitter<number>()
            let listener = (event: number) => console.log(event)
            let id = emitter.add(listenerObject, listener)

            // @ts-ignore
            let listeners = emitter.listeners
            expect(listeners).to.deep.equal({ [id]: { listener, once: false, listenerObject: listenerObject } })

            emitter.dispose()
            listenerObject.dispose()
        })

        it("Should store the correct `.once` setting", () => {
            let listenerObject = new EventListener()
            let emitter = new EventEmitter<number>()
            let listener = (event: number) => console.log(event)
            let id = emitter.add(listenerObject, listener, true)

            // @ts-ignore
            let listeners = emitter.listeners
            expect(listeners).to.deep.equal({ [id]: { listener, once: true, listenerObject: listenerObject } })

            emitter.dispose()
            listenerObject.dispose()
        })
    })

    describe("remove()", () => {
        it("Should remove a listener with the id", () => {
            let listenerObject = new EventListener()
            let emitter = new EventEmitter<number>()
            let listener = (event: number) => console.log(event)
            let id1 = emitter.add(listenerObject, listener, true)
            let id2 = emitter.add(listenerObject, listener, true)

            emitter.remove(id1)

            // @ts-ignore
            let listeners = emitter.listeners
            expect(listeners).to.deep.equal({ [id2]: { listener, once: true, listenerObject: listenerObject } })

            emitter.dispose()
            listenerObject.dispose()
        })

        it("Should throw `RangeError` on wrong id", () => {
            let emitter = new EventEmitter<number>()

            expect(() => {
                emitter.remove("wrong")
            }).to.throw(RangeError)
        })
    })

    describe("emit()", () => {
        it("Should call all callbacks", () => {
            let listenerObject = new EventListener()
            let emitter = new EventEmitter<number>()
            let count = 0
            emitter.add(listenerObject, () => count++)
            emitter.add(listenerObject, () => count++)
            emitter.add(listenerObject, () => count++)

            emitter.emit(0)
            expect(count).to.equal(3)

            listenerObject.dispose()
            emitter.dispose()
        })

        it("Should remove once listeners", () => {
            let listenerObject = new EventListener()
            let emitter = new EventEmitter<number>()
            let count = 0
            emitter.add(listenerObject, () => count++)
            let id = emitter.add(listenerObject, () => count++, true)
            emitter.add(listenerObject, () => count++, true)
            emitter.add(listenerObject, () => count++)

            emitter.emit(0)
            expect(count).to.equal(4)
            count = 0

            emitter.emit(0)
            expect(count).to.equal(2)

            listenerObject.dispose()
            emitter.dispose()
        })

        it("Should provide the disposable that registered the event", () => {
            let emitter = new EventEmitter<void>()
            let count = 0
            let listenerObject = new EventListener()
            emitter.add(listenerObject, (_, object) => {
                expect(listenerObject).to.eq(object)
                count++
            })

            emitter.emit(void 0)

            expect(count).to.equal(1)
        })
    })

    describe("promise()", () => {
        it("Should resolve a promise on emit", (done) => {
            let listenerObject = new EventListener()
            let emitter = new EventEmitter<number>()
            let counter = 0
            emitter.promise(listenerObject).then(() => counter++)
            emitter.emit(0)

            setTimeout(() => {
                expect(counter).to.equal(1)
                done()

                listenerObject.dispose()
                emitter.dispose()
            }, 1)
        })
    })
})