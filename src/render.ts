import type {
    FilterManager,
    FilterProcessor,
} from './filterManager'

import type {
    TagInfo,
} from './tags'

import {
    calculateCoordinates,
    replaceAndGetOffset,
} from './utils'

import TemplateApi from './template'
import { parseTemplate } from './parser'

import {
    TAG_OPEN,
    TAG_CLOSE,
    ARG_SEP,
} from './utils'

const MAX_ITERATIONS = 50

export const renderTemplate = (text: string, filterManager: FilterManager): string => {
    let result = text
    let ready = false

    for (let i = 0; i < MAX_ITERATIONS && !ready; i++) {
        const rootTag = parseTemplate(result)
        const templateApi = new TemplateApi(rootTag)

        const [
            newText,
            /* finalOffset */,
            innerReady,
        ] = postfixTraverse(result, rootTag, filterManager.filterProcessor({
            iteration: { index: i },
            template: templateApi,
        }))

        console.info(
            `ITERATION ${i}: `,
            `"${result}"`,
            `"${newText}"`,
        )

        ready = innerReady
        result = newText

        filterManager.executeDeferred()
    }

    return result
}

// try to make it more PDA
const postfixTraverse = (baseText: string, rootTag: TagInfo, filterProcessor: FilterProcessor): [string, number[], boolean]=> {
    const tagReduce = ([text, stack, ready]: [string, number[], boolean], tag: TagInfo): [string, number[], boolean] => {

        // going DOWN
        stack.push(stack[stack.length - 1])
        // console.info('going down', tag.data.path)

        const [
            modText,
            modStack,
            modReady,
        ] = tag.innerTags.reduce(tagReduce, [text, stack, true])

        // get offsets
        modStack.push(modStack.pop() - modStack[modStack.length - 1])

        const innerOffset = modStack.pop()
        const leftOffset = modStack.pop()

        ///////////////////// Updating valuesRaw and values with innerTags
        const [
            lend,
            rend,
        ] = calculateCoordinates(tag.start, tag.end, leftOffset, innerOffset)

        const newValuesRaw = tag.data.valuesRaw === null
            ? null
            : modText.slice(
                lend + (tag.naked ? 0 : TAG_OPEN.length + tag.data.fullKey.length + ARG_SEP.length),
                rend - (tag.naked ? 0 : TAG_CLOSE.length),
            )

        const tagData = tag.data.shadowValuesRaw(newValuesRaw)

        ///////////////////// Evaluate current tag
        const filterOutput = filterProcessor(tagData, { ready: modReady })

        const [
            newText,
            newOffset,
        ] = filterOutput.result === null
            ? [modText, 0]
            : replaceAndGetOffset(modText, filterOutput.result, lend, rend)

        // going UP
        const sum = innerOffset + leftOffset + newOffset
        modStack.push(sum)

        // console.info('going up:', tag.data.path, modText, '+++', filterOutput.result, '===', newText)
        // console.groupCollapsed('offsets', tag.data.path)
        // console.log('left', leftOffset)
        // console.log('inner' , innerOffset)
        // console.log('new', newOffset)
        // console.info('lend', lend)
        // console.info('rend', rend)
        // console.groupEnd()

        return [
            newText,
            modStack,
            // ready means everything to the left is ready
            // filterOutput.ready means everything within and themselves are ready
            ready && filterOutput.ready
        ]
    }

    return tagReduce([baseText, [0,0], true], rootTag)
}