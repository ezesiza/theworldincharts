import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatEarthComponent } from './flat-earth.component';

describe('FlatEarthComponent', () => {
  let component: FlatEarthComponent;
  let fixture: ComponentFixture<FlatEarthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlatEarthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlatEarthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
