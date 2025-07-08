import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly movimentacaoScore = {
    'Estático': 0,
    'Normal': 5,
    'Intenso': 10
  } as const;

  // Novo range baseado nos novos pesos abaixo
  private readonly minScore = 10;   // qualidade=1, velocidade=1, fase=1, movimentacao=Estático
  private readonly maxScore = 99;  // qualidade=10, velocidade=10, fase=10, movimentacao=Intenso

  calculate(player: Player): number {
    const rawScore =
      player.qualidade * 7 +     // peso 3
      player.velocidade * 2 +    // peso 2
      player.fase * 4 +          // peso 3
      this.movimentacaoScore[player.movimentacao]; // peso extra de movimentação

    const normalized = 5 + ((rawScore - this.minScore) / (this.maxScore - this.minScore)) * (99 - 5);

    return Math.round(normalized);
  }
}

