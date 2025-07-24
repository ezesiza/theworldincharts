import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpyderComponent } from './spyder.component';

describe('SpyderComponent', () => {
  let component: SpyderComponent;
  let fixture: ComponentFixture<SpyderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpyderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpyderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
