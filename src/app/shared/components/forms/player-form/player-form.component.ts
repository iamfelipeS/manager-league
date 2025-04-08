import { Component } from '@angular/core';
import { Player } from '../../../../models/player.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-form.component.html',
  styleUrl: './player-form.component.scss'
})
export class PlayerFormComponent {
  player: Omit<Player, 'id' | 'rating'> = {
    name: '',
    qualidade: 0,
    velocidade: 0,
    fase: 0,
    movimentacao: 'Normal',
  };

  attributes = [
    { key: 'qualidade', label: 'Qualidade' },
    { key: 'velocidade', label: 'Velocidade' },
    { key: 'fase', label: 'Fase' },
  ];

  increment(key: keyof typeof this.player) {
    if (typeof this.player[key] === 'number') this.player[key]++;
  }

  decrement(key: keyof typeof this.player) {
    if (typeof this.player[key] === 'number' && this.player[key] > 0) this.player[key]--;
  }

  onSubmit() {
    // Chamar o service para adicionar ou editar
  }
}
