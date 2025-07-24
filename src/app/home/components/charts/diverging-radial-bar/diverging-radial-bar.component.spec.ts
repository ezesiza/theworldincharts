import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivergingRadialBarComponent } from './diverging-radial-bar.component';

describe('DivergingRadialBarComponent', () => {
  let component: DivergingRadialBarComponent;
  let fixture: ComponentFixture<DivergingRadialBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DivergingRadialBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DivergingRadialBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
