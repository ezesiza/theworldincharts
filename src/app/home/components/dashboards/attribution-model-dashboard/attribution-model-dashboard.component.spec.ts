import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributionModelDashboardComponent } from './attribution-model-dashboard.component';

describe('AttributionModelDashboardComponent', () => {
  let component: AttributionModelDashboardComponent;
  let fixture: ComponentFixture<AttributionModelDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributionModelDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttributionModelDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
