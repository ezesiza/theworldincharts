import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MarketCapitalizationComponent } from './market-capitalization.component';

describe('MarketCapitalizationComponent', () => {
  let component: MarketCapitalizationComponent;
  let fixture: ComponentFixture<MarketCapitalizationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MarketCapitalizationComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketCapitalizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct data', () => {
    expect(component.totalCompanies).toBeGreaterThan(0);
  });

  it('should update stats correctly', () => {
    component.updateStats();
    expect(component.totalValue).toContain('$');
    expect(component.largestCompany).toBeTruthy();
  });
});