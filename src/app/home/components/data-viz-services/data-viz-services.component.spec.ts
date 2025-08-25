import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataVizServicesComponent } from './data-viz-services.component';

describe('DataVizServicesComponent', () => {
  let component: DataVizServicesComponent;
  let fixture: ComponentFixture<DataVizServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataVizServicesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataVizServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
