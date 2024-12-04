import { ActionReducerMap, createFeatureSelector, createSelector } from "@ngrx/store";
import { companyReducer, CompanyState } from "./company.filter.reducer";

export interface State {
    companyData: CompanyState,
}

export const reducers: ActionReducerMap<State, any> = {
    companyData: companyReducer,
}

const getCompanyFeatureState = createFeatureSelector<CompanyState>('companyData');

export const getCurrentQuery = createSelector(getCompanyFeatureState, state => {
    return (state && state.currentQuery !== undefined) ? state.currentQuery : "Country"
});


export const companyDataSelector = createSelector(getCompanyFeatureState, state => {
    // console.log(state);
    return state.companyData
});
