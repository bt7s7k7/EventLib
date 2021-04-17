import { expect } from "chai"
import { EventListener } from "../../src/eventLib/EventListener"
import { describeMembers } from "../testUtil/describeMembers"

describeMembers(() => new EventListener(), {
    dispose: () => {
        it("Should also dispose the retuned ref", () => {
            const listener = new EventListener()
            const ref = listener.getWeakRef()

            listener.dispose()

            expect(ref.tryGetValue()).to.be.null
        })
    },
    shared: null,
    getWeakRef: null
})