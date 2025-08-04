import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostPricingDashboardComponent } from './cost-pricing-dashboard.component';

describe('CostPricingDashboardComponent', () => {
  let component: CostPricingDashboardComponent;
  let fixture: ComponentFixture<CostPricingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostPricingDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CostPricingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
