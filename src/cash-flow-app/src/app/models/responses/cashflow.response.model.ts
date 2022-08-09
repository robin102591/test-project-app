import { NetPresentValueItemModel } from "./netPresentValueItem.model";

export interface CashFlowResponseModel {
  totalNetPresentValue: number;
  netPresentValues: NetPresentValueItemModel[];
}
