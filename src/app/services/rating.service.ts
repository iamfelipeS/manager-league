import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly movimentacaoScore = {
    'Estático': 1,
    'Normal': 3,
    'Intenso': 4
  } as const;

  calculate(player: Player): number {
    return (
      player.qualidade * 6 +
      player.velocidade * 3 +
      player.fase * 4 +
      this.movimentacaoScore[player.movimentacao]
    );
  }
}
