import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomatedRevenueManagementComponent } from './automated-revenue-management.component';

describe('AutomatedRevenueManagementComponent', () => {
  let component: AutomatedRevenueManagementComponent;
  let fixture: ComponentFixture<AutomatedRevenueManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomatedRevenueManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AutomatedRevenueManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
