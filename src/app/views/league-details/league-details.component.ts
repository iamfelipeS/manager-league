import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { TeamService, Team } from '../../services/team.service';
import { Player } from '../../models/player.model';
import { RatingService } from '../../services/rating.service';
import { LeaguesService } from '../../services/leagues.service';
import { ToasterService } from '../../services/toaster.service';
import { Leagues } from '../../models/leagues.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-league-details',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './league-details.component.html',
  styleUrl: './league-details.component.scss'
})
export class LeagueDetailsComponent implements OnInit {
  private playerService = inject(PlayerService);
  private ratingService = inject(RatingService);
  private route = inject(ActivatedRoute);
  private teamService = inject(TeamService);
  private leaguesService = inject(LeaguesService);
  private toasterService = inject(ToasterService);

  leagueName: string = '';
  league: Leagues | null = null;
  imagemPadrao = '';
  isAdmin = true;
  isFollowing = false;
  activeTab: string = 'info';
  selectedTeamCount = 2;
  sortBy: 'name' | 'rating' | 'qualidade' | 'velocidade' | 'fase' = 'name';

  players = signal<Player[]>([]);
  isLoading = signal(true);
  generatedTeams: Team[] = [];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.leagueName = params['name'];
      this.loadLeagueDetails();
    });

    this.checkIfUserIsAdmin();
    this.loadPlayers();
  }

  async loadPlayers() {
    this.isLoading.set(true);
    const result = await this.playerService.getPlayers();
    this.players.set(result);
    this.isLoading.set(false);
  }

  loadLeagueDetails() {
    this.leaguesService.getLeagueByName(this.leagueName).subscribe({
      next: (league) => (this.league = league),
      error: (err) => console.error('Erro ao carregar detalhes da liga', err)
    });

    this.league = {
      name: this.leagueName,
      img: '',
      private: true,
      organizer: [
        { name: 'Organizador 1', email: 'contato@organizador.com' }
      ]
    };
  }

  get sortedPlayers(): Player[] {
    this.isLoading.set(true);
    return [...this.players()].sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (this.sortBy === 'rating') {
        return this.getRating(b) - this.getRating(a);
      }
      this.isLoading.set(false);
      return (b[this.sortBy] ?? 0) - (a[this.sortBy] ?? 0);
    });
  }

  generateTeams() {
    const selectedPlayers = this.players().filter(p => p.selected);

    if (selectedPlayers.length < 2) {
      this.toasterService.warning('Selecione pelo menos dois jogadores para gerar os times.');
      return;
    }

    this.teamService.generateTeams(selectedPlayers, this.selectedTeamCount);
    this.generatedTeams = this.teamService.teams();
  }

  togglePlayerSelection(player: Player) {
    player.selected = !player.selected;
  }

  getRating(player: Player): number {
    return this.ratingService.calculate(player);
  }

  setAutoTeamCount() {
    const selected = this.players().filter(p => p.selected);
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
