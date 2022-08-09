import { CashFlowRequestModel } from "src/app/models/cashflow.request.model";
import { CashFlowItemModel } from "src/app/models/cashflowItem.model";

export class GetAllNetPresentValue {
  static readonly type = "[Cash Flow] Get";
}

export class CalculateNPV {
  static readonly type = "[Cash Flow] Calculate";
  constructor(public payload: CashFlowRequestModel) {}
}

export class AddCashFlowItem {
  static readonly type = "[Cash Flow] Add";
  constructor(public payload: CashFlowItemModel) {}
}

export class RemoveCashFlowItem {
  static readonly type = "[Cash Flow] Remove";
  constructor(public payload: CashFlowItemModel) {}
}

export class UpdateCashFlowItem {
  static readonly type = "[Cash Flow] Update";
  constructor(public payload: CashFlowItemModel, public idx: number) {}
}

export class ResetCashFlow {
  static readonly type = "[Cash Flow] Reset";
}
