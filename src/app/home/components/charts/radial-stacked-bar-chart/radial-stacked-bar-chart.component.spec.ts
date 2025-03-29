import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadialStackedBarChartComponent } from './radial-stacked-bar-chart.component';

describe('RadialStackedBarChartComponent', () => {
  let component: RadialStackedBarChartComponent;
  let fixture: ComponentFixture<RadialStackedBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadialStackedBarChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RadialStackedBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
