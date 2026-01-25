import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopAdsShareComponent } from './top-ads-share.component';

describe('TopAdsShareComponent', () => {
  let component: TopAdsShareComponent;
  let fixture: ComponentFixture<TopAdsShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopAdsShareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TopAdsShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
