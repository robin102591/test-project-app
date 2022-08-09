import { Component, OnInit } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { CashFlowState } from "src/app/store/states/cashflow.state";
import { Observable } from "rxjs";
import { CashFlowItemModel } from "src/app/models/cashflowItem.model";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { map } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import {
  AddCashFlowItem,
  CalculateNPV,
  ResetCashFlow,
  UpdateCashFlowItem,
} from "src/app/store/actions/cashflow.action";
import { RemoveCashFlowItem } from "./../../store/actions/cashflow.action";
import { CashFlowRequestModel } from "src/app/models/cashflow.request.model";
import { NetPresentValueItemModel } from "src/app/models/responses/netPresentValueItem.model";
import { CashFlowResponseModel } from "src/app/models/responses/cashflow.response.model";

@Component({
  selector: "app-calculator",
  templateUrl: "./calculator.component.html",
  styleUrls: ["./calculator.component.scss"],
})
export class CalculatorComponent implements OnInit {
  @Select(CashFlowState.getCashFlowItemsState) cashFlowItem$: Observable<
    CashFlowItemModel[]
  >;
  @Select(CashFlowState.getCashFlowNPV) cashFlowNPV$: Observable<
    CashFlowResponseModel
  >;

  form: FormGroup;
  isLoading = false;
  dataSource: MatTableDataSource<any>;
  dataSourceNPV: MatTableDataSource<NetPresentValueItemModel>;
  displayedColumns = ["period", "amount", "actions"];
  displayedColumnsNPV = ["period", "cashFlow", "present"];
  cashFlowItemRequest: CashFlowItemModel[];
  discountRate: number = 1;
  totalNPV: number;
  localNetPresentValues: NetPresentValueItemModel[];

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    barThickness: 10,
  };

  public barChartLabels: string[] = [];
  public barChartType = "bar";
  public barChartLegend = true;

  public barChartData: any[] = [
    { data: [], label: "Cash Flow" },
    { data: [], label: "Present Value" },
  ];

  public barChartColors: Array<any> = [
    { backgroundColor: "#1976d2" },
    { backgroundColor: "#26dad2" },
  ];

  constructor(private fb: FormBuilder, private store: Store) {}

  ngOnInit(): void {
    this._initForm();
    this.cashFlowItem$
      .pipe(
        map((cashflowItems) => {
          this.cashFlowItemRequest = cashflowItems.map(
            this._createCashFlowItemRequest
          );
          const formGroup = cashflowItems.map(this._createCashFlowForm);
          return new FormArray(formGroup);
        })
      )
      .subscribe((fa) => {
        this.form.setControl("cashFlows", fa);
        this.dataSource = new MatTableDataSource(
          (this.form.get("cashFlows") as FormArray).controls
        );
      });

    this.cashFlowNPV$.subscribe((result) => {
      this.dataSourceNPV = new MatTableDataSource(result?.netPresentValues);
      this.totalNPV = result?.totalNetPresentValue ?? 0.0;
      this.localNetPresentValues = result?.netPresentValues ?? [];
    });
  }

  handleChangeDiscount(event) {
    this.discountRate = event.value;
  }

  handleAddCashFlowItem() {
    let cashFlowItem: CashFlowItemModel = {
      uid: this._getUniqueId(),
      period: 1,
      amount: 0,
    };

    this.store.dispatch(new AddCashFlowItem(cashFlowItem));
  }

  handleDeleteItem(row: any) {
    let cashflowItem: CashFlowItemModel = {
      ...row.value,
    };
    this.store.dispatch(new RemoveCashFlowItem(cashflowItem));
  }

  handleAmountChange(amount, row: any, idx: number) {
    let cashflowItem: CashFlowItemModel = {
      ...row.value,
      amount: amount,
    };
    this.store.dispatch(new UpdateCashFlowItem(cashflowItem, idx));
  }

  handleCalculateNPV() {
    let cashFlowRequest = {
      discountRate: this.discountRate,
      cashFlows: this.cashFlowItemRequest,
    } as CashFlowRequestModel;

    this.isLoading = true;
    this.store.dispatch(new CalculateNPV(cashFlowRequest)).subscribe(
      () => {
        this.isLoading = false;
        this._buildChart(this.localNetPresentValues);
      },
      (error) => {
        this.isLoading = false;
        alert(error.error.message);
      }
    );
  }

  handleReset() {
    this.discountRate = 1;
    this.store.dispatch(new ResetCashFlow());

    this.barChartData = [
      { data: [], label: "Cash Flow" },
      { data: [], label: "Present Value" },
    ];
  }

  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

  private _createCashFlowItemRequest(item: CashFlowItemModel, idx: number) {
    let request: CashFlowItemModel = {
      ...item,
      period: idx + 1,
      amount: parseFloat(item.amount.toString()),
    };

    return request;
  }

  private _createCashFlowForm(cashFlowItem: CashFlowItemModel): FormGroup {
    return new FormGroup({
      uid: new FormControl(cashFlowItem?.uid),
      amount: new FormControl(cashFlowItem?.amount, Validators.required),
    });
  }

  private _initForm() {
    this.form = this.fb.group({
      cashFlows: this.fb.array([], Validators.compose([])),
    });
  }

  private _getUniqueId() {
    return `${Math.random().toString(36).substring(2, 9)}`;
  }

  //Simple Chart Config
  private _buildChart(netPresentValues: NetPresentValueItemModel[]) {
    if (netPresentValues) {
      this.barChartLabels = netPresentValues?.map((n) => `Period ${n.period}`);
      this.barChartData = [];
      let cashFlowSeries = {
        data: [...netPresentValues?.map((n) => n.cashFlowAmount)],
        label: "Cash Flow",
      };

      let presentValueSeries = {
        data: [...netPresentValues?.map((n) => n.presentValue)],
        label: "Present Value",
      };

      this.barChartData.push(cashFlowSeries);
      this.barChartData.push(presentValueSeries);
    }
  }
}
