import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarrifVisualizationComponent } from './tarrif-visualization.component';

describe('TarrifVisualizationComponent', () => {
  let component: TarrifVisualizationComponent;
  let fixture: ComponentFixture<TarrifVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarrifVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TarrifVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
