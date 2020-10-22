import { expect } from "chai";
import { EventListener, EVENT_LISTENER_REF } from "../../src/eventLib/EventListener";
import { describeMembers } from "../testUtil/describeMembers";

describeMembers(() => new EventListener(), {
    dispose: () => {
        it("Should also dispose the retuned ref", () => {
            const listener = new EventListener()
            const ref = listener[EVENT_LISTENER_REF]()

            expect(ref.tryGetValue()).to.equal(listener)

            listener.dispose()

            expect(ref.tryGetValue()).to.be.null
        })
    },
    shared: null
})