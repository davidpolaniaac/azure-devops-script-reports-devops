import * as common from './common';
import * as nodeApi from 'azure-devops-node-api';
import * as ReleaseApi from 'azure-devops-node-api/ReleaseApi';
import * as ReleaseInterfaces from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import * as Interfaces from './interfaces';
import * as utlis from './utils';
import * as dotenv from "dotenv";

dotenv.config({ path: `${__dirname}/../.env` });

function getStagesNames(environments: ReleaseInterfaces.ReleaseDefinitionEnvironment[]): string[] {
    return environments.map( (environment: ReleaseInterfaces.ReleaseDefinitionEnvironment ) => environment.name ) as string[];
}

function validatorNameExclusion(name: string , exclusionNames: string[]): boolean {
    return !utlis.stringIncludeSomeWords(name,exclusionNames);
}

function validatorNamesStagesWithStandar(environments: ReleaseInterfaces.ReleaseDefinitionEnvironment[] , standarNames: string[]): boolean {
    const environmentsNames : string[] = getStagesNames(environments);
    return utlis.arrayContainerArrayWords(standarNames,environmentsNames);
}

function validatorPatternStandar(environments: ReleaseInterfaces.ReleaseDefinitionEnvironment[] , patternStandar: Interfaces.PatternStandar): boolean {
    
    const environmentsNames : string[] = getStagesNames(environments);
    const frequency : Interfaces.Frequency[] = patternStandar.frequency;
    const presence: string[][] = patternStandar.presence;

    return ( frequency.every( ( freq : Interfaces.Frequency ) => utlis.arrayContainFrecuenyWord(freq.value, freq.number,environmentsNames) ) && presence.every(( names:string[] ) => utlis.arrayIncludeSomeWords(names,environmentsNames)) ) ;
}

function environmentStatus(environments: ReleaseInterfaces.ReleaseEnvironment[], ENVIROMENT_EXCLUSION: string[]): boolean {

    environments = environments.filter( (environment: ReleaseInterfaces.ReleaseEnvironment ) => !utlis.stringIncludeSomeWords(environment.name as string,ENVIROMENT_EXCLUSION));
    return environments.every( (environment: ReleaseInterfaces.ReleaseEnvironment ) => environment.status === ReleaseInterfaces.EnvironmentStatus.Succeeded);
}

async function validatorDeploy(definitionId: number,releaseApi: ReleaseApi.IReleaseApi,project: string, ENVIROMENT_EXCLUSION: string[] ): Promise<boolean> {
    const releases: ReleaseInterfaces.Release[] = await releaseApi.getReleases(project,definitionId,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,ReleaseInterfaces.ReleaseExpands.Environments) as ReleaseInterfaces.Release[];
    return releases.some( (release: ReleaseInterfaces.Release ) => environmentStatus(release.environments as ReleaseInterfaces.ReleaseEnvironment[], ENVIROMENT_EXCLUSION) );
}

async function run() {

    try {

        common.banner('Configuration Pipelines');

        const webApi: nodeApi.WebApi = await common.getWebApi();
        const releaseApi: ReleaseApi.IReleaseApi = await webApi.getReleaseApi();
        const project: string = common.getProject();

        common.heading('Project');
        common.heading(project);

        const KEY_WORD = "PDN";
        const MINIMUN_NUMBER_OF_STAGE = 4;
        const STANDAR_ENVIROMENT_COMPLETELY = ["Create OC","Approve OC","Deploy","Smoke Test","User Validation","Rollback","Smoke Test Rollback"];
        const STANDAR_ENVIROMENT_WITHOUT_ROLLBACK = ["Create OC","Approve OC","Deploy","Smoke Test","User Validation"];
        const EXCLUSION_WORDS = ["COPY","TEST","DEVOPS","CLONE","PRUEBA","MALO","BORRAR"];
        const ENVIROMENT_EXCLUSION = ["ROLLBACK"];

        const PATTERN_WORD : Interfaces.PatternStandar =  {
            frequency: [
                { value: "DEPLOY", number: 1 },
                { value: "OC", number: 2 },
            ],
            presence: [
                ["OC"],
                ["DEPLOY"],
                ["TEST","SMOKE","PRUEBA"],
                ["USER","USUARIO"]
            ]
        }
        
        const releaseDefinition: ReleaseInterfaces.ReleaseDefinition[] = await releaseApi.getReleaseDefinitions(project,KEY_WORD,ReleaseInterfaces.ReleaseDefinitionExpands.Environments);
        
        //Filtros: 

        // filtro basico :  finalicen en PDN, que tenga el minimo de stage y que no contengas las palabras de exclusion en el nombre del pipeline
        const releaseDefinitionFilterBasic = await releaseDefinition.filter (
            (definicion:ReleaseInterfaces.ReleaseDefinition )  => 
            (definicion.name as string).endsWith(KEY_WORD) && 
            (definicion.environments as ReleaseInterfaces.ReleaseDefinitionEnvironment[] ).length >= MINIMUN_NUMBER_OF_STAGE && 
            validatorNameExclusion(definicion.name as string,EXCLUSION_WORDS)
        );
    
        //filtro de definiciones con todo el estandar de nombramiento
        const releaseDefinitionWithStandarStage = await releaseDefinitionFilterBasic.filter( (definicion:ReleaseInterfaces.ReleaseDefinition )  =>
            validatorNamesStagesWithStandar(( definicion.environments as ReleaseInterfaces.ReleaseDefinitionEnvironment[] ),STANDAR_ENVIROMENT_COMPLETELY)
        );

        //filtro de definiciones con todo el estandar de nombramiento sin contar el rollback
        const releaseDefinitionWithStandarWithoutRollBack = await releaseDefinitionFilterBasic.filter( (definicion:ReleaseInterfaces.ReleaseDefinition )  =>
            validatorNamesStagesWithStandar(( definicion.environments as ReleaseInterfaces.ReleaseDefinitionEnvironment[] ),STANDAR_ENVIROMENT_WITHOUT_ROLLBACK)
        );

        //filtro de definiciones con algunos stage que contenga algo de standar
        const releaseDefinitionWithSomeStandar = await releaseDefinitionFilterBasic.filter( (definicion:ReleaseInterfaces.ReleaseDefinition )  =>
            validatorPatternStandar(( definicion.environments as ReleaseInterfaces.ReleaseDefinitionEnvironment[] ), PATTERN_WORD )
        );


            console.log("releaseDefinitionFilterBasic : ",releaseDefinitionFilterBasic.length);
            console.log("releaseDefinitionWithStandarStage : ",releaseDefinitionWithStandarStage.length);
            console.log("releaseDefinitionWithStandarWithoutRollBack : ",releaseDefinitionWithStandarWithoutRollBack.length);
            console.log("releaseDefinitionWithSomeStandar : ",releaseDefinitionWithSomeStandar.length);

        try{

            // filtro de definiciones con al menos un despliegue
            //  const releaseDefinitionWithSomeStandarDeploy = await Promise.all(releaseDefinitionWithSomeStandar.filter( async (definicion:ReleaseInterfaces.ReleaseDefinition ): Promise<boolean>  =>
            //      await validatorDeploy(definicion.id as number,releaseApi,project,ENVIROMENT_EXCLUSION)
            //  ));

            
            let releaseDefinitionWithSomeStandarDeploy: ReleaseInterfaces.ReleaseDefinition[] = [];

             for (let index = 0; index < releaseDefinitionWithSomeStandar.length; index++) {
                 const element = releaseDefinitionWithSomeStandar[index];
                 const releases: ReleaseInterfaces.Release[] = await releaseApi.getReleases(project,element.id,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,ReleaseInterfaces.ReleaseExpands.Environments) as ReleaseInterfaces.Release[];
                 if(releases.some( (release: ReleaseInterfaces.Release ) => environmentStatus(release.environments as ReleaseInterfaces.ReleaseEnvironment[], ENVIROMENT_EXCLUSION) )){
                     releaseDefinitionWithSomeStandarDeploy.push(element);
                 }
             }
             

            console.log("releaseDefinitionWithSomeStandarDeploy : ", releaseDefinitionWithSomeStandarDeploy.length );


            await utlis.createCSV("releaseDefinitionFilterBasic",releaseDefinitionFilterBasic);
            await utlis.createCSV("releaseDefinitionWithStandarStage",releaseDefinitionWithStandarStage);
            await utlis.createCSV("releaseDefinitionWithStandarWithoutRollBack",releaseDefinitionWithStandarWithoutRollBack);
            await utlis.createCSV("releaseDefinitionWithSomeStandar",releaseDefinitionWithSomeStandar);
            await utlis.createCSV("releaseDefinitionWithSomeStandarDeploy",releaseDefinitionWithSomeStandarDeploy);

            
        } catch(err){

            console.error("Error: ", err);
        }

    }
    catch (err) {

        console.error(err);
    }
}

run();