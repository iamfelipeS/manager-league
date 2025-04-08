import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly movimentacaoScore = {
    'Estático': 1,
    'Normal': 2,
    'Intenso': 3
  } as const;

  calculate(player: Player): number {
    return (
      player.qualidade * 4 +
      player.velocidade * 2 +
      player.fase * 3 +
      this.movimentacaoScore[player.movimentacao]
    );
  }
}
