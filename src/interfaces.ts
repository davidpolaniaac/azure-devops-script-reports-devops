export interface Frequency {
    value: string;
    number: number;
}

export interface PatternStandar {
    frequency: Frequency[];
    presence: string[][];
}


export interface ReportRepositoryCommits {
    name: string;
    totalCommit: number;
    languageName1: string,
    languagePercentage1: number;
    languageName2: string,
    languagePercentage2: number;
    languageName3: string,
    languagePercentage3: number;
}

export interface AnalysisMetric {
    languageName: string,
    languagePercentage: number
}