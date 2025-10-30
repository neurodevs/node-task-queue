import generateId from '@neurodevs/generate-id'
import AbstractModuleTest from '@neurodevs/node-tdd'

export default class AbstractPackageTest extends AbstractModuleTest {
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
