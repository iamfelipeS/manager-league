import { Injectable } from '@angular/core';
import { RatingService } from './rating.service';
import { Player } from '../models/player.model';

export interface Team {
  name: string;
  players: Player[];
  overall: number;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private teamsList: Team[] = [];

  constructor(private ratingService: RatingService) {}

  generateTeams(players: Player[], teamCount: number) {
    const sorted = [...players].sort(
      (a, b) => this.ratingService.calculate(b) - this.ratingService.calculate(a)
    );

    const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
      name: `Time ${i + 1}`,
      players: [],
      overall: 0,
    }));

    sorted.forEach((player, i) => {
      teams[i % teamCount].players.push(player);
    });

    teams.forEach((team) => {
      const total = team.players.reduce((sum, p) => sum + this.ratingService.calculate(p), 0);
      team.overall = Math.round(total / team.players.length);
    });

    this.teamsList = teams;
  }

  teams(): Team[] {
    return this.teamsList;
  }
}
