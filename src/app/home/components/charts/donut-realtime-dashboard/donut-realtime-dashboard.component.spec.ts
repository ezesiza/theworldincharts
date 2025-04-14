import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonutRealtimeDashboardComponent } from './donut-realtime-dashboard.component';

describe('DonutRealtimeDashboardComponent', () => {
  let component: DonutRealtimeDashboardComponent;
  let fixture: ComponentFixture<DonutRealtimeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonutRealtimeDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DonutRealtimeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
