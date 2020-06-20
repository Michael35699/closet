import type { Internals } from './types'

import { sortWithIndices, topUpSortingIndices } from './utils'

// TODO abstract to an object without dependence on Internals

export const sequencer = (
    // identifies each unit (tag) receiving shuffled items
    tagId: string,
    // identifies each collection of items being shuffled
    sequenceId: string,
    values: unknown[],
    { cache, memory, deferred, round }: Internals,
) => {
    const applyKey = `${tagId}:apply`
    // in cache: boolean whether ready for application
    // in deferred: sets apply key true, deletes tagId from waitingSet

    const waitingSetKey = `${sequenceId}:waitingSet`
    // in cache: Set with all tags (contains tagId) who wait for their inner sets to be ready

    const shuffleKey = `${sequenceId}:shuffle`
    // in cache: holds all string values for one fullKey; will be empty after it's done
    // in memory: hold sorting indices, which are used as basis for shuffling
    // in deferred: tries to shuffle cache[shuffleKey], stops if waitingSet is not empty

    /////////// APPLY LOGIC
    if (cache.get(applyKey, false)) {
        const waitingSet = cache.get(waitingSetKey, new Set()) as Set<string>
            if (waitingSet.size > 0) {
                // continue waiting for other tags with same fullKey
                return
            }

        const popped: string[] = []
        const possibleValues = cache.get(shuffleKey, []) as string[]

        for (let x = 0; x < values.length; x++) {
            // pop off start, so the result is the same as in program logic
            popped.push(possibleValues.shift())
        }

        return popped
    }

    /////////// ADD TO SHUFFLE KEY LOGIC
    if (!round.ready) {
        // add to waitingSet
        cache.over(waitingSetKey, (s: Set<string>) => s.add(tagId), new Set())
        return
    }

    cache.fold(shuffleKey, (v: unknown[]) => v.concat(values), [])

    /////////// TRY TO SHUFFLE FROM DEFERRED LOGIC
    // needs to be executed per individual tag, because of applyKey
    deferred.registerIfNotExists(applyKey, () => {
        cache.set(applyKey, true)
        cache.over(waitingSetKey, (set: Set<string>) => set.delete(tagId), new Set())
    }, {
        priority: 15,
    })

    // needs to be executed once per fullKey
    deferred.registerIfNotExists(shuffleKey, () => {
        if (cache.get(waitingSetKey, new Set()).size > 0) {
            return
        }
        // will only go go beyong this point for the last set that becomes ready
        // because shuffling only needs to be done once

        cache.fold(shuffleKey, <T>(vs: T[]) => {
            const sortingIndices = memory.fold(shuffleKey, (vs: number[]) => {
                return topUpSortingIndices(vs, cache.get(shuffleKey, []).length)
            }, [])

            return sortWithIndices(vs, sortingIndices)
        }, [])
    })
}