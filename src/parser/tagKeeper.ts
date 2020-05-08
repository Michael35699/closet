import {
    tagMaker,
    mkTagInfo,
} from '../types'

import {
    TAG_START,
    TAG_END,
} from '../utils'

const tagKeeper = function*() {
    const tm = tagMaker()
    const tagInfos = mkTagInfo(0)

    const getTagInfo = (path: number[]) => {
        let reference = tagInfos

        for (const id of path) {
            reference = reference.innerTags[id]
        }

        return reference
    }

    const tagStack: number[] = []
    let nextLevel = 0

    while (true) {
        let value = yield tagStack

        if (value[0] >= 0) /* start */ {
            const startIndex = value[0]
            getTagInfo(tagStack).innerTags.push(mkTagInfo(startIndex))

            tagStack.push(nextLevel)
            nextLevel = 0
        }

        else /* end */ {
            const endIndex = Math.abs(value[0])

            const foundTag = getTagInfo(tagStack)
            foundTag.end = endIndex
            foundTag.data = tm.mkTag(value[1], value[2] ?? null, [...tagStack])

            if (tagStack.length === 0) {
                return tagInfos
            }
            else {
                nextLevel = tagStack.pop() + 1
            }
        }
    }
}

const initTagKeeper = () => {
    let tk = tagKeeper()
    tk.next()

    const startToken = (offset) => {
        return tk.next([offset])
    }

    const endToken = (offset, key, valuesRaw) => {
        return tk.next([-offset, key, valuesRaw])
    }

    const restart = () => {
        tk = tagKeeper()
        tk.next()
    }

    return {
        startToken: startToken,
        endToken: endToken,
        restart: restart,
    }
}

export default initTagKeeper
