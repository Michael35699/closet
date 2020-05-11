import type {
    Internals,
} from '.'

export interface FilterResult {
    result: string
    memoize?: boolean
}

export interface Filterable {
    getDefaultRepresentation(): string
    getRawRepresentation(): string
    getFilterKey(): string
}

const wrapWithNonMemoize = (result: string): FilterResult => ({
    result: result,
    memoize: false,
})

const standardizeFilterResult = (wf: WeakFilter): Filter => (t: Filterable, i: Internals): FilterResult => {
    const input = wf(t, i)

    switch (typeof input) {
        case 'string':
            return wrapWithNonMemoize(input)

        // includes null
        case 'object':
            return {
                result: input.result,
                memoize: input.memoize ?? false,
            }

        // undefined
        default:
            return {
                // this will mark as "not ready"
                result: null,
                memoize: false,
            }
    }
}

export type WeakFilter = (t: Filterable, i: Internals) => FilterResult | string | void
export type Filter = (t: Filterable, i: Internals) => FilterResult

const baseFilter = (t: Filterable, i: Internals) => i.ready ? wrapWithNonMemoize(t.getRawRepresentation()) : undefined
const rawFilter = (t: Filterable) => wrapWithNonMemoize(t.getRawRepresentation())
const defaultFilter = (t: Filterable) => wrapWithNonMemoize(t.getDefaultRepresentation())

export class FilterApi {
    private filters: Map<string, WeakFilter>

    constructor() {
        this.filters = new Map()
    }

    register(name: string, filter: WeakFilter): void {
        this.filters.set(name, filter)
    }

    has(name: string): boolean {
        return name === 'raw' || name === 'base'
            ? true
            : this.filters.has(name)
    }

    get(name: string): Filter | null {
        return name === 'base'
            ? baseFilter
            : name === 'raw'
            ? rawFilter
            : this.filters.has(name)
            ? standardizeFilterResult(this.filters.get(name))
            : null
    }

    getOrDefault(name: string): Filter {
        const maybeResult =  this.get(name)

        if (maybeResult) {
            return maybeResult
        }

        return defaultFilter
    }

    unregisterFilter(name: string): void {
        this.filters.delete(name)
    }

    clearFilters(): void {
        this.filters.clear()
    }

    execute(data: Filterable, internals: Internals): FilterResult {
        return standardizeFilterResult(this.getOrDefault(data.getFilterKey()))(data, internals)
    }
}
