import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedBubbleComponent } from './animated-bubble.component';

describe('AnimatedBubbleComponent', () => {
  let component: AnimatedBubbleComponent;
  let fixture: ComponentFixture<AnimatedBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedBubbleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnimatedBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
