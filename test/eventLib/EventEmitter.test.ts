import { expect } from "chai"
import { DisposeObserver, EventEmitter } from "../../src/eventLib/EventEmitter"
import { EventListener } from "../../src/eventLib/EventListener"
import { describeMember } from "../testUtil/describeMember"
import { describeMembers } from "../testUtil/describeMembers"
import { tracker } from "../testUtil/tracker"

describeMembers(() => new EventEmitter<number>(), {
    add() {
        it("Should add a listener to the emitter", () => {
            const emitter = new EventEmitter<number>()
            const listener = new EventListener()

            const emitTracker = tracker("emitTracker")

            emitter.add(listener, () => emitTracker.trigger())

            emitter.emit(5)

            emitTracker.check()

            emitter.emit(10)

            emitTracker.check(2)
        })

        it("Should correctly set the once", () => {
            const emitter = new EventEmitter<number>()
            const listener = new EventListener()

            const emitTracker = tracker("emitTracker")

            emitter.add(listener, () => emitTracker.trigger(), true)

            emitter.emit(5)

            emitTracker.check()

            emitter.emit(10)

            emitTracker.check()
        })

        it("Should not call disposed listeners", () => {
            const emitter = new EventEmitter<number>()
            const listener = new EventListener()

            const emitTracker = tracker("emitTracker")

            emitter.add(listener, () => emitTracker.trigger())

            emitter.emit(5)

            emitTracker.check()

            listener.dispose()

            emitter.emit(10)

            emitTracker.check()
        })
    },
    promise: () => {
        it("Should return a promise and resolve it", (done) => {
            const emitter = new EventEmitter<number>()
            const listener = new EventListener()

            const emitTracker = tracker("emitTracker")

            emitter.promise(listener).then(v => {
                emitTracker.trigger()
            })

            emitter.emit(12)

            queueMicrotask(() => {
                emitTracker.check()
                done()
            })
        })
    },
    remove: () => {
        it("Should remove the listener", () => {
            const emitter = new EventEmitter<number>()
            const listener = new EventListener()

            const emitTracker = tracker("emitTracker")

            const handle = emitter.add(listener, () => emitTracker.trigger())

            emitter.emit(5)

            emitTracker.check()

            handle.remove()

            emitter.emit(10)

            emitTracker.check()
        })
    },
    emit: () => {
        it("Should emit the correct value", () => {
            const emitter = new EventEmitter<number>()
            const listener = new EventListener()

            let value = 0

            emitter.add(listener, (event) => {
                value = event
            })

            emitter.emit(5)

            expect(value).to.equal(5)
        })
    },
    dispose: () => {
        it("Should internally delete the listener ref on dispose of listener", () => {
            const emitter = new EventEmitter<number>()
            const listener = new EventListener()

            const id = emitter.add(listener, () => { })

            listener.dispose()

            // @ts-ignore
            expect(emitter.listeners).to.deep.equal({})
        })
    },
    listeners: null
})

describeMember(() => DisposeObserver, () => {
    it("Should emit an event when the target is disposed", () => {
        const target = new EventListener()
        const observer = new DisposeObserver(target.getWeakRef())

        const emitTracker = tracker("emitTracker")

        observer.onDispose.add(null, () => {
            emitTracker.trigger()
        })

        target.dispose()

        emitTracker.check()
    })
})