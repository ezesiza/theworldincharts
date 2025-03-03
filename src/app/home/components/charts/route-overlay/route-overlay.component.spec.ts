import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteOverlayComponent } from './route-overlay.component';

describe('RouteOverlayComponent', () => {
  let component: RouteOverlayComponent;
  let fixture: ComponentFixture<RouteOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RouteOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
