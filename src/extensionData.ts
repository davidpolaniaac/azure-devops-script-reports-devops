import * as common from './common';
import * as nodeApi from 'azure-devops-node-api';
import * as ExtensionManagementApi from 'azure-devops-node-api/ExtensionManagementApi';
import * as dotenv from "dotenv";
import * as data from './result.json';

dotenv.config({ path: `${__dirname}/../.env` });

function getUnique(arr: any[], comp: string): any[] {
    const unique = arr.map(e => e[comp]).map((e, i, final) => final.indexOf(e) === i && i).filter((e:any) => arr[e]).map((e:any) => arr[e]);
    return unique;
}

interface DocumentBase {
    name: string;
    userName: string;
    collection: string;
    date: string;
}

interface Document {
    name: string;
    userName: string;
    collection: string;
    date: string;
    id: string;
}

async function run() {
    try {

        common.banner('init migrations');

        const webApi: nodeApi.WebApi = await common.getWebApi();
        const extApi: ExtensionManagementApi.IExtensionManagementApi = await webApi.getExtensionManagementApi();

        const userName: string = "DevOps Team";
        const date: string = "2019-4-30 10:00:00"
        const publisherName: string = "DevopsExtensionsBancolombia";
        const extensionName: string = "company";
        const scopeType: string = "Default";
        const scopeValue: string = "Current";
        const collectionManagements: string = "managements";

        for (let index = 0; index < data.length; index++) {
            const management = data[index];
            const docManagement: DocumentBase = {
                name: management.domain,
                collection: collectionManagements,
                userName: userName,
                date: date
            };
            const managementReponse: Document = await extApi.createDocumentByName(docManagement, publisherName, extensionName, scopeType, scopeValue, collectionManagements);
            if (typeof managementReponse.id === 'undefined' && management.apps.length > 0) {
                console.log("Add management : ", managementReponse.name );

                const collectionApp = managementReponse.id;
                const apps = management.apps;
                for (let index = 0; index < apps.length; index++) {
                    const app = apps[index];
                    const docApp: Document = {
                        name: app.name,
                        userName: userName,
                        collection: collectionApp,
                        date: date,
                        id: app.id,
                    };
                    let appReponse: Document = await extApi.createDocumentByName(docApp, publisherName, extensionName, scopeType, scopeValue, collectionApp);
                    appReponse = await extApi.getDocumentByName( publisherName, extensionName, scopeType, scopeValue, collectionApp, docApp.id );
                    if (typeof appReponse.id === 'undefined' && app.enviroments.length > 0) {
                        console.log("Add App : ", appReponse.name );

                        const collectionComponent = appReponse.id;
                        const components = app.enviroments.map(env => env.components);
                        const uniqueComponent = getUnique(components, 'id');

                        for (let index = 0; index < uniqueComponent.length; index++) {
                            const componet: Document = uniqueComponent[index];
                            const docComponent: Document = {
                                name: componet.name,
                                userName: userName,
                                collection: collectionComponent,
                                date: date,
                                id: componet.id,
                            };
                            let componentReponse: Document = await extApi.createDocumentByName(docComponent, publisherName, extensionName, scopeType, scopeValue, collectionComponent);
                            componentReponse = await extApi.getDocumentByName(publisherName, extensionName, scopeType, scopeValue, collectionComponent, docComponent.id );

                            if(typeof componentReponse.id === 'undefined'){
                                console.log("Add component : ", componentReponse.name );
                            }else{
                                console.log("falil component : ", docComponent );
                                console.log("fail componentReponse : ", componentReponse );
                            }
                       }

                    }else{
                        console.log("fail app : ", docApp );
                        console.log("fail appReponse : ", appReponse );

                    }
                }

            }else{
                console.log("fail management : ", docManagement );
                console.log("fail managementReponse : ", managementReponse );
            }
        }

    } catch (err) {
        console.error(err);
    }
}

run();


