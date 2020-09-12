import { expect } from "chai"
import { Disposable } from "../../src/eventLib/Disposable"

describe("IDisposable", () => {
    it("Should be made without errors", () => {
        const _ = new Disposable()
    })

    describe("dispose", () => {
        it("Should call dispose on all properties with dispose()", () => {
            let counter = 0

            let target = new class extends Disposable {
                disp = { dispose() { counter++ } }
            }()

            target.dispose()

            expect(counter).to.eq(1)
        })
    })
})