import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanolenseComponent } from './panolense.component';

describe('PanolenseComponent', () => {
  let component: PanolenseComponent;
  let fixture: ComponentFixture<PanolenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanolenseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PanolenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
