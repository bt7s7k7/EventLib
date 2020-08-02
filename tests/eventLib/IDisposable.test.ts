import { expect } from "chai"
import { $$getDisposeActions, DISPOSE_OF_ACTION_ID, makeDisposable } from "../../src/eventLib/IDisposable"

describe("IDisposable", () => {
    it("Should be made without errors", () => {
        const _ = makeDisposable()
    })

    describe("addDisposeAction", () => {
        it("Should add a dispose action", () => {
            const d1 = makeDisposable()
            const d2 = makeDisposable()
            const action = () => { }

            d1.addDisposeAction(d2, "test", action)

            let actions = d1[$$getDisposeActions]()
            expect(actions.get(d2)).to.not.be.null
            expect(actions.get(d2)!["test"]).to.not.be.null
            expect(actions.get(d2)!["test"]).to.equal(action)
        })

        it("Should add a dispose of action to the target object", () => {
            const d1 = makeDisposable()
            const d2 = makeDisposable()
            const action = () => { }

            d2.addDisposeAction(d1, "test", action)

            let actions = d1[$$getDisposeActions]()
            expect(actions.get(d2)).to.not.be.null
            expect(actions.get(d2)![DISPOSE_OF_ACTION_ID]).to.not.be.null
            expect(typeof actions.get(d2)![DISPOSE_OF_ACTION_ID]).to.equal("function")
        })
    })

    describe("removeDisposeAction", () => {
        it("Should remove a dispose action", () => {
            const d1 = makeDisposable()
            const d2 = makeDisposable()
            const action = () => { }

            d1.addDisposeAction(d2, "test", action)

            let actions = d1[$$getDisposeActions]()
            expect(actions.get(d2)).to.not.be.null

            d1.removeDisposeAction(d2, "test")

            actions = d1[$$getDisposeActions]()
            expect(actions.get(d2)).to.be.undefined
        })

        it("Should not throw on invalid object provided", () => {
            const d1 = makeDisposable()
            const d2 = makeDisposable()

            d1.removeDisposeAction(d2, "test")
        })
    })

    describe("dispose", () => {
        it("Should execute the dispose callback", () => {
            let counter = 0
            const disposable = makeDisposable(() => counter++)
            disposable.dispose()
            expect(counter).to.equal(1)
        })

        it("Should dispose of stuff", () => {
            let counter = 0

            const d1 = makeDisposable(() => counter++)
            const d2 = makeDisposable()

            d1.addDisposeAction(d2, "test", () => counter++)

            d1.dispose()
            expect(counter).to.equal(2)
        })

        it("Should remove dispose functions of linked objects", () => {
            let counter = 0

            const d1 = makeDisposable(() => counter++)
            const d2 = makeDisposable()

            d1.addDisposeAction(d2, "test", () => counter++)

            d2.dispose()
            expect(counter).to.equal(1)
            d1.dispose()
            expect(counter).to.equal(2)
        })

        it("Should call dispose on all disposable properties", () => {
            let counter = 0
            const disposable = {
                ...makeDisposable(),
                d1: makeDisposable(() => counter++)
            }

            disposable.dispose()
            expect(counter).to.equal(1)
        })
    })
})