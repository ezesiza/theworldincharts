import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalDiverginBarComponent } from './horizontal-diverging-bar.component';

describe('HorizontalDiverginBarComponent', () => {
  let component: HorizontalDiverginBarComponent;
  let fixture: ComponentFixture<HorizontalDiverginBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalDiverginBarComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HorizontalDiverginBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
