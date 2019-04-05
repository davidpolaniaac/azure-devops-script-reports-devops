export function arrayContainFrecuenyWord(value: string, number: number, environmentsNames: string[]): boolean {

    value = value.toUpperCase();
    environmentsNames = environmentsNames.map(word => word.toUpperCase());

    return number == environmentsNames.reduce((n, name) => { return n + (name.includes(value) ? 1 : 0) }, 0);
}

export function arrayIncludeWord(name: string, words: string[]): boolean {

    name = name.toUpperCase();
    words = words.map(word => word.toUpperCase());

    return words.some((word: string) => word.includes(name));
}

export function arrayIncludeSomeWords(arrayStandar: string[], arrayNames: string[]): boolean {

    arrayStandar = arrayStandar.map(word => word.toUpperCase());
    arrayNames = arrayNames.map(word => word.toUpperCase());

    return arrayStandar.some((standarName: string) => arrayIncludeWord(standarName, arrayNames));
}

export function stringIncludeSomeWords(name: string, words: string[]): boolean {

    name = name.toUpperCase();
    words = words.map(word => word.toUpperCase());

    return words.some((word: string) => name.includes(word));
}

export function arrayContainerArrayWords(arrayStandar: string[], arrayNames: string[]): boolean {

    arrayStandar = arrayStandar.map(word => word.toUpperCase());
    arrayNames = arrayNames.map(word => word.toUpperCase());

    return arrayStandar.every((standarName: string) => arrayNames.indexOf(standarName) >= 0);
}

export async function createCSV(nameReport: string, objects: any[]): Promise<any> {

    const fs = require('fs');
    const dir = './report';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const ObjectsToCsv = require('objects-to-csv');
    const csv = new ObjectsToCsv(objects);
    await csv.toDisk(`./report/${nameReport}.csv`);
}