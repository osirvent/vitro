import path from 'path'
import fs from 'fs'
import snapshot from 'snap-shot-it'

import {
    storiesofTransformer,
    DEFAULT_JSC_OPTIONS,
    runMigrateCodemod,
} from '../src/'
import { applyTransform } from 'jscodeshift/dist/testUtils'

it('storiesofTransformer', () => {
    const source = `
    /* eslint-disable */
    import React from 'react';
    import Button from './Button';

    import { storiesOf, configure } from '@storybook/react';
    import { action } from '@storybook/addon-actions';

    storiesOf('Button', module)
    .add('story1', () => <Button label="Story 1" />)
    .add('second story', () => <Button label="Story 2" onClick={action('click')} />)
    .add('complex story', () => (
        <div>
        <Button label="The Button" onClick={action('onClick')} />
        <br />
        </div>
    ))
    .add('w/punctuation', () => <Button label="Story 2" onClick={action('click')} />)
    .add('Start Case', () => <Button label="Story 2" onClick={action('click')} />);
    `
    snap(source, storiesofTransformer)
})

it('storiesofTransformer with stories.add', () => {
    const source = `
    import React from 'react';
    import Button from './Button';

    import { storiesOf, configure } from '@storybook/react';
    import { action } from '@storybook/addon-actions';

    const stories = storiesOf('Button', module)

    stories
        .add('story1', () => <Button label="Story 1" />);

    stories
        .add('story1', () => <Button label="Story 1" />)
        .add('second story', () => <Button label="Story 2" onClick={action('click')} />)
    `
    snap(source, storiesofTransformer)
})

it('storiesofTransformer with multiple storiesOf', () => {
    const source = `
    import React from 'react';
    import Button from './Button';

    import { storiesOf, configure } from '@storybook/react';
    import { action } from '@storybook/addon-actions';

    storiesOf('A', module)
        .add('story1', () => <Button label="Story 1" />);

    storiesOf('B', module)
        .add('story1', () => <Button label="Story 1" />)
        .add('second story', () => <Button label="Story 2" onClick={action('click')} />)
    `
    snap(source, storiesofTransformer)
})

it('storiesofTransformer already existing export default', () => {
    const source = `
    import React from 'react';
    import Button from './Button';

    import { storiesOf, configure } from '@storybook/react';
    import { action } from '@storybook/addon-actions';


    export default {
        title: 'xxx'
    }

    const stories = storiesOf('Button', module)

    stories
        .add('story1', () => <Button label="Story 1" />);

    stories
        .add('story1', () => <Button label="Story 1" />)
        .add('second story', () => <Button label="Story 2" onClick={action('click')} />)
    `
    snap(source, storiesofTransformer)
})

it('runMigrateCodemod', async () => {
    const results = await runMigrateCodemod({
        glob: 'tests/examples/**',
        dryRun: true,
    })
    snapshot(results[0])
})

function snap(source, transformer) {
    const res = applyTransform(
        transformer,
        DEFAULT_JSC_OPTIONS,
        {
            source,
        },
        DEFAULT_JSC_OPTIONS,
    )
    if (process.env.DEBUG) {
        console.log()
        console.log(res)
        console.log()
    }
    snapshot(res)
}
