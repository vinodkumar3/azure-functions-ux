import { Injector } from '@angular/core/src/core';
import { UrlTemplates } from 'app/shared/url-templates';
import { FunctionAppContext } from './../function-app-context';
import { Site } from './../models/arm/site';
import { FunctionContainer } from './../models/function-container';
import { ArmObj } from './../models/arm/arm-obj';
import { Kinds } from '../models/constants';
import { ApplicationSettings } from '../models/arm/application-settings';

export namespace ArmUtil {
  export function isFunctionApp(obj: ArmObj<any> | FunctionContainer): boolean {
    return (
      obj && (obj.kind && obj.kind.toLocaleLowerCase().includes(Kinds.functionApp) && !obj.kind.toLocaleLowerCase().includes(Kinds.botapp))
    );
  }

  export function isLinuxApp(obj: ArmObj<any> | FunctionContainer): boolean {
    return obj && obj.kind && obj.kind.toLocaleLowerCase().includes(Kinds.linux);
  }

  export function isContainerApp(obj: ArmObj<any> | FunctionContainer): boolean {
    return obj && obj.kind && obj.kind.toLocaleLowerCase().includes(Kinds.container);
  }
  export function isLinuxDynamic(obj: ArmObj<Site> | FunctionContainer) {
    return isLinuxApp(obj) && obj.properties.sku && obj.properties.sku.toLocaleLowerCase() === 'dynamic';
  }

  export function mapArmSiteToContext(obj: ArmObj<Site>, appSettings: ArmObj<ApplicationSettings>, injector: Injector): FunctionAppContext {
    const template = new UrlTemplates(obj, appSettings, injector);

    return {
      site: obj,
      scmUrl: template.getScmUrl(),
      mainSiteUrl: template.getMainUrl(),
      urlTemplates: template,
      useArmApis: !isV1FunctionApp(appSettings),
    };
  }

  export function isV1FunctionApp(appSettings: ArmObj<ApplicationSettings>) {
    return (
      appSettings &&
      appSettings.properties['FUNCTIONS_EXTENSION_VERSION'] &&
      (appSettings.properties['FUNCTIONS_EXTENSION_VERSION'] === '~1' ||
        appSettings.properties['FUNCTIONS_EXTENSION_VERSION'].startsWith('1.'))
    );
  }
}
