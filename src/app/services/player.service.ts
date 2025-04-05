import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  private weights = {
    quality: { Baixa: 3, Normal: 5, Alta: 8 },
    speed: { Lento: 3, Normal: 5, Rápido: 7 },
    movement: { Estático: 3, Normal: 5, Intenso: 7 },
    phase: { Ruim: 3, Normal: 5, Boa: 8 }
  };

  // calculateRating(player: Player): number {
  //   const qualityWeight = this.weights.quality[player.quality as keyof typeof this.weights.quality];
  //   const speedWeight = this.weights.speed[player.speed as keyof typeof this.weights.speed];
  //   const movementWeight = this.weights.movement[player.movement as keyof typeof this.weights.movement];
  //   const phaseWeight = this.weights.phase[player.phase as keyof typeof this.weights.phase];
  
  //   const average = (qualityWeight + speedWeight + movementWeight + phaseWeight) / 4;
  //   return Math.round(average * 11); // Normalizando para um valor entre 40-99
  // }
  
}
