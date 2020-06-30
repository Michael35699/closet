import type { Recipe } from './types'

interface Recipes {
    [propName: string]: Recipe<any>;
}

import { shufflingRecipe } from './shuffling'
import { orderingRecipe } from './ordering'
import { clozeShowRecipe, clozeHideRecipe, clozeRevealRecipe } from './clozes'
import { multipleChoiceShowRecipe, multipleChoiceHideRecipe, multipleChoiceRevealRecipe } from './multipleChoice'
// import { randRecipe } from './rand'
import { styleRecipe, processRecipe } from './stylizing'

import { debugRecipe } from './debug'
import { metaRecipe } from './meta'
import { activateRecipe, deactivateRecipe, toggleRecipe } from './activate'

export const recipes: Recipes = {
    shuffling: shufflingRecipe,
    ordering: orderingRecipe,

    clozeShow: clozeShowRecipe,
    clozeHide: clozeHideRecipe,
    clozeReveal: clozeRevealRecipe,

    multipleChoiceShow: multipleChoiceShowRecipe,
    multipleChoiceHide: multipleChoiceHideRecipe,
    multipleChoiceReveal: multipleChoiceRevealRecipe,

    stylizing: styleRecipe,
    processing: processRecipe,

    activate: activateRecipe,
    deactivate: deactivateRecipe,
    toggle: toggleRecipe,

    debug: debugRecipe,
    meta: metaRecipe,
}

import { wrap, wrapWithDeferred, wrapWithAftermath } from './wrappers'
import { twoWayWrap, fourWayWrap } from './nway'

export const wrappers = {
    wrap: wrap,

    deferred: wrapWithDeferred,
    aftermath: wrapWithAftermath,

    twoWay: twoWayWrap,
    fourWay: fourWayWrap,
}

import { isBack, isActive } from './deciders'

export const utils = {
    isBack: isBack,
    isActive: isActive,
}