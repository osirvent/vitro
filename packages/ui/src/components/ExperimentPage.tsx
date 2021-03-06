// @jsx jsx
import {
    Box,
    BoxProps,
    Button,
    Collapse,
    IconButton,
    Link,
    Select,
    Stack,
    StackProps,
    useColorMode,
    Skeleton,
} from '@chakra-ui/core'
import { jsx } from '@emotion/core'
import assign from 'lodash/assign'
import React, {
    Profiler,
    ProfilerOnRenderCallback,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    Fragment,
} from 'react'
import { FaBug, FaLink } from 'react-icons/fa'
import { FiHash, FiZap } from 'react-icons/fi'
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md'
import { isValidElementType } from 'react-is'
import { debug, formatPathToTitle, TOP_TITLE_H, usePromise } from '../support'
import {
    ClickToSourceProviderStateless,
    ClickToSourceState,
} from './ClickToSource'
import { DefaultWrapper } from './DefaultWrapper'
import { MdxStyler } from './MarkdownStyler'
import { MobileNav } from './MobileNav'

jsx

const mdxComponentPrefix = '_VitroMdx'

export function ExperimentPage({
    experimentsTree,
    sourceExperimentPath,
    componentsOverrides,
    fileExports: getFileExports = () => Promise.resolve({}),
}) {
    const { colorMode, toggleColorMode } = useColorMode()
    const [cssDebugEnabled, setCssDebug] = useState(false)
    const {
        value: fileExportsObject,
        error: exportsError,
        loading: exportsLoading,
    } = usePromise(getFileExports, {})

    // TODO make useComponentExport hook that memoizes a component export and check it's valid component

    const {
        value: overridesExports,
        error: overridesError,
        loading: overridesLoading,
    } = usePromise(componentsOverrides, {})

    const loading = exportsLoading || overridesLoading
    const error = exportsError || overridesError

    const ValidGlobalWrapper = useMemo(
        () =>
            !overridesExports || !isValidElementType(overridesExports.Wrapper)
                ? DefaultWrapper
                : overridesExports.Wrapper,
        [overridesExports, colorMode],
    )

    const [clickToSeeSourceProvider, setClickToSeeSource] = useState<
        ClickToSourceState['provider']
    >('')

    const vscodeUrl = `vscode://file${sourceExperimentPath}`
    // exported.then(z => console.log(Object.keys(z)))
    // console.log({ fileExports })
    const ExperimentWrapper = useMemo(() => {
        const experimentWrapper = fileExportsObject?.default?.wrapper
        if (experimentWrapper) {
            console.info('using experiments wrapper ' + experimentWrapper?.name)
        }
        return experimentWrapper || FragmentLike
    }, [fileExportsObject, colorMode])

    const experimentTitle = loading
        ? ''
        : fileExportsObject?.default?.title ||
          formatPathToTitle(sourceExperimentPath) ||
          ''

    const bg = useMemo(
        () => ({ light: 'white', dark: 'gray.700' }[colorMode]),
        [colorMode],
    )

    // if (!exported || !story || !storyObject) {
    //     // TODO return 404
    //     return null
    // }
    debug({ ValidGlobalWrapper, ExperimentWrapper })
    return (
        <Stack spacing='10'>
            <Stack flexShrink={0} align='flex-start' spacing='4'>
                <Stack
                    height={TOP_TITLE_H}
                    spacing='3'
                    align='flex-end'
                    direction='row'
                    width='100%'
                >
                    <Box
                        fontSize='32px'
                        minWidth='0'
                        width='auto'
                        isTruncated
                        fontWeight='medium'
                    >
                        {experimentTitle}
                    </Box>
                    <Box flex='1' />
                    <ToggleColorModeButton
                        mr={['0px', null, null, '-10px !important']}
                    />
                    <MobileNav
                        display={['flex', null, null, 'none']}
                        experimentsTree={experimentsTree}
                    />
                </Stack>
                {/* <Box fontSize='18px' opacity={0.6}>
                    powered by vitro
                </Box> */}
                {process.env.NODE_ENV == 'development' && (
                    <Link
                        as='a'
                        fontWeight='500'
                        href={vscodeUrl}
                        opacity={0.7}
                    >
                        <Box d='inline' size='.8em' mr='3' as={FaLink} />
                        Open in vscode
                    </Link>
                )}
            </Stack>
            {/* <Box flexShrink={0} h='4' /> */}
            <Stack align='center' flexShrink={0} direction='row'>
                <Box flex='1' />
                <Button
                    onClick={() => setCssDebug((x) => !x)}
                    opacity={0.8}
                    bg={bg}
                    w='auto'
                >
                    <Box mr='2' d='inline-block' as={FaBug} />
                    CSS debug
                </Button>

                {/* <Select
                    onChange={(e) => {
                        const value = e.target.value as any
                        setClickToSeeSource(value)
                    }}
                    fontWeight={500}
                    value={clickToSeeSourceProvider}
                    opacity={0.8}
                    variant='filled'
                    bg={bg}
                    // placeholder='click to see source'
                    w='auto'
                >
                    <option value='' children='click to source disabled' />
                    <option
                        value='vscode'
                        children='click to source on Vscode'
                    />
                </Select> */}
            </Stack>

            <Stack
                flexShrink={0}
                // direction='row'
                flexWrap='wrap'
                overflow='visible'
                // justify='space-between'
                spacing='16'
            >
                {error && (
                    <Stack>
                        <Box
                            color='red.500'
                            fontSize='0.9em'
                            wordBreak='break-word'
                            whiteSpace='pre-wrap'
                            as='pre'
                        >
                            {error?.stack}
                        </Box>
                    </Stack>
                )}
                {loading && (
                    <Stack spacing='16'>
                        {new Array(3).fill(null).map((_, i) => {
                            return (
                                <Skeleton
                                    borderRadius='4px'
                                    key={i}
                                    width='100%'
                                    height='300px'
                                />
                            )
                        })}
                    </Stack>
                )}
                {!loading &&
                    fileExportsObject &&
                    Object.keys(fileExportsObject)
                        .filter((k) => {
                            const Component = fileExportsObject[k]
                            return (
                                k !== 'default' && isValidElementType(Component)
                            )
                        })
                        .map((k) => {
                            // console.log({ Component })
                            const Component = fileExportsObject[k]
                            if (!isValidElementType(Component)) {
                                return null
                            }

                            if (k.startsWith(mdxComponentPrefix)) {
                                return (
                                    <MdxStyler>
                                        <Component />
                                    </MdxStyler>
                                )
                            }

                            const id = `${sourceExperimentPath}/${k}`
                            return (
                                <StoryBlock
                                    maxW='100%'
                                    overflowX='auto'
                                    flexShrink={0}
                                    title={k}
                                    blockWidth='100%'
                                    key={id}
                                    id={id}
                                >
                                    <ClickToSourceProviderStateless
                                        value={{
                                            provider: clickToSeeSourceProvider,
                                        }}
                                        onChange={(state) => {
                                            setClickToSeeSource(state.provider)
                                        }}
                                    >
                                        <Stack
                                            // flex='1'
                                            width='100%'
                                            height='100%'
                                            minH='100%'
                                            minW='100%'
                                            spacing='0'
                                            align='center'
                                            justify='center'
                                            className={
                                                cssDebugEnabled
                                                    ? 'vitro-inspect-css'
                                                    : ''
                                            }
                                        >
                                            <ValidGlobalWrapper
                                                key={colorMode} // TODO remounting on color mode change or the providers get fucked up
                                                isDark={colorMode == 'dark'}
                                            >
                                                <ExperimentWrapper
                                                    key={colorMode}
                                                    isDark={colorMode == 'dark'}
                                                >
                                                    <Component
                                                        key={colorMode}
                                                        isDark={
                                                            colorMode == 'dark'
                                                        }
                                                    />
                                                </ExperimentWrapper>
                                            </ValidGlobalWrapper>
                                        </Stack>
                                    </ClickToSourceProviderStateless>
                                </StoryBlock>
                            )
                        })}
            </Stack>
        </Stack>
    )
}

const StoryBlock = ({ children, blockWidth, id, title, ...rest }) => {
    const [fullScreen, setFullScreen] = useState(false)
    const { colorMode } = useColorMode()
    const bg = useMemo(
        () => ({ light: 'white', dark: 'gray.700' }[colorMode]),
        [colorMode],
    )

    

    const fullScreenStyles: StackProps = useMemo(
        () => ({
            w: '100vw',
            maxW: '100vw',
            minHeight: '100%',
            // p: '50px',
            pt: '80px',
            bg,
            position: 'fixed',
            overflow: 'auto',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: 100000,
        }),
        [bg],
    )

    useEffect(() => {
        if (!Profiler) {
            console.warn(
                'your current react version does not export `Profiler`, some features are disabled',
            )
        }
    }, [])

    const actualDurationRef = useRef('0.00ms')
    const renderCount = useRef(0)

    // renderCount.current = 0
    // console.log({ id })
    const profile: ProfilerOnRenderCallback = useCallback(
        (id, _, actualDuration) => {
            // console.log({ id, actualDuration })
            renderCount.current++
            actualDurationRef.current = actualDuration.toFixed(2) + 'ms'
        },
        [],
    )
    return (
        <Stack
            spacing='3'
            flexShrink={0}
            flexGrow={0}
            minHeight='340px'
            // minW='100px'
            // overflowX='hidden'
            overflow='visible'
            flexBasis={blockWidth}
            position='relative'
            {...rest}
            {...(fullScreen ? fullScreenStyles : {})}
        >
            <Stack
                spacing='8'
                mx={fullScreen ? '20px' : ''}
                direction='row'
                align='center'
            >
                <Box
                    borderRadius='md'
                    p='4px'
                    fontSize='18px'
                    fontWeight='medium'
                >
                    {formatPathToTitle(title)}
                </Box>
                <Box flex='1' />
                <Couple
                    borderRadius='md'
                    p='4px'
                    a={<Box as={FiZap} size='1em' />}
                    b={
                        <AutoUpdateBox
                            fontWeight='500'
                            contentRef={actualDurationRef}
                        />
                    }
                />
                )
                <Couple
                    borderRadius='md'
                    p='4px'
                    a={<Box as={FiHash} size='1em' />}
                    b={
                        <AutoUpdateBox
                            fontWeight='500'
                            map={(x) => x + ' renders'}
                            contentRef={renderCount}
                        />
                    }
                />
                )
                <IconButton
                    borderRadius='md'
                    // isRound
                    size='sm'
                    onClick={() => setFullScreen((x) => !x)}
                    fontSize='1.4em'
                    // bg='transparent'
                    icon={fullScreen ? MdFullscreenExit : MdFullscreen}
                    aria-label='full-screen'
                />
            </Stack>
            <Box
                // spacing='0'
                flexShrink={0}
                flex='1'
                minH='340px'
                minHeight='340px'
            >
                {/* Block */}
                <Stack
                    minH='340px'
                    height='100%'
                    shadow='sm'
                    // shadow='0 0 40px rgba(0,0,0,0.1), 0 -10px 40px rgba(0,0,0,0.1)'
                    // borderWidth='1px'
                    flex='1'
                    // shadow='sm'
                    borderRadius='4px'
                    overflow='hidden'
                    overflowX='auto'
                    bg={bg}
                    // minH='100%'
                    spacing='0'
                    align='stretch'
                    justify='center'
                    // p='6'
                    // css={cssDebugEnabled ? debugCSS : css``}
                >
                    <ErrorBoundary>
                        {Profiler ? (
                            <Profiler id={id} onRender={profile}>
                                {children}
                            </Profiler>
                        ) : (
                            children
                        )}
                    </ErrorBoundary>
                </Stack>
            </Box>
            {/* ToolBar */}
        </Stack>
    )
}

const AutoUpdateBox = ({
    after = 1000,
    map,
    contentRef,
    ...rest
}: BoxProps & {
    after?: number
    contentRef: { current: any }
    map?: Function
}) => {
    const [_, render] = useState(null)
    useEffect(() => {
        const id = setInterval(() => {
            render('')
        }, after)
        return () => clearInterval(id)
    }, [])
    return (
        <Box
            {...rest}
            children={map ? map(contentRef.current) : contentRef.current}
        />
    )
}

class ErrorBoundary extends React.Component {
    state = { hasError: false, message: '', trace: '', traceOpen: false }

    static getDerivedStateFromError(error: Error, info) {
        // Update state so the next render will show the fallback UI.
        return {
            hasError: true,
            message: error?.message || 'no error message found',
            trace: error?.stack,
        }
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error(error, errorInfo)
    }

    render() {
        const { hasError, message, trace, traceOpen } = this.state
        if (hasError) {
            // You can render any custom fallback UI
            return (
                <Stack
                    m='20'
                    fontWeight='500'
                    align='center'
                    justify='center'
                    color='red.500'
                    spacing='6'
                    maxW='100%'
                >
                    <Stack align='center' spacing='2'>
                        <Box
                            fontWeight='bold'
                            textAlign='center'
                            display='inline-block'
                        >
                            Error
                        </Box>
                        <Box textAlign='center' display='inline-block'>
                            {message}
                        </Box>
                        <Button
                            display='inline-block'
                            size='sm'
                            variant='ghost'
                            onClick={() =>
                                this.setState((x: any) => ({
                                    ...x,
                                    traceOpen: !x.traceOpen,
                                }))
                            }
                        >
                            see trace
                        </Button>
                    </Stack>
                    <Collapse overflowX='auto' isOpen={traceOpen}>
                        <Box fontSize='0.9em' as='pre'>
                            {trace}
                        </Box>
                    </Collapse>
                </Stack>
            )
        }

        return this.props.children
    }
}

export const Couple = ({ a, b, hide = false, ...rest }) => {
    return (
        <Stack
            // display={hide ? 'none' : ['none', null, 'flex']}
            isTruncated
            direction='row'
            align='center'
            spacing='1'
            {...rest}
        >
            <Box>{a}</Box>
            <Box>{b}</Box>
        </Stack>
    )
}

export const ToggleColorModeButton = ({ ...rest }) => {
    const { colorMode, toggleColorMode } = useColorMode()
    return (
        <IconButton
            // bg={{ light: 'white', dark: 'gray.700' }[colorMode]}
            // size='sm'
            // shadow='sm'

            onClick={toggleColorMode}
            fontSize='1.2em'
            aria-label='color-mode-toggle'
            icon={colorMode === 'dark' ? 'moon' : 'sun'}
            {...rest}
        />
    )
}

function FragmentLike({ children }) {
    return <Fragment children={children} />
}
