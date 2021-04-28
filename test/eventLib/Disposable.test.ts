import { AUTO_DISPOSE, Disposable, DISPOSE } from "../../src/eventLib/Disposable"
import { EventEmitter } from "../../src/eventLib/EventEmitter"
import { describeMembers } from "../testUtil/describeMembers"
import { tracker } from "../testUtil/tracker"

describeMembers(() => new Disposable(), {
    dispose(instance) {
        it("Should call dispose on all autodispose properties", () => {
            const callTracker = tracker("callTracker")

            const emitter = new EventEmitter()

            emitter[DISPOSE] = () => callTracker.trigger()

            Object.assign(instance, { property: { [DISPOSE]: () => callTracker.trigger(), [AUTO_DISPOSE]: true }, onEvent: emitter })

            instance.dispose()

            callTracker.check(2)
        })
    }
})