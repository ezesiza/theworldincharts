import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivergingBarsComponent } from './diverging-bars.component';

describe('DiverginBarsComponent', () => {
  let component: DivergingBarsComponent;
  let fixture: ComponentFixture<DivergingBarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DivergingBarsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DivergingBarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
