import { TestBed } from '@angular/core/testing';

import { AttackDataService } from './attack-data.service';

describe('AttackDataService', () => {
  let service: AttackDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttackDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
