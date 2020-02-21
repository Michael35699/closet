import {
    Slang,
    SlangSymbol,
} from '../types'

const globalTable = new Map()

export const globalDefine = (key: SlangSymbol, value: Slang): void => {
    globalTable.set(key.value, value)
}

const globalLookup = (key: SlangSymbol): Slang | null => {
    return globalTable.has(key.value)
        ? globalTable.get(key.value)
        : null
}

const localLookup = (ctx: Map<string, Slang>, key: SlangSymbol): Slang | null => {
    return ctx.has(key.value)
        ? ctx.get(key.value)
        : null
}

export const lookup = (key: SlangSymbol, ctx: Map<string, Slang>): Slang | null => {
    return localLookup(ctx, key) ?? globalLookup(key)
}

export const createEnv = (params: SlangSymbol[], args: Slang[]): Map<string, Slang> => {
    const env = new Map()
    params.forEach((v, i) => env.set(v.value, args[i]))

    return env
}

export const createNumberedEnv = (args: Slang[]): Map<string, Slang> => {
    const env = new Map()

    if (args.length > 0) {
        env.set(`%`, args[0])
    }

    args.forEach((v, i) => env.set(`%${i+1}`, v))

    return env
}

export const joinEnvs = (oldEnv: Map<string, Slang>, newEnv: Map<string, Slang>): Map<string, Slang> => {
    const resultEnv = new Map()

    oldEnv.forEach((v,k) => newEnv.has(k) ? null : resultEnv.set(k, v))
    newEnv.forEach((v,k) => resultEnv.set(k, v))

    return resultEnv
}
