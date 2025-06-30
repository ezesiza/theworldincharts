import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { LoggerService } from './logger.service';
import { LocalStorageKeys } from 'app/models/local-storage.mode';


@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    isDarkModeEnabled = new BehaviorSubject<boolean>(false);
    isDarkModeEnabled$ = this.isDarkModeEnabled.asObservable();

    constructor(
        private logger: LoggerService
    ) {
        const isDarkModeEnabled = this.getDarkModeStorageItem();
        this.isDarkModeEnabled.next(isDarkModeEnabled);
    }

    toggleDarkMode() {
        this.isDarkModeEnabled.next(!this.isDarkModeEnabled.value);
        this.setDarkModeStorageItem(this.isDarkModeEnabled.value);
    }

    private setDarkModeStorageItem(value: boolean) {
        localStorage.setItem(LocalStorageKeys.darkMode, value ? 'true' : 'false');
    }

    private getDarkModeStorageItem(): boolean {
        return localStorage.getItem(LocalStorageKeys.darkMode) == 'true';
    }
}
