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

    // Limpa antes de gerar novos
    this._teams.set([]);

    // Score para balancear
    const scoreMap = {
      'Estático': 1,
      'Normal': 2,
      'Intenso': 3,
    };

    const scoredPlayers = players.map(player => {
      const score =
        player.qualidade * 3 +
        player.velocidade * 2 +
        player.fase * 2 +
        scoreMap[player.movimentacao];
      return { ...player, score };
    });

    // Ordenar por score DESC
    scoredPlayers.sort((a, b) => b.score - a.score);

    // Inicializar times
    const teams: Team[] = Array.from({ length: totalTeams }, (_, i) => ({
      name: `Time ${i + 1}`,
      players: [],
      overall: 0
    }));

    // Round-robin: distribuir de forma alternada entre os times
    scoredPlayers.forEach((player, index) => {
      const teamIndex = index % totalTeams;
      teams[teamIndex].players.push(player);
    });

    // Calcular média de rating (overall)
    teams.forEach(team => {
      const totalRating = team.players.reduce((acc, p) => acc + p.rating, 0);
      team.overall = Math.round(totalRating / team.players.length);
    });

    this._teams.set(teams);
  }
}
