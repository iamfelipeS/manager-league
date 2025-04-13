import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';
import { RatingService } from './rating.service';

export interface Team {
  name: string;
  players: Player[];
  overall: number; // média dos ratings
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private teamsList: Team[] = [];

  constructor(private ratingService: RatingService) {}

  generateTeams(players: Player[], teamCount: number) {
    // Ordena do jogador com maior para o menor rating
    const sorted = [...players].sort(
      (a, b) => this.ratingService.calculate(b) - this.ratingService.calculate(a)
    );

    // Inicializa os times
    const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
      name: `Time ${i + 1}`,
      players: [],
      overall: 0
    }));

    // Distribui de forma round-robin
    sorted.forEach((player, i) => {
      const teamIndex = i % teamCount;
      teams[teamIndex].players.push(player);
    });

    // Calcula a média de rating de cada time
    for (const team of teams) {
      const totalRating = team.players.reduce(
        (sum, p) => sum + this.ratingService.calculate(p),
        0
      );
      team.overall = team.players.length
        ? Math.round(totalRating / team.players.length)
        : 0;
    }

    this.teamsList = teams;
  }

  teams(): Team[] {
    return this.teamsList;
  }
}
