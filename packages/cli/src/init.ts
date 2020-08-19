import { runCommand, printGreen, debug } from './support'
import path from 'path'
import {
    TEMPLATE_PATH,
    DEFAULT_CONFIG,
    CONFIG_PATH,
    NEXT_APP_PATH,
    TESTING,
    VERSION_FILE_PATH,
} from './contsants'
import {
    copy,
    writeFile,
    exists,
    existsSync,
    appendFile,
    writeFileSync,
    readFileSync,
    remove,
} from 'fs-extra'
import { CommandModule } from 'yargs'
const { version } = require('../package.json')

const command: CommandModule = {
    command: ['init'],
    describe: 'Creates a new vitro app',
    builder: (argv) => {
        argv.option('skip-install', {
            type: 'boolean',
            boolean: true,
            default: false,
        })

        return argv
    },
    handler: async (argv) => {
        debug('argv', argv)
        debug('cwd', process.cwd())
        await initHandler({
            skipInstall: Boolean(argv['skip-install']),
        })
    },
} // as CommandModule

export async function initHandler({ skipInstall = false } = {}) {
    printGreen(`creating ${NEXT_APP_PATH}`, true)
    await remove(NEXT_APP_PATH)
    await copy(TEMPLATE_PATH, NEXT_APP_PATH, {
        overwrite: true,
        recursive: true,
        filter: (src: string) => {
            {
                debug(src)
                return !src.includes('node_modules')
            }
        },
    })
    writeFileSync(
        path.join(NEXT_APP_PATH, VERSION_FILE_PATH),
        `module.exports = '${version}'`,
    )

    if (!skipInstall) {
        printGreen(`installing dependencies inside ${NEXT_APP_PATH}`, true)
        await runCommand({
            command: 'npm i --no-audit --quiet --ignore-scripts --no-fund',
            env: {
                npm_config_loglevel: 'silent',
            },
            cwd: path.resolve('.', NEXT_APP_PATH),
        })
    }
    if (!existsSync(CONFIG_PATH)) {
        printGreen(`creating default ${CONFIG_PATH}`, true)
        await writeFile(CONFIG_PATH, DEFAULT_CONFIG)
    }
    await addVitroToGitignore()
    printGreen('created vitro app successfully!', true)
}

async function addVitroToGitignore() {
    if (existsSync('.gitignore')) {
        printGreen(`adding ${NEXT_APP_PATH} to .gitignore`, true)
        if (!readFileSync('.gitignore').toString().includes(NEXT_APP_PATH)) {
            await appendFile('.gitignore', '\n' + NEXT_APP_PATH + '\n')
        }
    } else {
        await writeFileSync('.gitignore', '\n' + NEXT_APP_PATH + '\n')
    }
}

export default command