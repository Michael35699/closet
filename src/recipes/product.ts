import type { TagData, RecipeOptions, Registrar, WeakFilter, WeakFilterResult, Internals, Recipe, WrapOptions } from './types'

import { defaultTagnameGetter, defaultTagnameSetter } from './wrappers'

export const product = <T extends {}>(
    recipeFirst: Recipe<T>,
    recipeSecond: Recipe<T>,
    multiply: (fst: WeakFilterResult, snd: WeakFilterResult) => WeakFilter<T> = () => () => ({ ready: true }), {
        wrapId,
        setTagnames,
    }: WrapOptions = {
        wrapId: 'product',
        getTagnames: defaultTagnameGetter,
        setTagnames: defaultTagnameSetter,
    },
): Recipe<T> => ({
    tagname = 'prod',

    optionsFirst = {},
    optionsSecond = {},
}: {
    tagname?: string,

    optionsFirst?: RecipeOptions,
    optionsSecond?: RecipeOptions,
} = {}) => (registrar: Registrar<T>) => {
    const tagnameTrue = `${tagname}:${wrapId}:fst`
    const tagnameFalse = `${tagname}:${wrapId}:snd`

    setTagnames(optionsFirst, [tagnameTrue])
    setTagnames(optionsSecond, [tagnameFalse])

    recipeFirst(optionsFirst)(registrar)
    recipeSecond(optionsSecond)(registrar)

    const productFilter = (
        tag: TagData,
        internals: Internals<T>,
    ) => {
        return multiply(
            internals.filters.getOrDefault(tagnameTrue)(tag, internals),
            internals.filters.getOrDefault(tagnameFalse)(tag, internals),
        )(tag, internals)
    }

    registrar.register(tagname, productFilter, registrar.getOptions(tagnameTrue /* have to be same for True/False */))
}
