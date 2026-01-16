import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdSupplyMarketComponent } from './ad-supply-market.component';

describe('AdSupplyMarketComponent', () => {
  let component: AdSupplyMarketComponent;
  let fixture: ComponentFixture<AdSupplyMarketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdSupplyMarketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdSupplyMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
