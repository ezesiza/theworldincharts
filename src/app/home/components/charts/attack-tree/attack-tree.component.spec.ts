import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttackTreeComponent } from './attack-tree.component';

describe('AttackTreeComponent', () => {
  let component: AttackTreeComponent;
  let fixture: ComponentFixture<AttackTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttackTreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttackTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
