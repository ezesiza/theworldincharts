import { OnDestroy, Component } from '@angular/core';
import { Subject } from 'rxjs';


@Component({
  template: ''
})
export abstract class UnsubscribeOnDestroy implements OnDestroy {
    protected d$: Subject<any>;

    constructor() {
      this.d$ = new Subject<void>();

      const f = this.ngOnDestroy.bind(this);

      this.ngOnDestroy = () => {
        f();
        this.d$.next(true);
        this.d$.complete();
      };
    }

    ngOnDestroy() {
      // will be overridden
    }
}
