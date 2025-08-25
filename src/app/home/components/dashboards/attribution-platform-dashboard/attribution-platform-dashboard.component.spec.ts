import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributionPlatformDashboardComponent } from './attribution-platform-dashboard.component';

describe('AttributionPlatformDashboardComponent', () => {
  let component: AttributionPlatformDashboardComponent;
  let fixture: ComponentFixture<AttributionPlatformDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributionPlatformDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttributionPlatformDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
