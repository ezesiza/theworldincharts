// attack-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttackDataService {
  private attackDataUrl = 'assets/datasets/enterprise-attack-13.1.json'; // Or use your API endpoint

  constructor(private http: HttpClient) { }

  getAttackData(): Observable<any> {
    return this.http.get<any>(this.attackDataUrl);
  }
}