import babelPlugin from '../src'
import dedent from 'dedent'
import prettier from 'prettier'

import { transform, TransformOptions } from '@babel/core'

const FILENAME = 'filename.js'

const OPTIONS: TransformOptions = {
    filename: FILENAME,
    plugins: [[babelPlugin, {}]],
}

describe('babel plugin', () => {
    afterEach(() => {})

    const sources = {
        'simple const jsx': `const x = <a><div id="Hello World!"></div></a>`,
        'closed element': `const x = <a><div id="Hello World!"/></a>`,
        'function component': dedent`
            function Component() {
                return (
                    <div>
                        <a>link</a>
                        <SomeOtherComponent/>
                    </div>
                )
            }
            `,
        'function component with early return': dedent`
            function Component() {
                const [loading] = useState(true)
                if (loading) {
                    return (
                        <div>
                            <a>link</a>
                            loading
                        </div>
                    )
                }
                return (
                    <div>
                        <a>link</a>
                        <SomeOtherComponent/>
                    </div>
                )
            }
            `,
        'class component': dedent`
            class ComponentClass extends Component {
                render() {
                    return (
                        <div>
                            <a>link</a>
                            <SomeOtherComponent/>
                        </div>
                    )
                }
            }
            `,
    }
    Object.keys(sources).forEach((name) => {
        test(name, () => {
            const code = sources[name]
            const res = transform(code, OPTIONS)
            expect(prettier.format(res.code)).toMatchSnapshot('code')
        })
    })
})
