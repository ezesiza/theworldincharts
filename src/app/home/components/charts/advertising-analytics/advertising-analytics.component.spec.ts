import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingAnalyticsComponent } from './advertising-analytics.component';

describe('AdvertisingAnalyticsComponent', () => {
  let component: AdvertisingAnalyticsComponent;
  let fixture: ComponentFixture<AdvertisingAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertisingAnalyticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdvertisingAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
