export interface Frequency {
    value: string;
    number: number;
}

export interface PatternStandar {
    frequency: Frequency[];
    presence: string[][];
}


export interface ReportRepositoryCommits {
    name: string,
    totalCommit: number
}