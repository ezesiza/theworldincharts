import { FilterActions, FilterActionTypes } from "../actions/filter.actions";

export interface CompanyState {
    companyData: [];
    filteredCompanyData: [];
    currentQuery: any;
    error: any;
}


export const initialState: CompanyState = {
    companyData: [],
    filteredCompanyData: [],
    currentQuery: 'Country',
    error: ''
}

export function companyReducer(state = initialState, action: FilterActions): CompanyState {
    switch (action.type) {
        case FilterActionTypes.SetCurrentQuery:

            return { ...state, currentQuery: action.currentQuery }
        case FilterActionTypes.CompanyLoadFailed:
            return { ...state, error: action.error };
        case FilterActionTypes.CompanyLoadSuccess:
            let refined = action.companyData.data.length <= 0 ? [] : action.companyData;
            return { ...state, companyData: refined };
        case FilterActionTypes.FilterByCompany:
            return state;
        case FilterActionTypes.FilterByCountry:
            return state;
        case FilterActionTypes.GetAllData:
            return state;
    }
}