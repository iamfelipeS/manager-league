import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../models/player.model';

@Component({
  selector: 'app-field-lineup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-lineup.component.html',
  styleUrl: './field-lineup.component.scss'
})
export class FieldLineupComponent {
  @Input({ required: true }) teamName!: string;
  @Input({ required: true }) players!: Player[];

  groupByPosition = computed(() => {
    return {
      G: this.players.filter(p => p.posicao === 'G'),
      D: this.players.filter(p => p.posicao === 'D'),
      M: this.players.filter(p => p.posicao === 'M'),
      A: this.players.filter(p => p.posicao === 'A'),
    };
  });
}
