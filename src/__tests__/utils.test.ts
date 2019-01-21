import * as utils from '../utils';

describe('Array contains the word frequency', () => {

    it('when the frequency corresponds', () => {
        const value: string = "hi";
        const number:number = 2;
        const environmentsNames: string[] = ["david","Hi","hi","polania"];
        expect(utils.arrayContainFrecuenyWord(value,number,environmentsNames)).toBe(true);
    });

    it('when the frequency does not correspond', () => {
        const value: string = "hi";
        const number:number = 4;
        const environmentsNames: string[] = ["david","Hi","hi","polania"];
        expect(utils.arrayContainFrecuenyWord(value,number,environmentsNames)).toBe(false);
    });

    it('when the word does not have frequency', () => {
        const value: string = "del";
        const number:number = 1;
        const environmentsNames: string[] = ["david","Hi","hi","polania"];
        expect(utils.arrayContainFrecuenyWord(value,number,environmentsNames)).toBe(false);
    });
});


describe('Array contains a word', () => {

    it('when the array has a word', () => {
        const name: string = "hi";
        const environmentsNames: string[] = ["david","Hi","hi","polania"];
        expect(utils.arrayIncludeWord(name,environmentsNames)).toBe(true);
    });

    it('when the array does not have a word', () => {
        const name: string = "del";
        const environmentsNames: string[] = ["david","Hi","hi","polania"];
        expect(utils.arrayIncludeWord(name,environmentsNames)).toBe(false);
    });
});


describe('Array include some words', () => {

    it('when the array is included in another array', () => {
        const environmentsNamesStandar: string[] = ["Deploy","user"];
        const environmentsNames: string[] = ["david","Hi","hi","polania","deploy","oc"];
        expect(utils.arrayIncludeSomeWords(environmentsNamesStandar,environmentsNames)).toBe(true);
    });

    it('when the array is not included in another array', () => {
        const environmentsNamesStandar: string[] = ["roll","op","user"];
        const environmentsNames: string[] = ["david","Hi","hi","polania","deploy","oc"];
        expect(utils.arrayIncludeSomeWords(environmentsNamesStandar,environmentsNames)).toBe(false);
    });

});


describe('A string can include some array of words', () => {

    it('when the string contains at least one of the words', () => {
        const name: string = "oc";
        const environmentsNames: string[] = ["david","Hi","hi","polania","deploy","oc"];
        expect(utils.stringIncludeSomeWords(name,environmentsNames)).toBe(true);
    });

    it('when the string does not contain at least one of the words', () => {
        const name: string = "oc"
        const environmentsNames: string[] = ["david","Hi","hi","polania","deploy","roll"];
        expect(utils.stringIncludeSomeWords(name,environmentsNames)).toBe(false);
    });

});


describe('Array contains an entire array', () => {

    it('when the array contains all the other array', () => {
        const environmentsNamesStandar: string[] = ["david","polania","deploy","oc"];
        const environmentsNames: string[] = ["david","Hi","hi","polania","deploy","oc"];
        expect(utils.arrayContainerArrayWords(environmentsNamesStandar,environmentsNames)).toBe(true);
    });

    it('when the array does not contain all the other array', () => {
        const environmentsNamesStandar: string[] = ["david","polania","deploy","oc","user"];
        const environmentsNames: string[] = ["david","Hi","hi","polania","deploy","roll","oc"];
        expect(utils.arrayContainerArrayWords(environmentsNamesStandar,environmentsNames)).toBe(false);
    });

});








