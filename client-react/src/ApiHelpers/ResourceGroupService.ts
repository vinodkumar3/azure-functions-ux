import { ResourceGroup } from '../models/resource-group';
import { ArmArray } from '../models/WebAppModels';
import MakeArmCall from './ArmHelper';
import { CommonConstants } from '../utils/CommonConstants';

export default class ResourceGroupService {
  public static fetchResourceGroups = (subscriptionId: string) => {
    const id = `/subscriptions/${subscriptionId}/resourceGroups`;

    return MakeArmCall<ArmArray<ResourceGroup>>({
      resourceId: id,
      commandName: 'FetchResourceGroups',
      apiVersion: CommonConstants.ApiVersions.websiteApiVersion20181101,
    });
  };
}
