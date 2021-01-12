import type { Recipe } from '../types'
import type { FlashcardPreset } from './flashcardTemplate'

export type { FlashcardPreset } from './flashcardTemplate'
export interface FlashcardRecipes {
    show: Recipe<FlashcardPreset>
    hide: Recipe<FlashcardPreset>
    reveal: Recipe<FlashcardPreset>
}


import { clozeRecipes as cloze } from './clozes'
import { multipleChoiceRecipes as multipleChoice } from './multipleChoice'
import { specRecipes as specification } from './spec'

import {
    mingleRecipes as mingle,
    sortRecipes as sort,
    jumbleRecipes as jumble,
} from './shuffleQuestion'

export * as deciders from './deciders'
export { FlashcardBehavior as behaviors } from './flashcardTemplate'

export const recipes = {
    cloze,
    multipleChoice,
    specification,

    mingle,
    sort,
    jumble,
}
