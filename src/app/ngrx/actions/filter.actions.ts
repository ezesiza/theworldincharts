import { Action } from '@ngrx/store';
// import { Post } from '../models/post.model';

export enum FilterActionTypes {
    GetAllData = 'Get All Data',
    FilterByCountry = 'Filter By Country',
    FilterByCompany = 'Filter By Company',
    CompanyLoadSuccess = 'Company Load Success',
    CompanyLoadFailed = 'Company Load Failed',
    SetCurrentQuery = 'Set Current Query',
}

export class GetAllData implements Action {
    readonly type = FilterActionTypes.GetAllData;
    constructor() { }
}

export class FilterByCompany implements Action {
    readonly type = FilterActionTypes.FilterByCompany;
    constructor(public companyQuery: string) { }
}
export class FilterByCountry implements Action {
    readonly type = FilterActionTypes.FilterByCountry;
    constructor(public countryQuery: string) { }
}

export class SetCurrentQuery implements Action {
    readonly type = FilterActionTypes.SetCurrentQuery;
    constructor(public currentQuery: any) { }
}

export class CompanyLoadSuccess implements Action {
    readonly type = FilterActionTypes.CompanyLoadSuccess;
    constructor(public companyData: any) { }
}
export class CompanyLoadFailed implements Action {
    readonly type = FilterActionTypes.CompanyLoadFailed;
    constructor(public error: any) { }
}

export type FilterActions = GetAllData | FilterByCompany | FilterByCountry | CompanyLoadSuccess | CompanyLoadFailed | SetCurrentQuery;