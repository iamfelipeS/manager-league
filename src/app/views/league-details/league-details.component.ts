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
  private leaguesService = inject(LeaguesService);
  private toaster = inject(ToasterService);

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
    return [...this.players()].sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (this.sortBy === 'rating') {
        return this.getRating(b) - this.getRating(a);
      }
      return (b[this.sortBy] ?? 0) - (a[this.sortBy] ?? 0);
    });
  }

  generateTeams() {
    const selectedPlayers = this.sortedPlayers.filter(p => p.selected);
    // Cria os times vazios
    this.generatedTeams = Array.from({ length: this.selectedTeamCount }, (_, i) => ({
      name: `Time ${i + 1}`,
      players: [],
      overall: 0,
    }));

    // Agrupa jogadores por flag (ou "no-flag")
    const groupedByFlag: Record<string, Player[]> = {};

    for (const player of selectedPlayers) {
      const flag = player.flags?.[0];
      const key = flag ? flag.name : 'no-flag';

      if (!groupedByFlag[key]) groupedByFlag[key] = [];
      groupedByFlag[key].push(player);
    }

    // Distribui os grupos de flag entre os times
    for (const [flag, players] of Object.entries(groupedByFlag)) {
      const allowRepeat = flag === 'Café com Leite';
      const shuffled = players.sort(() => Math.random() - 0.5);

      let teamIndex = 0;

      for (const player of shuffled) {
        let assigned = false;

        if (allowRepeat) {
          // Rotaciona livremente
          this.generatedTeams[teamIndex].players.push(player);
          teamIndex = (teamIndex + 1) % this.generatedTeams.length;
          continue;
        }

        // Para os demais grupos, evitar duplicar no mesmo time
        for (let i = 0; i < this.generatedTeams.length; i++) {
          const currentTeam = this.generatedTeams[(teamIndex + i) % this.generatedTeams.length];

          const alreadyHasFlag = currentTeam.players.some(p =>
            p.flags?.[0]?.id === player.flags?.[0]?.id
          );

          if (!alreadyHasFlag) {
            currentTeam.players.push(player);
            teamIndex = (teamIndex + 1) % this.generatedTeams.length;
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          // Se todos os times já têm essa flag, joga no time com menos jogadores
          const smallest = this.generatedTeams.reduce((a, b) =>
            a.players.length <= b.players.length ? a : b
          );
          smallest.players.push(player);
        }
      }
    }


    this.recalculateTeamAverages();
  }

  recalculateTeamAverages() {
    for (const team of this.generatedTeams) {
      team.overall = Math.round(
        team.players.reduce((sum, p) => sum + this.getRating(p), 0) /
        (team.players.length || 1)
      );
    }
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

  getPositionColor(posicao: string): string {
    switch (posicao) {
      case 'G': return 'bg-blue-700';    // Goleiro
      case 'D': return 'bg-red-700';     // Defensor
      case 'M': return 'bg-yellow-600';  // Meio Campo
      case 'A': return 'bg-green-700';   // Atacante
      default: return 'bg-gray-400';
    }
  }

  getRatingColor(rating: number): string {
    if (rating <= 55) return 'bg-yellow-900';
    if (rating <= 69) return 'bg-yellow-400';
    if (rating <= 85) return 'bg-lime-500';
    return 'bg-green-700';
  }

}
