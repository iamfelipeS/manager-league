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
  sortBy: 'name' | 'rating' | 'qualidade' | 'velocidade' | 'posicao' | 'fase' = 'name';

  isLesionado(player: Player): boolean {
    return player.flags?.some(f => f.name.toLowerCase() === 'lesionado') ?? false;
  }
  

  players = signal<Player[]>([]);
  isLoading = signal(true);
  totalPlayers = signal(0);
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

    this.totalPlayers.set(result.length);
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
    const posicaoOrder = ['G', 'D', 'M', 'A'];

    return [...this.players()].sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (this.sortBy === 'rating') {
        return this.getRating(b) - this.getRating(a);
      }
      if (this.sortBy === 'posicao'){
        return posicaoOrder.indexOf(a.posicao) - posicaoOrder.indexOf(b.posicao);
      }
      return (b[this.sortBy] ?? 0) - (a[this.sortBy] ?? 0);
    });
  }

  generateTeams() {
    const selectedPlayers = this.sortedPlayers.filter(p => p.selected);
    const teamCount = this.selectedTeamCount;
    const totalPlayers = selectedPlayers.length;
  
    if (teamCount < 2 || totalPlayers < teamCount) {
      this.toaster.error('Jogadores insuficientes para formar os times');
      return;
    }
  
    const attempts = 100;
    let bestTeams: any[] = [];
    let bestDiff = Infinity;
  
    // Flags que devem ser únicas por time
    const restrictiveFlags = ['cabeça de chave', 'quantidade de zagueiros', 'estrela em formação'];
  
    for (let attempt = 0; attempt < attempts; attempt++) {
      const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
      const baseSize = Math.floor(totalPlayers / teamCount);
      const extras = totalPlayers % teamCount;
  
      const teams: { name: string; players: Player[]; overall: number }[] = Array.from({ length: teamCount }, (_, i) => ({
        name: `Time ${i + 1}`,
        players: [],
        overall: 0,
      }));
  
      const flagMap: Map<number, Set<number>> = new Map(); // flagId -> Set<teamIndex>
  
      let failed = false;
  
      for (const player of shuffled) {
        let placed = false;
  
        for (let t = 0; t < teamCount; t++) {
          const team = teams[t];
          const maxSize = baseSize + (t < extras ? 1 : 0);
  
          if (team.players.length >= maxSize) continue;
  
          const hasRestrictedFlagConflict = player.flags?.some(flag => {
            const isRestrictive = restrictiveFlags.includes(flag.name.toLowerCase());
            return isRestrictive && flagMap.get(flag.id)?.has(t);
          });
  
          if (!hasRestrictedFlagConflict) {
            team.players.push(player);
  
            // Armazena apenas as flags restritivas
            player.flags?.forEach(flag => {
              if (restrictiveFlags.includes(flag.name.toLowerCase())) {
                if (!flagMap.has(flag.id)) flagMap.set(flag.id, new Set());
                flagMap.get(flag.id)!.add(t);
              }
            });
  
            placed = true;
            break;
          }
        }
  
        if (!placed) {
          failed = true;
          break;
        }
      }
  
      if (failed) continue;
  
      for (const team of teams) {
        const total = team.players.reduce((acc, p) => acc + p.rating, 0);
        team.overall = Math.round(total / team.players.length);
      }
  
      const ratings = teams.map(t => t.overall);
      const diff = Math.max(...ratings) - Math.min(...ratings);
  
      if (diff < bestDiff) {
        bestDiff = diff;
        bestTeams = teams.map(t => ({
          name: t.name,
          overall: t.overall,
          players: [...t.players],
        }));
      }
    }
  
    if (bestTeams.length === 0) {
      this.toaster.error('Não foi possível gerar times válidos com as restrições de distribuição.');
    } else {
      this.generatedTeams = bestTeams;
      console.log('[DEBUG] Times gerados:', this.generatedTeams);
    }
  }
  
  recalculateTeamAverages() {
    for (const team of this.generatedTeams) {
      team.overall = Math.round(
        team.players.reduce((sum, p) => sum + this.getRating(p), 0) /
        (team.players.length || 1)
      );
    }
  }

  get availablePlayers(): Player[] {
    return this.sortedPlayers.filter(player => !this.isLesionado(player));
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
