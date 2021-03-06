import { Disposable, DISPOSE } from "../../src/eventLib/Disposable";
import { describeMembers } from "../testUtil/describeMembers";
import { tracker } from "../testUtil/tracker";

describeMembers(() => new Disposable(), {
    dispose(instance) {
        it("Should call dispose on all properties", () => {
            const callTracker = tracker("callTracker")
            Object.assign(instance, { property_d: { [DISPOSE]: () => callTracker.trigger() }, onEvent: { [DISPOSE]: () => callTracker.trigger() } })

            instance.dispose()

            callTracker.check(2)
        })
    }
})