import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs/operators";
import { CashFlowItemModel } from "src/app/models/cashflowItem.model";
import { CashFlowResponseModel } from "src/app/models/responses/cashflow.response.model";
import {
  AddCashFlowItem,
  CalculateNPV,
  RemoveCashFlowItem,
  ResetCashFlow,
  UpdateCashFlowItem,
} from "../actions/cashflow.action";
import { CashFlowService } from "./../../services/cash-flow.service";

export class CashFlowStateModel {
  cashFlowItems: CashFlowItemModel[];
  cashflowNPV: CashFlowResponseModel;
}

@Injectable()
@State<CashFlowStateModel>({
  name: "cashflow",
  defaults: {
    cashFlowItems: [],
    cashflowNPV: null,
  },
})
export class CashFlowState {
  constructor(private cashFlowService: CashFlowService) {}

  @Selector()
  static getCashFlowItemsState(state: CashFlowStateModel) {
    return state.cashFlowItems;
  }

  @Selector()
  static getCashFlowNPV(state: CashFlowStateModel) {
    return state.cashflowNPV;
  }

  @Action(CalculateNPV)
  calculateNPV(
    { getState, setState }: StateContext<CashFlowStateModel>,
    { payload }: CalculateNPV
  ) {
    return this.cashFlowService.calculateNPV(payload).pipe(
      tap((result) => {
        const state = getState();

        setState({
          ...state,
          cashflowNPV: result,
        });
      })
    );
  }

  @Action(AddCashFlowItem)
  addCashFlow(
    { getState, patchState }: StateContext<CashFlowStateModel>,
    { payload }: AddCashFlowItem
  ) {
    const state = getState();

    patchState({
      cashFlowItems: [...state.cashFlowItems, payload],
    });
  }

  @Action(UpdateCashFlowItem)
  updateCashFlow(
    { getState, setState }: StateContext<CashFlowStateModel>,
    { idx, payload }: UpdateCashFlowItem
  ) {
    const state = getState();
    const cashFlowItems = [...state.cashFlowItems];
    cashFlowItems[idx] = payload;

    setState({
      ...state,
      cashFlowItems: cashFlowItems,
    });
  }

  @Action(RemoveCashFlowItem)
  deleteCashFlow(
    { getState, setState }: StateContext<CashFlowStateModel>,
    { payload }: RemoveCashFlowItem
  ) {
    const state = getState();
    const filteredCashFlowList = state.cashFlowItems.filter(
      (c) => c.uid !== payload.uid
    );

    setState({
      ...state,
      cashFlowItems: filteredCashFlowList,
    });
  }

  @Action(ResetCashFlow)
  resetCashFlow({ getState, setState }: StateContext<CashFlowStateModel>) {
    const state = getState();

    setState({
      ...state,
      cashFlowItems: [],
      cashflowNPV: null,
    });
  }
}
