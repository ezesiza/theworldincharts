import { createReducer, on } from '@ngrx/store';
import * as VoronoiActions from '../actions/voronoi.actions';
import { initialVoronoiState, VoronoiState } from '../store/voronoi.types';

export const voronoiReducer = createReducer(
    initialVoronoiState,
    on(VoronoiActions.loadCountries, (state) => ({
        ...state,
        loading: true
    })),
    on(VoronoiActions.loadCountriesSuccess, (state, { countries }) => ({
        ...state,
        loading: false,
        countries,
        error: null as string | null
    })),
    on(VoronoiActions.loadCountriesFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
    on(VoronoiActions.loadCompanies, (state) => ({
        ...state,
        loading: true
    })),
    on(VoronoiActions.loadCompaniesSuccess, (state, { companies }) => ({
        ...state,
        loading: false,
        companies,
        error: null as string | null
    })),
    on(VoronoiActions.loadCompaniesFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
    on(VoronoiActions.setCountrySelected, (state, { data }) => ({
        ...state,
        countrySelected: data
    }))
);