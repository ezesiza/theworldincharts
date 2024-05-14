import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PresentationService {

  public windowSize: Observable<any>;
  private largeMatchMedia: MediaQueryList = window.matchMedia('(min-width: 53.8rem)');
  private extendedMatchMedia: MediaQueryList = window.matchMedia('(min-width: 100rem)');
  private windowSize$: BehaviorSubject<any>;

  constructor() {
    this.windowSize$ = new BehaviorSubject(this.getWindowSize());
    this.windowSize = (this.windowSize$ as Observable<any>).pipe(
      distinctUntilChanged()
    );

    fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe((s) => this.onResize());
  }

  isLargePresentation(): boolean {
    return this.largeMatchMedia.matches;
  }

  isExtendedPresentation(): boolean {
    return this.extendedMatchMedia.matches;
  }

  triggerResize() {
    this.onResize();
  }

  onResize() {
    this.windowSize$.next(this.getWindowSize());
  }

  private getWindowSize(): any {
    return {
      height: window.innerHeight,
      width: window.innerWidth
    }
  }
}
