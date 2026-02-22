import { Component, ChangeDetectionStrategy, AfterViewInit, Inject, PLATFORM_ID, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import flatpickr from 'flatpickr';
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { NbgCurrenciesDayResponse, NbgCurrencyItem } from '../../models/nbg-currency.models';
import { NbgCurrenciesService } from '../../services/nbg-currencies.service';

type Vm =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; day: NbgCurrenciesDayResponse; list: NbgCurrencyItem[] };

@Component({
  selector: 'app-nbg-currencies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// ...imports იგივე დატოვე

export class HomeComponent implements AfterViewInit, OnDestroy {
  date = this.todayLocal(); // YYYY-MM-DD
  private date$ = new BehaviorSubject<string>(this.date);
  @ViewChild('dateEl') dateEl?: ElementRef<HTMLInputElement>;




  private fp?: flatpickr.Instance;
  vm$: Observable<Vm> = this.date$.pipe(
    distinctUntilChanged(),
    switchMap((date) =>
      this.svc.getCurrencies(date).pipe(
        map((resp) => {
          const day = resp?.[0];
          if (!day) return { state: 'error', message: 'ცარიელი პასუხი API-დან' } as Vm;

          const list = [...(day.currencies ?? [])].sort((a, b) =>
            a.code.localeCompare(b.code)
          );

          return { state: 'ready', day, list } as Vm;
        }),
        startWith({ state: 'loading' } as Vm),
        catchError((err) => {
          const msg =
            err?.error?.message ??
            err?.message ??
            err?.statusText ??
            'მოთხოვნა ვერ შესრულდა';
          return of({ state: 'error', message: msg } as Vm);
        })
      )
    )
  );

  constructor(private svc: NbgCurrenciesService,
    @Inject(PLATFORM_ID) private platformId: object) { }



  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    console.log('✅ HomeComponent is running in BROWSER');

    if (!this.dateEl?.nativeElement) return;

    this.fp = flatpickr(this.dateEl.nativeElement, {
      dateFormat: 'Y-m-d',
      defaultDate: this.date,
      allowInput: true,
      onChange: (_, dateStr) => this.onDateChange(dateStr),
    });
  }

  ngOnDestroy(): void {
    this.fp?.destroy();
  }

  onDateChange(value: string) {
    console.log('RAW from input:', value);
    const ymd = this.toYmd(value);
    console.log('YMD used:', ymd);

    this.date = ymd;
    this.date$.next(ymd);
  }

  clearDate() { this.onDateChange(this.todayLocal()); if (this.fp) this.fp.setDate(this.date, true); }

  dbg(...args: any[]) {
    console.log('[DATE DBG]', ...args);
  }

  private toYmd(value: string): string {
    // უკვე სწორ ფორმატშია?
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    // ISO ფორმატი "YYYY-MM-DDT..."
    if (value?.includes('T')) {
      const part = value.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
    }

    // fallback: Date parsing
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return this.todayLocal();

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private todayLocal(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}