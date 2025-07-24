import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedAreaComponent } from './animated-area.component';

describe('AnimatedAreaComponent', () => {
  let component: AnimatedAreaComponent;
  let fixture: ComponentFixture<AnimatedAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnimatedAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
