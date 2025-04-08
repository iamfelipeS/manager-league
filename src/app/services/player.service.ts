import { Injectable, signal } from '@angular/core';
import { Player } from '../models/player.model';
import { MOCK_PLAYERS } from '../shared/data/mock-players';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private players = signal<Player[]>(MOCK_PLAYERS); // inicia com os mocks

  getPlayers() {
    return this.players();
  }

  add(player: Player) {
    this.players.update((list) => [...list, player]);
  }

  update(updated: Player) {
    this.players.update((list) =>
      list.map(p => p.id === updated.id ? updated : p)
    );
  }

  delete(id: string) {
    this.players.update((list) => list.filter(p => p.id !== id));
  }

  clearAll() {
    this.players.set([]);
  }
}
