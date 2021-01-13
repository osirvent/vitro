import React, { ComponentType } from 'react'
import ReactDOM from 'react-dom'
import path from 'path'
import {
    Route,
    BrowserRouter as Router,
    Switch,
} from '@vitro/cli/reexports/react-router-dom'
import { HomePage, ExperimentPage, VitroApp } from '@vitro/cli/reexports/ui'

import '@vitro/cli/reexports/inspect-mode.css'
import '@vitro/cli/reexports/inspector.css'

import experimentsTree from '/vitro-experiments-tree.js'

// routes go here

// overrides go here

const routes = __ROUTES__
    .filter((x) => x.url)
    .map(({ fileExports, url: route, sourceExperimentPath }) => {
        const componentsOverridesScope = Object.keys(__OVERRIDES__).find(
            (scopeDir) => {
                // console.log({ scopeDir, sourceExperimentPath })
                const isInside = !path
                    .relative(scopeDir, sourceExperimentPath)
                    .startsWith('..')
                if (isInside) {
                    return true
                }
                return false
            },
        )
        const overrides = __OVERRIDES__[componentsOverridesScope]
        return (
            <Route key={route} path={route}>
                <ExperimentPage
                    componentsOverrides={overrides}
                    experimentsTree={experimentsTree}
                    sourceExperimentPath={sourceExperimentPath}
                    fileExports={fileExports}
                />
            </Route>
        )
    })

ReactDOM.render(
    <Router>
        <VitroApp experimentsTree={experimentsTree}>
            <Switch>
                <Route path='/' exact>
                    <HomePage experimentsTree={experimentsTree} />
                </Route>
                {routes}
            </Switch>
        </VitroApp>
    </Router>,

    document.getElementById('root'),
)
