export function regexGrabStr(line: string, regex: RegExp | string, byDefault = "Default"): string{
    const grabbed = line.match(regex)
    return grabbed ? grabbed[0] : byDefault
}

export function regexGrabNum(line: string, regex: RegExp | string, byDefault = 0): number{
    const grabbed = line.match(regex)
    if (!grabbed){
        return byDefault
    }
    return isNaN(+grabbed) ? byDefault : +grabbed
}

export function upperCaseFirst(word: string): string{
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function Xtox(prefix: string | RegExp, X: string): string{
    return X .replace(prefix, '')
                .toLowerCase().replace(/_/g, ' ')
                .split(' ')
                .map((x)=> upperCaseFirst(x))
                .join(' ')
}