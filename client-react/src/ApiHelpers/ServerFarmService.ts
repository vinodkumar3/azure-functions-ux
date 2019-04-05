import { ServerFarm, ArmObj } from '../models/WebAppModels';
import { CommonConstants } from '../utils/CommonConstants';
import MakeArmCall from './ArmHelper';
import { ARGRequest, MakeAzureResourceGraphCall } from './ArgHelper';

export default class ServerFarmService {
  // public static fetchSubscriptionServerFarms = (subscriptionId: string) => {
  //   const id = `/resources?api-version=${
  //     CommonConstants.ApiVersions.websiteApiVersion20181101
  //   }&$filter=(subscriptionId%20eq%20'${subscriptionId}')%20and%20(resourceType%20eq%20'Microsoft.Web/serverFarms')`;
  //   return MakeArmCall<ArmArray<ServerFarm>>({
  //     resourceId: id,
  //     commandName: 'FetchServerFarmsFromArmCache',
  //     apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
  //   });
  // };

  public static fetchServerFarm = (resourceId: string) => {
    return MakeArmCall<ArmObj<ServerFarm>>({
      resourceId,
      commandName: 'FetchServerFarm',
      apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
    });
  };

  public static fetchServerFarmsForWebspace = (subscriptionId: string, webspace: string) => {
    const queryString =
      `where type == 'microsoft.web/serverfarms'` +
      `| extend webspace = extract('.*', 0, tostring(properties.webSpace))` +
      `| where webspace == '${webspace}'` +
      `| project id, name, type, kind, properties, sku`;

    const request: ARGRequest = {
      subscriptions: [subscriptionId],
      query: queryString,
    };

    // etodo: add paging
    return MakeAzureResourceGraphCall<ArmObj<ServerFarm>[]>(request);
  };

  // public static fetchResourceGroups = (subscriptionId: string) => {
  //   const id = `/subscriptions/${subscriptionId}/resourceGroups`;

  //   return MakeArmCall<ArmArray<ResourceGroup>>({
  //     resourceId: id,
  //     commandName: 'FetchResourceGroups',
  //     apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
  //   });
  // };
}

// const subscriptionServerFarmsApi = {
//   fetchSubscriptionServerFarms: (state: RootState): Promise<ArmArray<ServerFarm>> => {
//     // etodo: The fact that this depends on the site object seems wrong to me
//     const siteId = state.site.resourceId;
//     const descriptor = new ArmSubcriptionDescriptor(siteId);
//     const resourceId = `/subscriptions/${descriptor.subscriptionId}/providers/microsoft.web/serverfarms`;

//     const apiVersion = '2018-11-01';
//     return MakeArmCall<ArmArray<ServerFarm>>({
//       resourceId,
//       commandName: 'FetchSubscriptionResourceGroups',
//       apiVersion,
//     });
//   },
// };

// export default subscriptionServerFarmsApi;
