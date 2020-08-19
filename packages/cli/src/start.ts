import { runCommand, printGreen, printRed } from './support'
import path from 'path'
import { NEXT_APP_PATH, CMD } from './contsants'
import { CommandModule } from 'yargs'
import { existsSync } from 'fs-extra'

const command: CommandModule = {
    command: ['dev', '*'],
    describe: 'Starts vitro dev server',
    builder: (argv) => {
        argv.option('port', {
            alias: 'p',
            type: 'string',
            default: '7007',
            required: false,
            description: 'The port for the dev server',
        })
        return argv
    },
    handler: async (argv) => {
        // TODO if vitro version is different, run init
        // TODO if no vitro app is present, run init
        // TODO if no vitro config is present, ask to run init first
        // TODO if no node_modules folder is present inside the app, rerun init
        // TODO in case of error, ask to rerun init
        console.log('starting the server')
        await start({ port: argv.port, verbose: Boolean(argv.verbose) })
    },
} // as CommandModule

export default command

async function start({ port, verbose }) {
    if (!existsSync(NEXT_APP_PATH)) {
        // TODO if no app is present but there is a config, copy the app and run npm install
        // this way you can run vitro even if .vitro is inside .gitignore
        printRed(
            `There is no ${NEXT_APP_PATH} folder, you probably need to run '${CMD} init' first`,
            true,
        )
        return process.exit(1)
    }
    const NEXT_BIN = path.resolve(NEXT_APP_PATH, `node_modules/.bin/next`)
    return await runCommand({
        command: `${NEXT_BIN} dev -p ${port} ${path.resolve(NEXT_APP_PATH)}`,
        env: verbose
            ? {
                  VERBOSE: 'true',
              }
            : {},
        // cwd: path.resolve('.', NEXT_APP_PATH),
    }).catch((e) => {
        throw new Error(`could not start ${CMD}`)
    })
}
