import MakeArmCall from './ArmHelper';
import { HttpResponseObject } from '../ArmHelper.types';

export interface ARGRequest {
  subscriptions: string[];
  query: string;
  $skipToken?: string;
}

export interface ARGResponse {
  totalRecord: number;
  count: number;
  resultTruncated: boolean;
  data: ARGResponseObj;
}

export interface ARGResponseObj {
  data: ARGResponseObjData;
}

export interface ARGResponseObjData {
  columns: ARGResponseDataColumn[];
  rows: any[][];
}

export interface ARGResponseDataColumn {
  name: string;
  type: 'string' | 'integer' | 'object';
}

export function MakeAzureResourceGraphCall<T>(request: ARGRequest) {
  return MakeArmCall<ARGRequest>({
    resourceId: `/providers/Microsoft.ResourceGraph/resources`,
    commandName: '',
    apiVersion: '2018-09-01-preview',
    method: 'POST',
    body: request,
  }).then(r => {
    if (r.metadata.success) {
      const response: ARGResponseObjData = (r.data as any).data;
      let results: T[] = [];
      for (const row of response.rows) {
        const obj = {};

        // tslint:disable-next-line: no-increment-decrement
        for (let colIndex = 0; colIndex < response.columns.length; colIndex++) {
          obj[response.columns[colIndex].name] = row[colIndex];
        }

        results = [...results, obj as T];
      }

      // Need to cast response object becuase MakeArmCall assumes that the response
      // will always be the same type as the request.  In this case, which should be
      // rare, it is not.
      const finalResponse: HttpResponseObject<T> = { ...r, data: results } as any;
      return finalResponse;
    }

    return (r as any) as HttpResponseObject<T>;
  });
}
