import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { catchError, map, mergeMap, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import * as VoronoiActions from '../actions/voronoi.actions';

@Injectable()
export class VoronoiEffects {

    private readonly csvData$ = this.http
        .get('assets/datasets/companies_capitalization.csv', { responseType: 'text' })
        .pipe(shareReplay(1));

    loadCountries$ = createEffect(() =>
        this.actions$.pipe(
            ofType(VoronoiActions.loadCountries),
            mergeMap(() =>
                this.csvData$.pipe(
                    map(data => {
                        const countriesArray: any[] = [];
                        let csvToRowArray = data.split("\n");
                        let headers = csvToRowArray[0].split(',');

                        for (let index = 1; index < csvToRowArray.length - 1; index++) {
                            let row = csvToRowArray[index].split(",");
                            let obj: any = {};
                            for (let j in headers) {
                                if (row[j].includes(", ")) {
                                    obj[headers[j]] = row[j].split(", ").map(item => item.trim())
                                } else {
                                    obj[headers[j]] = row[j]
                                }
                            }
                            countriesArray.push(obj);
                        }
                        return VoronoiActions.loadCountriesSuccess({ countries: countriesArray });
                    }),
                    catchError(error => of(VoronoiActions.loadCountriesFailure({ error: error.message })))
                )
            )
        )
    );

    loadCompanies$ = createEffect(() =>
        this.actions$.pipe(
            ofType(VoronoiActions.loadCompanies),
            mergeMap(() =>
                this.csvData$.pipe(
                    map(data => {
                        let marketArray: any[] = [];
                        let csvToRowArray = data.split("\n");
                        for (let index = 1; index < csvToRowArray.length - 1; index++) {
                            let row = csvToRowArray[index].split(",");
                            marketArray.push({
                                Rank: row[0],
                                Company: row[1],
                                Symbol: row[2].trim(),
                                Capital: Number(row[3]).toLocaleString(),
                                SharePrice: Number(row[4]),
                                Country: row[5].replace(/(\r\n|\n|\r)/gm, ""),
                            });
                        }
                        const filteredArray = marketArray.filter((item: any) =>
                            ["Germany", "Belgium", "Spain", "Turkey", "Russia", "Argentina", "Brazil", "Ireland", "Poland", "Italy", "Greece", "Czech Republic"].includes(item.Country)
                        );
                        return VoronoiActions.loadCompaniesSuccess({ companies: filteredArray });
                    }),
                    catchError(error => of(VoronoiActions.loadCompaniesFailure({ error: error.message })))
                )
            )
        )
    );

    constructor(
        private actions$: Actions,
        private http: HttpClient
    ) { }
}