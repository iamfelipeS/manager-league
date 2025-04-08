import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeaguesService } from '../../services/leagues.service';
import { PlayerService } from '../../services/player.service';
import { TeamService, Team } from '../../services/team.service';
import { Player } from '../../models/player.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../../services/rating.service';
import { ToasterService } from '../../services/toaster.service';
import { Leagues } from '../../models/leagues.model';

@Component({
  selector: 'app-league-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './league-details.component.html',
  styleUrl: './league-details.component.scss'
})
export class LeagueDetailsComponent implements OnInit {
  leagueName: string = '';
  league: Leagues | null = null;
  imagemPadrao = '';
  isAdmin = true;
  isFollowing = false;
  activeTab: string = 'info';
  selectedTeamCount = 2;

  sortBy: 'name' | 'rating' | 'qualidade' | 'velocidade' | 'fase' = 'name';

  playerList: Player[] = [];
  generatedTeams: Team[] = [];

  private route = inject(ActivatedRoute);
  private playerService = inject(PlayerService);
  private teamService = inject(TeamService);
  private ratingService = inject(RatingService);
  private leaguesService = inject(LeaguesService);
  private toasterService = inject(ToasterService);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.leagueName = params['name'];
      this.loadLeagueDetails();
    });

    this.checkIfUserIsAdmin();

    this.playerList = this.playerService.getPlayers();

    // Exemplo: filtrar por liga
    // this.playerList = this.playerService.getPlayers().filter(p => p.leagueId === this.leagueName);
  }

  loadLeagueDetails() {
    this.leaguesService.getLeagueByName(this.leagueName).subscribe({
      next: (league) => {
        this.league = league;
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes da liga', err);
      }
    });

    // Simulado
    this.league = {
      name: this.leagueName,
      img: '',
      private: true,
      organizer: [
        { name: 'Organizador 1', email: 'contato@organizador.com' }
      ]
    };
  }

  generateTeams() {
    const selectedPlayers = this.playerList.filter(p => p.selected);

    if (selectedPlayers.length < 2) {
      this.toasterService.warning('Selecione pelo menos dois jogadores para gerar os times.');
      return;
    }

    this.teamService.generateTeams(selectedPlayers, this.selectedTeamCount);
    this.generatedTeams = this.teamService.teams(); // sempre atualiza a exibição
  }

  get sortedPlayers(): Player[] {
    return [...this.playerList].sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (this.sortBy === 'rating') {
        return this.getRating(b) - this.getRating(a);
      }
      return (b[this.sortBy] ?? 0) - (a[this.sortBy] ?? 0);
    });
  }

  getRating(player: Player): number {
    return this.ratingService.calculate(player);
  }

  togglePlayerSelection(player: Player) {
    player.selected = !player.selected;
  }

  setAutoTeamCount() {
    const selected = this.playerList.filter(p => p.selected);
    const totalPlayers = selected.length;
    const possibleTeams = Math.floor(totalPlayers / 6);
    this.selectedTeamCount = Math.max(possibleTeams, 2);
  }

  followLeague() {
    this.isFollowing = !this.isFollowing;
  }

  checkIfUserIsAdmin() {
    this.isAdmin = Math.random() > 0.5;
  }
}
