import * as common from './common';
import * as nodeApi from 'azure-devops-node-api';
import * as GitApi from 'azure-devops-node-api/GitApi';
import * as dotenv from "dotenv";
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as Interfaces from './interfaces';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

dotenv.config({ path: `${__dirname}/../.env` });

async function run() {

    try {

        common.banner('Configuration');

        const webApi: nodeApi.WebApi = await common.getWebApi();
        const gitApi: GitApi.IGitApi = await webApi.getGitApi();
        const project: string = common.getProject();

        common.heading('Project');
        common.heading(project);

        const repositoriesVSTS: GitInterfaces.GitRepository[] = await gitApi.getRepositories(project);
        const repositoriesFilterTest: GitInterfaces.GitRepository[] = repositoriesVSTS.filter(repo => !(repo.name as string).toLowerCase().includes("test")  );
        const repositories: GitInterfaces.GitRepository[] = repositoriesFilterTest.filter(repo => !(repo.name as string).toLowerCase().includes("dojo")  );
        const criteria: GitInterfaces.GitQueryCommitsCriteria = { fromDate: '1/10/2018 12:00:00 AM' }


        const dateStart = new Date();
        console.log("dateStart: ", dateStart.toISOString());
        console.log("total de repositories :", repositories.length);
        let report: Interfaces.ReportRepositoryCommits[] = [];

        // Con promesas
        for (let index = 0; index < repositories.length; index = index + 200) {

            const init = index;
            const aux = index + 200;
            const finsh = (aux > repositories.length) ? repositories.length : aux;

            const promises = repositories.slice(init, finsh).map(async repo => {

                const commits: GitInterfaces.GitCommitRef[] = await gitApi.getCommits(String(repo.id), criteria);
                const reportRepositoryCommits: Interfaces.ReportRepositoryCommits = {
                    name: repo.name as string,
                    totalCommit: commits.length
                }
                return reportRepositoryCommits;
            });

            const results: Interfaces.ReportRepositoryCommits[] = await Promise.all(promises);
            report.concat(results);

            // results.forEach(result => {
            //     console.log(result.name, result.totalCommit);
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

        const csvWriter = createCsvWriter({
            path: 'dist/commits.csv',
            header: [
                { id: 'name', title: 'Name' },
                { id: 'totalCommit', title: 'total Commits' },
            ]
        });

        csvWriter
            .writeRecords(report)
            .then(() => console.log('The CSV file was written successfully'));

        const dateFinish = new Date();
        console.log("dateFinish : ", dateFinish.toISOString());
        console.log("Total", dateFinish.getTime() - dateStart.getTime());

    } catch (error) {
        console.log('ERROR', error);
    }

}

run();