import { serve, Config as BundlessConfig } from '@bundless/cli'
import { ReactRefreshPlugin } from '@bundless/plugin-react-refresh'
import { VitroPlugin } from '@vitro/plugin'
import path from 'path'
import deepmerge from 'deepmerge'
// import { NEXT_APP_PATH, CMD, CONFIG_PATH, VERSION_FILE_PATH } from './constants'
import { CommandModule } from 'yargs'
import {
    fatal,
    findVitroJsConfigPath,
    getVitroConfig as loadVitroConfig,
    printRed,
} from './support'
import { CONFIG_NAME } from '@bundless/cli/dist/constants'

const command: CommandModule = {
    command: ['dev [cwd]', '*'],
    describe: 'Starts vitro dev server',
    builder: (argv) => {
        argv.option('port', {
            alias: 'p',
            type: 'number',
            default: 7007,
            required: false,
            description: 'The port for the dev server',
        })
        argv.positional('cwd', {
            type: 'string',
            required: false,
            description: `The starting directory to search for ${CONFIG_NAME}`,
        })
        return argv
    },
    handler: async (argv: any) => {
        try {
            // if no vitro config is present, ask to run init first
            const cwd = path.resolve(argv.cwd || process.cwd())
            const configPath = findVitroJsConfigPath(cwd)
            const root = path.dirname(configPath)
            const vitroConfig = loadVitroConfig(configPath)
            const experimentsFilters = (argv.filter?.length
                ? argv.filter
                : []
            ).map(path.resolve)

            // only run stories inside cwd
            if (cwd !== root) {
                experimentsFilters.push(cwd)
            }

            const ownConfig: BundlessConfig = {
                root,
                jsx: 'react',
                entries: ['index.html'],
                server: {
                    port: argv.port,
                },
                // entries: ['./index.html'],
                plugins: [
                    VitroPlugin({
                        config: vitroConfig,
                        experimentsFilters,
                    }),
                    ReactRefreshPlugin(),
                ],
            }
            const server = await serve(
                deepmerge(vitroConfig?.bundlessConfig || {}, ownConfig),
            )
        } catch (e) {
            printRed(`could not start the dev server`, true)
            printRed(e.message)
            printRed(e.stack)
            fatal()
        }
    },
}

export default command
