import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldLineupComponent } from '../field-lineup/field-lineup.component';
import { Team } from '../../../models/team.model';

@Component({
  selector: 'app-team-lineup-modal',
  standalone: true,
  imports: [CommonModule, FieldLineupComponent],
  templateUrl: './team-lineup-modal.component.html',
  styleUrl: './team-lineup-modal.component.scss'
})
export class TeamLineupModalComponent {
  @Input() teams: Team[] = []; 
  @Input() visible = signal(false);

  close() {
    this.visible.set(false);
  }
}
