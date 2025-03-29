import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class VoronoiStateService {
    private _companyCountry: string = '';
    private _selectedPolygon: any = null;
    private _showCardOne: boolean = false;

    get companyCountry(): string {
        return this._companyCountry;
    }

    set companyCountry(value: string) {
        this._companyCountry = value;
    }

    get selectedPolygon(): any {
        return this._selectedPolygon;
    }

    set selectedPolygon(value: any) {
        this._selectedPolygon = value;
    }

    get showCardOne(): boolean {
        return this._showCardOne;
    }

    set showCardOne(value: boolean) {
        this._showCardOne = value;
    }

    clearState() {
        this._companyCountry = '';
        this._selectedPolygon = null;
        this._showCardOne = false;
    }
}