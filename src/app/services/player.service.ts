import { inject, Injectable } from '@angular/core';
import { Player } from '../models/player.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PLAYERS } from '../shared/data/mock-players';
import { v4 as uuidv4 } from 'uuid'; // ajuste necessário!

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private playersSubject = new BehaviorSubject<Player[]>(PLAYERS);
  players$ = this.playersSubject.asObservable();

  getPlayers(): Observable<Player[]> {
    return of(PLAYERS);
  }

  addPlayer(playerData: Omit<Player, 'id' | 'rating'>): void {
    const rating = this.calculateRating(playerData);
    const newPlayer: Player = {
      ...playerData,
      id: uuidv4(),
      rating,
    };
  
    const updatedPlayers = [...this.playersSubject.value, newPlayer];
    this.playersSubject.next(updatedPlayers);
  }

  private calculateRating(player: Omit<Player, 'id' | 'rating'>): number {
    const base =
      player.qualidade * 0.35 +
      player.velocidade * 0.25 +
      player.fase * 0.2;

    // Peso extra para movimentação
    let movimentacaoBonus = 0;
    switch (player.movimentacao) {
      case 'Intenso':
        movimentacaoBonus = 0.2;
        break;
      case 'Normal':
        movimentacaoBonus = 0.1;
        break;
      case 'Estático':
        movimentacaoBonus = 0;
        break;
    }

    const total = base + (10 * movimentacaoBonus);
    return Math.round(total);
  }
}
