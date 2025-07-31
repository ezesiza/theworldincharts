import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBreachImpactComponent } from './data-breach-impact.component';

describe('DataBreachImpactComponent', () => {
  let component: DataBreachImpactComponent;
  let fixture: ComponentFixture<DataBreachImpactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataBreachImpactComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataBreachImpactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
