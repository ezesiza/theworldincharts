import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickAnalysisDashboardComponent } from './click-analysis-dashboard.component';

describe('ClickAnalysisDashboardComponent', () => {
  let component: ClickAnalysisDashboardComponent;
  let fixture: ComponentFixture<ClickAnalysisDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClickAnalysisDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClickAnalysisDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
