export interface NbgCurrencyItem {
    code: string;
    quantity: number;
    rateFormated: string;
    diffFormated: string;
    rate: number;
    diff: number;
    name: string;
    date: string;
    validFromDate: string
}

export interface NbgCurrenciesDayResponse {
    date: string;
    currencies: NbgCurrencyItem[];
}

export type NbgCurrenciesApiResponse = NbgCurrenciesDayResponse[];