import { expect } from "chai";
import { DISPOSE } from "../../src/eventLib/Disposable";
import { DisposedReferenceError, ShareRef } from "../../src/eventLib/SharedRef";
import { describeMembers } from "../testUtil/describeMembers";
import { tracker } from "../testUtil/tracker";

const trackableFactory = (name: string, value: any) => {
    const callTracker = tracker(name)

    return [callTracker, { [DISPOSE]: () => callTracker.trigger(), value }] as const
}

describeMembers(() => new ShareRef(trackableFactory("", 158)[1]).makeWeak(), {
    value: () => {
        it("Should return the correct value", () => {
            const [, disposable] = trackableFactory("disposeTracker", "")
            const shared = new ShareRef(disposable)
            const weak = shared.makeWeak()

            expect(weak.value).to.equal(disposable)
        })

        it("Should throw on disposed value", () => {
            const [, disposable] = trackableFactory("disposeTracker", "")
            const shared = new ShareRef(disposable)
            const weak = shared.makeWeak()

            shared.dispose()

            expect(() => {
                weak.value
            }).to.throw(DisposedReferenceError)
        })
    },
    tryGetValue: () => {
        it("Should return the correct value", () => {
            const [, disposable] = trackableFactory("disposeTracker", "")
            const shared = new ShareRef(disposable)
            const weak = shared.makeWeak()

            expect(weak.tryGetValue()).to.equal(disposable)
        })
        it("Should return null on disposed value", () => {
            const [, disposable] = trackableFactory("disposeTracker", "")
            const shared = new ShareRef(disposable)
            const weak = shared.makeWeak()

            shared.dispose()

            expect(weak.tryGetValue()).to.be.null
        })
    },
    lock: () => {
        it("Should create a SharedRef", () => {
            const [, disposable] = trackableFactory("disposeTracker", "")
            const shared = new ShareRef(disposable)
            const weak = shared.makeWeak()

            const copy = weak.lock()
        })

        it("Should throw an error on disposed value", () => {
            const [, disposable] = trackableFactory("disposeTracker", "")
            const shared = new ShareRef(disposable)
            const weak = shared.makeWeak()

            shared.dispose()

            expect(() => {
                const copy = weak.lock()
            }).to.throw(DisposedReferenceError)
        })

        it("Should create a SharedRef with the same reference counter", () => {
            const [disposeTracker, disposable] = trackableFactory("disposeTracker", "")
            const instance = new ShareRef(disposable)

            const copy = instance.makeWeak().lock()

            disposeTracker.check(0)

            instance.dispose()

            disposeTracker.check(0)

            copy.dispose()

            disposeTracker.check(1)
        })
    },
    store: null
})