import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedditDataDashboardComponent } from './reddit-data-dashboard.component';

describe('RedditDataDashboardComponent', () => {
  let component: RedditDataDashboardComponent;
  let fixture: ComponentFixture<RedditDataDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedditDataDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RedditDataDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
