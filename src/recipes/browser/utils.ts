import patterns from '../patterns'

export const appendStyleTag = (input: string): void => {
    const styleSheet = document.createElement('style')
    styleSheet.type = 'text/css'
    styleSheet.innerHTML = input
    globalThis.document.head.appendChild(styleSheet)
}

const imageSrcPattern = /<img[^>]*?src="(.+?)"[^>]*>/g
export const getImages = (txt: string) => {
    const result = []
    let match: RegExpExecArray | null

    do {
        match = imageSrcPattern.exec(txt)
        if (match) {
            result.push(match[1])
        }
    } while (match)

    return result
}

export const getOffsets = (event: MouseEvent): [number, number] => {
    if (navigator.userAgent.search('Chrome') >= 0) {
        return [
            event.offsetX,
            event.offsetY,
        ]
    }
    else /* Firefox support */ {
        // layerX/Y are deprecated, however offsetX/Y give wrong values on Firefox
        // this does not work when using transform
        const target = (event.currentTarget as Element)

        const boundingRect = target.getBoundingClientRect()
        const parentRect = (target.parentElement as Element).getBoundingClientRect()

        const offsetX = (event as any).layerX - (parentRect.left - boundingRect.left)
        const offsetY = (event as any).layerY - (parentRect.top - boundingRect.top)

        return [
            offsetX,
            offsetY,
        ]
    }
}

export const imageLoadCallback = (query: string, callback: (event: Event) => void) => {
    const maybeElement = document.querySelector(query) as HTMLImageElement

    if (maybeElement) {
        if (maybeElement.complete) {
            callback({ target: maybeElement } as any)
        }

        else {
            maybeElement.addEventListener('load', callback)
        }
    }
}

export const getHighestNum = (labels: string[]): number => {
    let result = 0

    for (const label of labels) {
        const match = label.match(patterns.keySeparation)

        if (!match) {
            continue
        }

        const labelNum = Number(match[2])

        if (Number.isNaN(labelNum)) {
            continue
        }

        result = Math.max(result, labelNum)
    }

    return result
}

export const svgKeyword = 'occlusionSvgCss'
export const svgCss = `
img {
  max-width: 100% !important;
}

.closet-occlusion-container {
  display: inline-block;
  position: relative;
}

.closet-occlusion-container > * {
  display: block;

  margin-left: auto;
  margin-right: auto;
}

.closet-occlusion-container > svg {
  position: absolute;
  top: 0;
}

.closet-occlusion-container__shape > text {
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}`
