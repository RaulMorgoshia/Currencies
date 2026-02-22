import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NbgCurrenciesApiResponse } from '../models/nbg-currency.models';

@Injectable({ providedIn: 'root' })
export class NbgCurrenciesService {
  private readonly baseUrl =
    'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/';

  constructor(private http: HttpClient) {}

  getCurrencies(date: string): Observable<NbgCurrenciesApiResponse> {
    // date ფორმატი: "YYYY-MM-DD"
    const params = new HttpParams().set('date', date);
    return this.http.get<NbgCurrenciesApiResponse>(this.baseUrl, { params });
  }
}