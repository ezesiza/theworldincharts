import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdMarketShareDashboardComponent } from './ad-market-share-dashboard.component';

describe('AdMarketShareDashboardComponent', () => {
  let component: AdMarketShareDashboardComponent;
  let fixture: ComponentFixture<AdMarketShareDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdMarketShareDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdMarketShareDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
