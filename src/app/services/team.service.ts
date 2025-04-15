import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';
import { RatingService } from './rating.service';
import { Team } from '../models/team.model'; // ✅ import correto do model

@Injectable({ providedIn: 'root' })
export class TeamService {
  private teamsList: Team[] = [];

  constructor(private ratingService: RatingService) {}

  generateTeams(players: Player[], teamCount: number) {
    // Ordena os jogadores do maior para o menor rating
    const sorted = [...players].sort(
      (a, b) => this.ratingService.calculate(b) - this.ratingService.calculate(a)
    );

    // Inicializa os times
    const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
      name: `Time ${i + 1}`,
      players: [],
      overall: 0,
      averageRating: 0 // ✅ incluímos se estiver no model
    }));

    // Distribuição round-robin
    sorted.forEach((player, i) => {
      const teamIndex = i % teamCount;
      teams[teamIndex].players.push(player);
    });

    // Calcula média de ratings
    for (const team of teams) {
      const total = team.players.reduce(
        (sum, p) => sum + this.ratingService.calculate(p), 0
      );

      const media = team.players.length ? total / team.players.length : 0;

      team.overall = Math.round(media);
      team.averageRating = parseFloat(media.toFixed(2)); // ✅ detalhamento opcional
    }

    this.teamsList = teams;
  }

  teams(): Team[] {
    return this.teamsList;
  }
}
