import { expect } from "chai"
import { DISPOSE } from "../../src/eventLib/Disposable"
import { ShareRef } from "../../src/eventLib/SharedRef"
import { describeMembers } from "../testUtil/describeMembers"
import { tracker } from "../testUtil/tracker"

const trackableFactory = (name: string, value: any) => {
    const callTracker = tracker(name)

    return [callTracker, { [DISPOSE]: () => callTracker.trigger(), value }] as const
}

describeMembers(() => new ShareRef(trackableFactory("", "Value")[1]), {
    value: (instance) => {
        it("Should have the value of the wrapped disposable", () => {
            expect(instance.value.value).to.equal("Value")
        })
    },
    dispose: () => {
        it("Should dispose the wrapped disposable", () => {
            const [disposeTracker, disposable] = trackableFactory("disposeTracker", "")
            const instance = new ShareRef(disposable)

            instance.dispose()

            disposeTracker.check()
        })
    },
    copy: (instance) => {
        it("Should create a instance with the same wrapped disposable", () => {
            const [, disposable] = trackableFactory("disposeTracker", "")
            const instance = new ShareRef(disposable)

            const copy = instance.copy()

            expect(instance.value).to.equal(disposable)
            expect(instance.value).to.equal(copy.value)
        })

        it("Should only dispose when all copies are disposed", () => {
            const [disposeTracker, disposable] = trackableFactory("disposeTracker", "")
            const instance = new ShareRef(disposable)

            const copy = instance.copy()

            disposeTracker.check(0)

            instance.dispose()

            disposeTracker.check(0)

            copy.dispose()

            disposeTracker.check(1)
        })
    },
    store: null,
    makeWeak: null
})
