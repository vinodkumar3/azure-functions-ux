import React, { useContext } from 'react';
import FeatureDescriptionCard from '../../../components/feature-description-card/FeatureDescriptionCard';
import { IDropdownOption, PrimaryButton } from 'office-ui-fabric-react';
import { Formik, FormikActions, FormikProps, Field } from 'formik';
import { ResourceGroup } from '../../../models/resource-group';
import { ArmObj, Site, ArmArray, ServerFarm } from '../../../models/WebAppModels';
import CreateOrSelect, { CreateOrSelectFormValues } from '../../../components/form-controls/CreateOrSelect';
import { style } from 'typestyle';
import { PortalContext } from '../../../PortalContext';
import PortalCommunicator from '../../../portal-communicator';
import { PlanSpecPickerData } from '../spec-picker/specs/PriceSpec';
import { ArmSiteDescriptor } from '../../../utils/resourceDescriptors';
import { ServerFarmSkuConstants } from '../../../utils/scenario-checker/ServerFarmSku';
import SiteService from '../../../ApiHelpers/SiteService';

export const leftCol = style({
  marginRight: '20px',
});

// eotod: should be global
export const linkStyle = style({
  color: '#015cda',
  cursor: 'pointer',
});

export interface ChangeAppPlanProps {
  site: ArmObj<Site>;
  resourceGroups: ArmArray<ResourceGroup>;
  serverFarms: ArmObj<ServerFarm>[];
}

export interface ChangeAppPlanFormValues {
  site: ArmObj<Site>;
  resourceGroupInfo: CreateOrSelectFormValues<ArmObj<ResourceGroup>>;
  serverFarmInfo: CreateOrSelectFormValues<ArmObj<ServerFarm>>;
  newServerFarmSkuCode: string;
}

const onSubmit = async (values: ChangeAppPlanFormValues, actions: FormikActions<any>) => {
  const { site, resourceGroupInfo, serverFarmInfo } = values;

  if (resourceGroupInfo.newOrExisting === 'existing') {
    if (serverFarmInfo.newOrExisting === 'existing') {
      site.properties.serverFarmId = serverFarmInfo.existingValue ? serverFarmInfo.existingValue.id : '';

      const response = await SiteService.updateSite(site.id, site);
      if (response.metadata.success) {
        console.log('success!');
      } else {
        console.log('failed!');
      }
      // values.site.properties.serverFarmId = values.serv
    }
  }

  // console.log(`submit: ${JSON.stringify(values)}, ${JSON.stringify(actions)}`);

  // if (true) {
  //   console.log('test');
  // }
};

const getSelectedSkuString = (formValues: ChangeAppPlanFormValues) => {
  const { serverFarmInfo, newServerFarmSkuCode } = formValues;

  if (serverFarmInfo.newOrExisting === 'new') {
    for (const skuName of Object.keys(ServerFarmSkuConstants.SkuCode)) {
      for (const skuCode of Object.keys(ServerFarmSkuConstants.SkuCode[skuName])) {
        if (skuCode.toLowerCase() === newServerFarmSkuCode.toLowerCase()) {
          return `${skuName} (${skuCode})`;
        }
      }
    }

    // etodo: logging
    console.log(`Couldn't find ${newServerFarmSkuCode}`);

    return newServerFarmSkuCode;
  }

  if (serverFarmInfo.existingValue && serverFarmInfo.existingValue.sku) {
    return `${serverFarmInfo.existingValue.sku.tier} (${serverFarmInfo.existingValue.sku.name}) `;
  }
};

const changeSku = async (portalCommunicator: PortalCommunicator, specPickerData: PlanSpecPickerData) => {
  const result = await portalCommunicator.openBlade(
    {
      detailBlade: 'SpecPickerFrameBlade',
      detailBladeInputs: {
        id: `/subscriptions/${specPickerData.subscriptionId}`,
        data: specPickerData,
      },
    },
    'changeappplan'
  );

  console.log(result);
};

const getDropdownOptions = (objs: ArmObj<any>[]) => {
  let options: IDropdownOption[] = [];
  if (objs) {
    for (let i = 0; i < objs.length; i = i + 1) {
      options = [
        ...options,
        {
          key: objs[i].id,
          text: objs[i].name,
          data: objs[i],
          selected: i === 0,
        },
      ];
    }
  }

  return options;
};

const ChangeAppPlan: React.SFC<ChangeAppPlanProps> = props => {
  const { resourceGroups, serverFarms, site } = props;
  const portalCommunicator = useContext(PortalContext);
  const descriptor = new ArmSiteDescriptor(site.id);

  const formValues: ChangeAppPlanFormValues = {
    site,
    resourceGroupInfo: {
      newOrExisting: 'new',
      existingValue: null,
      newValue: '',
      loading: !resourceGroups,
    },
    serverFarmInfo: {
      newOrExisting: 'new',
      existingValue: serverFarms.length > 0 ? serverFarms[0] : null,
      newValue: '',
      loading: !serverFarms,
    },
    newServerFarmSkuCode: 'P1v2',
  };

  const rgOptions = getDropdownOptions((resourceGroups as ArmArray<ResourceGroup>).value);
  const serverFarmOptions = getDropdownOptions(serverFarms as ArmObj<ServerFarm>[]);

  return (
    <>
      <Formik initialValues={formValues} onSubmit={onSubmit}>
        {(formProps: FormikProps<ChangeAppPlanFormValues>) => {
          const specPickerData: PlanSpecPickerData = {
            returnObjectResult: true,
            subscriptionId: descriptor.subscription,
            location: site.location,
            hostingEnvironmentName: site.properties.hostingEnvironmentProfile && site.properties.hostingEnvironmentProfile.name,
            allowAseV2Creation: false,
            forbiddenSkus: [],
            isLinux: site.properties.reserved,
            isXenon: site.properties.isXenon,
            selectedLegacySkuName: 'small_standard',
          };

          return (
            <form>
              <header>
                <FeatureDescriptionCard
                  name="Changeplandescription"
                  description="Change app service plan description"
                  iconUrl="/images/app-service-plan.svg"
                />
              </header>

              <section>
                <Field
                  name="resourceGroupInfo"
                  component={CreateOrSelect}
                  fullpage
                  label="Target Resource Group"
                  id="resource-group-picker"
                  options={rgOptions}
                />

                <Field
                  name="serverFarmInfo"
                  component={CreateOrSelect}
                  fullpage
                  label="Target Server Farm"
                  id="server-farm-picker"
                  options={serverFarmOptions}
                />

                <div>
                  <label className={leftCol}>Region</label>
                  <span>{site.location}</span>
                </div>

                <div>
                  <label className={leftCol}>Pricing Tier</label>
                  <span>
                    <a
                      className={linkStyle}
                      tabIndex={0}
                      onClick={() => {
                        changeSku(portalCommunicator, specPickerData);
                      }}>
                      {getSelectedSkuString(formProps.values)}
                    </a>
                  </span>
                </div>
              </section>

              <footer>
                <PrimaryButton data-automation-id="test" text="OK" allowDisabledFocus={true} onClick={formProps.submitForm} />
              </footer>
            </form>
          );
        }}
      </Formik>
    </>
  );
};

export default ChangeAppPlan;
