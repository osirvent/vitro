import startCase from 'lodash/startCase'

type GetStoriesReturnType = {
    filename: string
    title: string
    absolutePath: string
    // getExports: () => Record<string, any>
}[]

export const getStories = (storiesMap): GetStoriesReturnType => {
    return Object.keys(storiesMap).map((filename) => {
        return {
            absolutePath: storiesMap[filename],
            filename,
            title: formatPathToTitle(filename),
        }
    })
}

export function formatPathToTitle(path: string) {
    const endPath = path
        .split('/')
        .map((x) => x.trim())
        .filter(Boolean)
        .reverse()[0]
    const withoutExt = endPath.split('.')[0]
    return startCase(withoutExt)
}
