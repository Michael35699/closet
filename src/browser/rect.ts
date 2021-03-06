import type { TagNode, Internals, AftermathEntry, AftermathInternals, WeakSeparator, Recipe, WeakFilter, InactiveBehavior } from '../types'
import type { FlashcardPreset } from '../flashcard'

import { FlashcardTemplate, makeFlashcardTemplate, generateFlashcardRecipes } from '../flashcard/flashcardTemplate'

import type { RectProperty, RectProperties, RectDefinition } from './svgClasses'
import { SVG, Rect } from './svgClasses'

import { appendStyleTag, getImages, imageLoadCallback, svgKeyword, svgCss } from './utils'

export const rectKeyword = 'occlusionRenderRect'

const renderRects = <T extends Record<string, unknown>>(
    entry: AftermathEntry<T>,
    { template, cache, environment }: AftermathInternals<T>,
) => {
    const images = template.textFragments.flatMap(getImages)
    const rects = cache.get<RectDefinition[]>(entry.keyword, [])

    if (!environment.post(svgKeyword, () => true, false)) {
        appendStyleTag(svgCss)
    }

    imageLoadCallback(`img[src="${images[0]}"]`, (event) => {
        const draw = SVG.wrapImage(event.target as HTMLImageElement)

        for (const [/* type */, active,, x, y, width, height, options] of rects) {
            if (!active) {
                continue
            }

            const svgRect = Rect.make(draw)
            svgRect.pos = [x, y, width, height]

            for (const prop in options) {
                const rectProperty = prop as RectProperty
                svgRect.prop(rectProperty, options[rectProperty] as string)
            }

            draw.append(svgRect)
        }
    })
}

const processProps = (rest: string[], overwriteProps = {}): RectProperties => {
    const propObject: RectProperties = {}

    rest
        .map((propString: string) => (propString.split('=')) as [RectProperty, string])
        .forEach(([name, value]: [RectProperty, string]) => propObject[name] = value)

    return Object.assign(propObject, overwriteProps)
}

const makeRects = (
    props: RectProperties,
) => <T extends Record<string, unknown>>(
    { fullKey, values }: TagNode,
    { cache, aftermath }: Internals<T>,
) => {
    const [x = 0, y = 0, width = 50, height = width, ...rest] = values

    cache.over(
        rectKeyword,
        (rectList: RectDefinition[]) => rectList.push([
            'rect',
            true,
            fullKey,
            Number(x),
            Number(y),
            Number(width),
            Number(height),
            processProps(rest, props),
        ]),
        [],
    )

    aftermath.registerIfNotExists(rectKeyword, renderRects as any)

    return { ready: true }
}

const props: RectProperties = {
    classes: 'closet-rect__rect',
    labelClasses: 'closet-rect__label',
}

const ellipseProps: RectProperties = {
    classes: 'closet-rect__ellipsis',
    labelClasses: 'closet-rect__ellipsis',
}

const classesForFront = 'is-active is-front'
const classesForBack = 'is-active is-back'
const classesForInactive = 'is-inactive'

const rectPublicApi = <T extends FlashcardPreset>(
    frontInactive: InactiveBehavior<T>,
    backInactive: InactiveBehavior<T>,
): Recipe<T> => (options: {
    tagname?: string,

    front?: (props: RectProperties) => WeakFilter<T>,
    back?: (props: RectProperties) => WeakFilter<T>,

    separator?: WeakSeparator,
    flashcardTemplate?: FlashcardTemplate<T>,

    frontProperties?: RectProperties,
    backProperties?: RectProperties,
    ellipseProperties?: RectProperties,
    contextProperties?: RectProperties,
} = {}) => {
    const {
        tagname = 'rect',

        front = makeRects,
        back = makeRects,

        separator = { sep: ',' },
        flashcardTemplate = makeFlashcardTemplate(),

        frontProperties = { ...props, containerClasses: classesForFront },
        backProperties = { ...props, containerClasses: classesForBack },
        ellipseProperties = { ...ellipseProps, containerClasses: classesForInactive },
        contextProperties = { ...props, containerClasses: classesForInactive }
    } = options

    const rectSeparators = { separators: [separator] }
    const rectRecipe = flashcardTemplate(frontInactive, backInactive)

    return rectRecipe(
        tagname,
        front(frontProperties),
        back(backProperties),
        makeRects(ellipseProperties),
        makeRects(contextProperties),
        rectSeparators,
    )
}

export const rectRecipes = generateFlashcardRecipes(rectPublicApi)
