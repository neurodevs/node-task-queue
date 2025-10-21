import AbstractSpruceTest, { generateId } from '@sprucelabs/test-utils'

export default class AbstractPackageTest extends AbstractSpruceTest {
    protected static async beforeEach() {
        await super.beforeEach()
    }

    protected static formatCallback(callback: string) {
        return `\n\nFailing callback:\n\n${callback}\n\n`
    }

    protected static formatName(name: string) {
        return `Task Name: ${name}`
    }

    protected static formatError(err: string) {
        return `\n\nOriginal error:\n\n${err}\n\n`
    }

    protected static readonly callback = () => {}
    protected static readonly callbackName = generateId()
    protected static readonly originalError = 'Original error!'
}
