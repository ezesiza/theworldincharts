import { createAction, props } from '@ngrx/store';

export const loadCountries = createAction('[Voronoi] Load Countries');
export const loadCountriesSuccess = createAction(
    '[Voronoi] Load Countries Success',
    props<{ countries: any[] }>()
);
export const loadCountriesFailure = createAction(
    '[Voronoi] Load Countries Failure',
    props<{ error: string }>()
);

export const loadCompanies = createAction('[Voronoi] Load Companies');
export const loadCompaniesSuccess = createAction(
    '[Voronoi] Load Companies Success',
    props<{ companies: any[] }>()
);
export const loadCompaniesFailure = createAction(
    '[Voronoi] Load Companies Failure',
    props<{ error: string }>()
);

export const setCountrySelected = createAction(
    '[Voronoi] Set Country Selected',
    props<{ data: any }>()
);