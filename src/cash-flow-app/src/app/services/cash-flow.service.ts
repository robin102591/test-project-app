import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { CashFlowRequestModel } from "../models/cashflow.request.model";
import { CashFlowResponseModel } from "./../models/responses/cashflow.response.model";

@Injectable({
  providedIn: "root",
})
export class CashFlowService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  calculateNPV(
    payload: CashFlowRequestModel
  ): Observable<CashFlowResponseModel> {
    return this.http.post<CashFlowResponseModel>(
      `${this.baseUrl}/cashflows/calculate`,
      payload
    );
  }
}
