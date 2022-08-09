import { CashFlowItemModel } from "./cashflowItem.model";

export interface CashFlowRequestModel {
  discountRate: number;
  cashFlows: CashFlowItemModel[];
}
