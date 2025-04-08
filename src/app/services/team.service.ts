import { Injectable, signal } from '@angular/core';
import { Player } from '../models/player.model';

export interface Team {
  name: string;
  players: Player[];
  overall: number;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private _teams = signal<Team[]>([]);

  teams() {
    return this._teams();
  }

  generateTeams(players: Player[], totalTeams: number) {
    if (!players.length || totalTeams < 2) return;
  
    // Zera os times sempre
    this._teams.set([]);
  
    const movimentacaoScore = {
      'Estático': 1,
      'Normal': 2,
      'Intenso': 3,
    };
  
    // Score auxiliar
    const scored = players.map(p => ({
      ...p,
      _score:
        p.qualidade * 3 +
        p.velocidade * 2 +
        p.fase * 2 +
        movimentacaoScore[p.movimentacao],
    }));
  
    // Ordena por score
    scored.sort(() => Math.random() - 0.5); // embaralha pra gerar novo resultado a cada vez
  
    // Inicializa os times
    const teams: Team[] = Array.from({ length: totalTeams }, (_, i) => ({
      name: `Time ${i + 1}`,
      players: [],
      overall: 0,
    }));
  
    // Balanceia por quantidade, sempre colocando no time com MENOS jogadores
    scored.forEach(player => {
      const teamWithLeastPlayers = teams.reduce((prev, current) =>
        prev.players.length <= current.players.length ? prev : current
      );
      teamWithLeastPlayers.players.push(player);
    });
  
    // Recalcula média de rating
    teams.forEach(team => {
      const total = team.players.reduce((acc, p) => acc + p.rating, 0);
      team.overall = Math.round(total / team.players.length);
    });
  
    this._teams.set([...teams]); // força mudança e update
  }
  
  
}
