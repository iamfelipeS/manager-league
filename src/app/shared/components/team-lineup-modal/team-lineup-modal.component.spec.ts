import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamLineupModalComponent } from './team-lineup-modal.component';

describe('TeamLineupModalComponent', () => {
  let component: TeamLineupModalComponent;
  let fixture: ComponentFixture<TeamLineupModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamLineupModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamLineupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
