import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { RatingService } from '../../services/rating.service';
import { LeaguesService } from '../../services/leagues.service';
import { ToasterService } from '../../services/toaster.service';
import { Leagues } from '../../models/leagues.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { TeamLineupModalComponent } from '../../shared/components/team-lineup-modal/team-lineup-modal.component';
import { Team } from '../../models/team.model';

@Component({
  selector: 'app-league-details',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, TeamLineupModalComponent],
  templateUrl: './league-details.component.html',
  styleUrl: './league-details.component.scss'
})
export class LeagueDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private toaster = inject(ToasterService);
  private playerService = inject(PlayerService);
  private ratingService = inject(RatingService);
  private leaguesService = inject(LeaguesService);

  imagemPadrao = '';
  leagueName: string = '';

  isAdmin = true;
  isFollowing = false;
  league: Leagues | null = null;
  allPlayersSelected: boolean = false;

  activeTab: string = 'info';
  selectedTeamCount = 2;
  sortBy: 'name' | 'rating' | 'qualidade' | 'velocidade' | 'posicao' | 'fase' = 'name';

  isLesionado(player: Player): boolean {
    return player.flags?.some(f => f.name.toLowerCase() === 'lesionado') ?? false;
  }

  players = signal<Player[]>([]);
  isLoading = signal(true);
  totalPlayers = signal(0);
  teamModalVisible = signal(false);

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
  
    result.forEach(player => {
      if (player.posicao === 'D') {
        const jaTemFlag = player.flags?.some(f => f.id === 999);
        if (!jaTemFlag) {
          player.flags = player.flags || [];
          player.flags.push({
            id: 999,
            name: 'quantidade de zagueiros',
            affectsTeamGeneration: true
          });
        }
      }
    });
  
    this.players.set(result);
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
      if (this.sortBy === 'posicao') {
        return posicaoOrder.indexOf(a.posicao) - posicaoOrder.indexOf(b.posicao);
      }
      return (b[this.sortBy] ?? 0) - (a[this.sortBy] ?? 0);
    });
  }

  //METODO SNAKE
  // generateTeams() {
  //   const selectedPlayers = this.sortedPlayers.filter(p => p.selected);
  //   const teamCount = this.selectedTeamCount;
  //   const totalPlayers = selectedPlayers.length;

  //   if (teamCount < 2 || totalPlayers < teamCount) {
  //     this.toaster.error('Selecione ao menos 2 times e jogadores suficientes.');
  //     return;
  //   }

  //   const normalize = (str: string) =>
  //     str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  // const playersByFlag: { [flagId: number]: Player[] } = {};

  // for (const player of selectedPlayers) {
  //   for (const flag of player.flags || []) {
  //     if (flag.usarNaGeracao) {
  //       if (!playersByFlag[flag.id]) playersByFlag[flag.id] = [];
  //       playersByFlag[flag.id].push(player);
  //     }
  //   }
  // }


  //   const hasEnoughForRestrictions = selectedPlayers.length >= teamCount;
  //   if (!hasEnoughForRestrictions) {
  //     this.toaster.error('Número de jogadores insuficiente para respeitar as restrições de flags.');
  //     return;
  //   }

  //   const attempts = 500;
  //   let bestTeams: any[] = [];
  //   let bestDiff = Infinity;

  //   const distribution = this.calculateTeamDistribution(totalPlayers, teamCount);
  //   console.log('[DEBUG] Distribuição ideal:', distribution);

  //   let lastFailReason = '';

  //   for (let attempt = 0; attempt < attempts; attempt++) {
  //     const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);

  //     const teams: { name: string; players: Player[]; overall: number }[] = Array.from(
  //       { length: teamCount },
  //       (_, i) => ({
  //         name: `Time ${i + 1}`,
  //         players: [],
  //         overall: 0,
  //       })
  //     );

  //     const flagMap: Map<number, Set<number>> = new Map();
  //     let failed = false;
  //     let playerIndex = 0;

  //     for (let t = 0; t < teamCount; t++) {
  //       const maxSize = distribution[t];

  //       while (teams[t].players.length < maxSize && playerIndex < shuffled.length) {
  //         const player = shuffled[playerIndex++];

  //         const hasConflict = player.flags?.some(flag => {
  //           const normalized = normalize(flag.name);
  //           return restrictiveFlags.includes(normalized) && flagMap.get(flag.id)?.has(t);
  //         }) ?? false;

  //         if (!hasConflict) {
  //           teams[t].players.push(player);

  //           player.flags?.forEach(flag => {
  //             const normalized = normalize(flag.name);
  //             if (restrictiveFlags.includes(normalized)) {
  //               if (!flagMap.has(flag.id)) flagMap.set(flag.id, new Set());
  //               flagMap.get(flag.id)!.add(t);
  //             }
  //           });
  //         } else {
  //           const conflictingFlags = player.flags?.filter(flag =>
  //             restrictiveFlags.includes(normalize(flag.name))
  //           ).map(f => f.name);

  //           console.warn(`[Tentativa ${attempt}] Conflito ao alocar ${player.name} no Time ${t + 1} com flags:`, conflictingFlags);
  //           lastFailReason = `Conflito ao alocar ${player.name} no Time ${t + 1} com flags: ${conflictingFlags?.join(', ')}`;
  //           failed = true;
  //           break;
  //         }

  //         if (playerIndex > totalPlayers * 2) {
  //           failed = true;
  //           lastFailReason = 'Tentativa excedeu o número máximo de iterações para encaixar jogadores.';
  //           break;
  //         }
  //       }

  //       if (failed) break;
  //     }

  //     if (failed) continue;

  //     for (const team of teams) {
  //       const total = team.players.reduce((acc, p) => acc + p.rating, 0);
  //       team.overall = Math.round(total / team.players.length);
  //     }

  //     const ratings = teams.map(t => t.overall);
  //     const diff = Math.max(...ratings) - Math.min(...ratings);

  //     if (diff < bestDiff) {
  //       bestDiff = diff;
  //       bestTeams = teams.map(t => ({
  //         name: t.name,
  //         overall: t.overall,
  //         players: [...t.players],
  //       }));
  //     }

  //     this.openTeamModal();
  //   }

  //   if (bestTeams.length === 0) {
  //     console.error('[ERRO FINAL] Falha ao gerar times mesmo após várias tentativas.');
  //     this.toaster.error(`Não foi possível gerar times válidos. ${lastFailReason || 'Verifique os jogadores e flags selecionados.'}`);
  //   } else {
  //     this.generatedTeams = bestTeams;
  //     console.log('[SUCESSO] Times gerados com diferença de rating de', bestDiff);
  //     console.table(this.generatedTeams.map(t => ({
  //       nome: t.name,
  //       jogadores: t.players.length,
  //       média: t.overall
  //     })));
  //   }
  // }


  //METODO MAIS ALEATORIEDADE
  shuffleArray(array: Player[]): Player[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  generateTeams(): void {
    const selectedPlayers = this.players().filter(p => p.selected);
    const teamCount = this.selectedTeamCount || 2;
  
    if (selectedPlayers.length < teamCount) {
      this.toaster.warning('Número insuficiente de jogadores.');
      return;
    }
  
    const MAX_ATTEMPTS = 50;
    let attempts = 0;
    let validTeams: Team[] = [];
  
    // Mapeia jogadores por flags ativas
    const playersByFlag: { [flagId: number]: Player[] } = {};
    const allFlaggedPlayers = new Set<string>();
  
    for (const player of selectedPlayers) {
      for (const flag of player.flags || []) {
        if (flag.affectsTeamGeneration) {
          if (!playersByFlag[flag.id]) playersByFlag[flag.id] = [];
          playersByFlag[flag.id].push(player);
          allFlaggedPlayers.add(player.id);
        }
      }
    }
  
    // Flags com quantidade insuficiente
    const flagsComProblema: string[] = [];
  
    for (const [flagId, players] of Object.entries(playersByFlag)) {
      if (players.length < teamCount) {
        const nome = players[0]?.flags?.find(f => f.id === +flagId)?.name ?? `Flag ${flagId}`;
        flagsComProblema.push(nome);
      }
    }
  
    while (attempts < MAX_ATTEMPTS) {
      const teams = Array.from({ length: teamCount }, (_, i) => ({
        name: `Time ${i + 1}`,
        players: [] as Player[],
        overall: 0,
      }));
  
      const alreadyAdded = new Set<string>();
  
      // 1. Distribuição das flags ativas
      for (const players of Object.values(playersByFlag)) {
        const countPerTeam = Math.floor(players.length / teamCount);
        const extra = players.length % teamCount;
        const shuffled = this.shuffleArray(players);
        let playerIndex = 0;
  
        for (let t = 0; t < teamCount; t++) {
          const max = countPerTeam + (t < extra ? 1 : 0);
          let added = 0;
  
          while (added < max && playerIndex < shuffled.length) {
            const player = shuffled[playerIndex++];
            if (!alreadyAdded.has(player.id)) {
              teams[t].players.push(player);
              alreadyAdded.add(player.id);
            }
            added++;
          }
        }
      }
  
      // 2. Distribuição dos jogadores restantes, balanceando rating
      const remainingPlayers = selectedPlayers.filter(p => !alreadyAdded.has(p.id));
      const sortedRemaining = remainingPlayers
        .map(p => ({ p, r: this.ratingService.calculate(p) }))
        .sort((a, b) => b.r - a.r)
        .map(obj => obj.p);
  
      while (sortedRemaining.length) {
        const group = sortedRemaining.splice(0, teamCount);
        const shuffled = this.shuffleArray(group);
        shuffled.forEach((player, i) => {
          if (player) teams[i % teamCount].players.push(player);
        });
      }
  
      // 3. Cálculo do rating médio dos times
      for (const team of teams) {
        const total = team.players.reduce((sum, p) => sum + this.ratingService.calculate(p), 0);
        team.overall = Math.round(total / team.players.length);
      }
  
      const overalls = teams.map(t => t.overall);
      const max = Math.max(...overalls);
      const min = Math.min(...overalls);
  
      if (max - min <= 5 || teamCount <= 2) {
        validTeams = teams;
        break;
      }
  
      attempts++;
    }
  
    this.generatedTeams = validTeams;
  
    if (flagsComProblema.length) {
      this.toaster.info(
        `Alguns grupos não foram totalmente separados entre os times: ${flagsComProblema.join(', ')}.`
      );
    }

    this.openTeamModal();
  }
  
  //METODO MAIS ALEATORIEDADE
  recalculateTeamAverages() {
    for (const team of this.generatedTeams) {
      team.overall = Math.round(
        team.players.reduce((sum, p) => sum + this.getRating(p), 0) /
        (team.players.length || 1)
      );
    }
  }

  private calculateTeamDistribution(totalPlayers: number, teamCount: number): number[] {
    const baseSize = Math.floor(totalPlayers / teamCount);
    const extras = totalPlayers % teamCount;

    const distribution = Array(teamCount).fill(baseSize);

    for (let i = 0; i < extras; i++) {
      distribution[i]++;
    }

    return distribution.sort((a, b) => b - a); // opcional: organiza para começar pelos maiores
  }


  get availablePlayers(): Player[] {
    return this.sortedPlayers.filter(player => !this.isLesionado(player));
  }

  togglePlayerSelection(player: Player) {
    if (this.isLesionado(player)) return;
    player.selected = !player.selected;
    this.allPlayersSelected = this.sortedPlayers
      .filter(p => !this.isLesionado(p))
      .every(p => p.selected);
  }

  areAllPlayersSelected(): boolean {
    return this.sortedPlayers.every(player => player.selected);
  }

  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const selectAll = checkbox.checked;

    this.sortedPlayers.forEach(player => {
      if (!this.isLesionado(player)) {
        player.selected = selectAll;
      }
    });

    this.allPlayersSelected = selectAll;
  }

  openTeamModal() {
    this.teamModalVisible.set(true);
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
