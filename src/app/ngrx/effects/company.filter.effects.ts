import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { VoronoiService } from "app/home/services/voronoi.service";
import { Observable, of } from "rxjs";
import { catchError, map, mergeMap } from 'rxjs/operators';
import { CompanyLoadFailed, CompanyLoadSuccess, FilterActionTypes } from "../actions/filter.actions";

@Injectable()
export class CompanyFilterEffects {
    constructor(
        private actions$: Actions,
        private voronoService: VoronoiService
    ) { }

    filterByCompanyData$: Observable<Action> = createEffect(() => {
        return this.actions$.pipe(
            ofType(FilterActionTypes.GetAllData),
            mergeMap((k: any) => {
                return this.voronoService.getNestedCompanyData(k.currentQuery).pipe(
                    map((res: any) => {
                        return new CompanyLoadSuccess(res)
                    }),
                    catchError((err) => of(new CompanyLoadFailed(err)))
                )
            })
        )
    })
}