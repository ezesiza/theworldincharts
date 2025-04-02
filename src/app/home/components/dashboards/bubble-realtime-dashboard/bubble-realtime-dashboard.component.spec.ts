import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleRealtimeDashboardComponent } from './bubble-realtime-dashboard.component';

describe('BubbleRealtimeDashboardComponent', () => {
  let component: BubbleRealtimeDashboardComponent;
  let fixture: ComponentFixture<BubbleRealtimeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BubbleRealtimeDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BubbleRealtimeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
