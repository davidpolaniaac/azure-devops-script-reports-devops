export interface Frequency {
    value: string;
    number: number;
}

export interface PatternStandar {
    frequency : Frequency[];
    presence: string[][];
}