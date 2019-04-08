import * as common from './common';
import * as nodeApi from 'azure-devops-node-api';
import * as GitApi from 'azure-devops-node-api/GitApi';
import * as ProjectAnalysisApi from 'azure-devops-node-api/ProjectAnalysisApi';
import * as dotenv from "dotenv";
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as ProjectInterfaces from 'azure-devops-node-api/interfaces/ProjectAnalysisInterfaces';
import * as Interfaces from './interfaces';
import * as utlis from './utils';


dotenv.config({ path: `${__dirname}/../.env` });

async function run() {

    try {

        common.banner('Configuration Commits');

        const webApi: nodeApi.WebApi = await common.getWebApi();
        const gitApi: GitApi.IGitApi = await webApi.getGitApi();
        const projectApi: ProjectAnalysisApi.IProjectAnalysisApi= await webApi.getProjectAnalysisApi();
        const project: string = common.getProject();

        common.heading('Project');
        common.heading(project);

        const analysis: ProjectInterfaces.ProjectLanguageAnalytics  = await projectApi.getProjectLanguageAnalytics(project);
        const repositoriesAnalysis: ProjectInterfaces.RepositoryLanguageAnalytics[] = await analysis.repositoryLanguageAnalytics as ProjectInterfaces.RepositoryLanguageAnalytics[];
        const repositoriesVSTS: GitInterfaces.GitRepository[] = await gitApi.getRepositories(project);
        const repositoriesFilterTest: GitInterfaces.GitRepository[] = repositoriesVSTS.filter(repo => !(repo.name as string).toLowerCase().includes("test")  );
        const repositories: GitInterfaces.GitRepository[] = repositoriesFilterTest.filter(repo => !(repo.name as string).toLowerCase().includes("dojo")  );
        const criteria: GitInterfaces.GitQueryCommitsCriteria = { fromDate: '10/1/2018 12:00:00 AM', $top: 100000 }

        console.log("total de repositories :", repositories.length);
        console.time("commits");
        let report: Interfaces.ReportRepositoryCommits[] = [];
        const increase = 200;
        // Con promesas
        for (let index = 0; index < repositories.length; index = index + increase) {

            const init = index;
            const aux = index + increase;
            const finsh = (aux > repositories.length) ? repositories.length : aux;

            const promises = repositories.slice(init, finsh).map(async repo => {

                const metricFull: ProjectInterfaces.RepositoryLanguageAnalytics = repositoriesAnalysis.find( metric => metric.id === repo.id) as ProjectInterfaces.RepositoryLanguageAnalytics;
                const commits: GitInterfaces.GitCommitRef[] = await gitApi.getCommits(String(repo.id), criteria);

                let metrics: Interfaces.AnalysisMetric[] = [];
                if( metricFull && metricFull.languageBreakdown ){
                    metrics = metricFull.languageBreakdown.map( ( statistics : ProjectInterfaces.LanguageStatistics) =>  {
                        const value : Interfaces.AnalysisMetric = {  languageName:statistics.name as string, languagePercentage:statistics.languagePercentage as number }
                        return value;
                    }).sort((elem:Interfaces.AnalysisMetric) => elem.languagePercentage as number ).reverse();
                }
                
                const reportRepositoryCommits: Interfaces.ReportRepositoryCommits = {
                    name: repo.name as string,
                    totalCommit: commits.length,
                    languageName1:(metrics[0])? metrics[0].languageName: "",
                    languagePercentage1: (metrics[0])? metrics[0].languagePercentage: 0,
                    languageName2: (metrics[1])? metrics[1].languageName: "",
                    languagePercentage2: (metrics[1])? metrics[1].languagePercentage: 0,
                    languageName3: (metrics[2] )? metrics[2].languageName: "",
                    languagePercentage3: (metrics[2])? metrics[2].languagePercentage: 0,
                }
                return reportRepositoryCommits;
            });

            const results: Interfaces.ReportRepositoryCommits[] = await Promise.all(promises);
            report = report.concat(results);

            // results.forEach(result => {
            //     console.log(result.name+","+result.totalCommit);
            // });
        }

        // Sin promesas
        // for (let index = 0; index < repositories.length; index++) {
        //     let repository:GitInterfaces.GitRepository = repositories[index];
        //     let commits : GitInterfaces.GitCommitRef[] = await gitApi.getCommits(String(repository.id),criteria);
        //     const reportRepositoryCommits :Interfaces.ReportRepositoryCommits = {
        //         name: repository.name as string,
        //         totalCommit: commits.length
        //     }
        //     report.push(reportRepositoryCommits);
        // }

        await utlis.createCSV("commits",report);

        console.timeEnd("commits");

    } catch (error) {
        console.log('ERROR', error);
    }

}

run();