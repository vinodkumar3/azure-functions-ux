import React, { useState, useEffect } from 'react';
import { ArmObj, Site, ArmArray, ServerFarm } from '../../../models/WebAppModels';
import { ResourceGroup } from '../../../models/resource-group';
import { ArmSubcriptionDescriptor } from '../../../utils/resourceDescriptors';
import ChangeAppPlan from './ChangeAppPlan';
import LoadingComponent from '../../../components/loading/loading-component';
import SiteService from '../../../ApiHelpers/SiteService';
import ResourceGroupService from '../../../ApiHelpers/ResourceGroupService';
import ServerFarmService from '../../../ApiHelpers/ServerFarmService';
import { ServerFarmSkuConstants } from '../../../utils/scenario-checker/ServerFarmSku';

interface ChangeAppPlanDataLoaderProps {
  resourceId: string;
}

const filterListToPotentialPlans = (site: ArmObj<Site>, serverFarms: ArmObj<ServerFarm>[]) => {
  return serverFarms.filter(s => {
    if (site.properties.serverFarmId.toLowerCase() === s.id.toLowerCase()) {
      return false;
    }

    if (
      (site.properties.sku === ServerFarmSkuConstants.Tier.dynamic || site.properties.sku === ServerFarmSkuConstants.Tier.elasticPremium) &&
      s.sku &&
      s.sku.tier !== site.properties.sku
    ) {
      return false;
    }

    return true;
  });
};

const ChangeAppPlanDataLoader: React.SFC<ChangeAppPlanDataLoaderProps> = props => {
  const [site, setSite] = useState<ArmObj<Site> | null>(null);
  const [resourceGroups, setResourceGroups] = useState<ArmArray<ResourceGroup> | null>(null);
  const [serverFarms, setServerFarms] = useState<ArmObj<ServerFarm>[] | null>(null);
  const resourceId = props.resourceId;
  let siteResult: ArmObj<Site>;

  const fetchData = async () => {
    const descriptor = new ArmSubcriptionDescriptor(resourceId);

    await Promise.all([SiteService.fetchSite(resourceId), ResourceGroupService.fetchResourceGroups(descriptor.subscriptionId)])
      .then(responses => {
        siteResult = responses[0].data;
        setSite(responses[0].data);
        setResourceGroups(responses[1].data);

        return ServerFarmService.fetchServerFarmsForWebspace(descriptor.subscriptionId, siteResult.properties.webSpace);
      })
      .then(serverFarmsResult => {
        const filteredServerFarms = filterListToPotentialPlans(siteResult, serverFarmsResult.data);
        setServerFarms(filteredServerFarms);
      });
  };

  useEffect(
    () => {
      fetchData();
    },
    [resourceId]
  );

  if (!site || !resourceGroups || !serverFarms) {
    return <LoadingComponent />;
  }

  return (
    <>
      <ChangeAppPlan site={site} resourceGroups={resourceGroups} serverFarms={serverFarms} />
    </>
  );
};

export default ChangeAppPlanDataLoader;
