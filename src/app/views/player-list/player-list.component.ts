import {
  Component,
  ViewChild,
  TemplateRef,
  inject,
  computed,
  OnInit,
  signal
} from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';
import { RatingService } from '../../services/rating.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Player, PlayerFlag } from '../../models/player.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ToasterService } from '../../services/toaster.service';
import { FlagService } from '../../services/flag.service';
import { Router } from '@angular/router';
import { Leagues } from '../../models/leagues.model';
import { LeaguesService } from '../../services/leagues.service';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, LoaderComponent],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss',
})
export class PlayerListComponent implements OnInit {
  private leagueService = inject(LeaguesService);
  private playerService = inject(PlayerService);
  private ratingService = inject(RatingService);
  private flagService = inject(FlagService);
  private toaster = inject(ToasterService);
  private router = inject(Router);

  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('playerFormTemplate') formTemplateRef!: TemplateRef<any>;

  selectedPlayer: Player | null = null;
  selectedFlagId: number | null = null;

  isLoading = signal(true);
  leagues = signal<Leagues[]>([]);
  players = signal<Player[]>([]);
  novaFlagUsarNaGeracao = signal(true);
  ligaSelecionada = signal<string>('');
  readonly availableFlags = signal<PlayerFlag[]>([]);

  orderBy = signal<'rating' | 'name' | 'posicao'>('rating');
  searchTerm = signal<string>('');

  // orderedPlayers = computed(() => {
  //   const players = [...this.players()];
  //   console.log(this.players.length)
  //   const sortBy = this.orderBy();

  //   return players.sort((a, b) => {
  //     if (sortBy === 'rating') return this.getRating(b) - this.getRating(a);
  //     if (sortBy === 'name') return a.name.localeCompare(b.name);
  //     if (sortBy === 'posicao') return a.posicao.localeCompare(b.posicao);
  //     return 0;
  //   });
  // });

  async ngOnInit() {
    this.loadFlags();

    try {
      const allLigas = await this.leagueService.getAllLeagues();
      this.leagues.set(allLigas);

      if (allLigas.length) {
        this.ligaSelecionada.set(allLigas[0].id);
        await this.loadPlayersByLeague();
      }
    } catch (err) {
      this.toaster.error('Erro ao carregar ligas');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  orderedAndFilteredPlayers = computed(() => {
    const players = this.players();
    const searchTerm = this.searchTerm().toLowerCase();
    const orderBy = this.orderBy();

    const posicaoOrder: { [key: string]: number } = {
      'G': 1, // Goleiro
      'D': 2, // Defensor
      'M': 3, // Meio Campo
      'A': 4  // Atacante
    };

    // 1. Filtrar
    const filtered = players.filter(player =>
      player.name.toLowerCase().includes(searchTerm) ||
      player.posicao.toLowerCase().includes(searchTerm) || // A posição aqui é o 'G', 'D', 'M', 'A'
      player.flags?.some(flag => flag.name.toLowerCase().includes(searchTerm))
    );

    // 2. Ordenar
    return filtered.sort((a, b) => {
      if (orderBy === 'rating') {
        return b.rating - a.rating; // Maior rating primeiro
      } else if (orderBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (orderBy === 'posicao') {
        // Usar o mapa de ordem customizada para as posições
        const orderA = posicaoOrder[a.posicao];
        const orderB = posicaoOrder[b.posicao];
        return orderA - orderB;
      }
      return 0;
    });
  });

  ngAfterViewInit(): void {
    this.modal.confirmed.subscribe(() => this.savePlayer());
  }

  minhasLigas(): Leagues[] {
    return this.leagues();
  }

  async loadPlayersByLeague() {
    if (!this.ligaSelecionada()) return;
    this.isLoading.set(true);

    try {
      const players = await this.playerService.getPlayersByLeague(this.ligaSelecionada());
      this.players.set(players);
    } catch (err) {
      this.toaster.error('Erro ao carregar jogadores da liga');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadFlags(): Promise<void> {
    try {
      const flags = await this.flagService.getAllFlags();
      this.availableFlags.set(
        flags.sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (error) {
      console.error('Erro ao carregar flags:', error);
      this.toaster.error('Erro ao carregar grupos');
    }
  }

  addPlayer() {
    this.selectedPlayer = {
      id: uuidv4(),
      name: '',
      qualidade: 3,
      velocidade: 6,
      fase: 6,
      movimentacao: 'Normal',
      posicao: 'M',
      rating: 0,
      pontua: false,
      league_id: this.ligaSelecionada(),
      flags: []
    };
    this.selectedFlagId = null;

    this.modal.open({
      title: 'Adicionar Jogador',
      template: this.formTemplateRef,
    });
  }

  editPlayer(player: Player) {
    this.selectedPlayer = { ...player };

    if (this.selectedPlayer.pontua === undefined || this.selectedPlayer.pontua === null) {
      this.selectedPlayer.pontua = false;
    }

    const flagPrincipal = player.flags?.[0] ?? null;
    this.selectedFlagId = flagPrincipal?.id ?? null;

    this.modal.open({
      title: 'Editar Jogador',
      template: this.formTemplateRef,
    });
  }


  async savePlayer() {
    if (!this.selectedPlayer) return;

    if (!this.selectedPlayer.name?.trim()) {
      this.toaster.warning('Nome do jogador é obrigatório.');
      return;
    }

    if (!this.selectedPlayer.league_id) {
      this.toaster.warning('Selecione uma liga para o jogador.');
      return;
    }

    this.selectedPlayer.rating = this.getRating(this.selectedPlayer);

    try {
      const exists = this.players().some(p => p.id === this.selectedPlayer!.id);

      if (exists) {
        await this.playerService.updatePlayer(this.selectedPlayer!);
      } else {
        await this.playerService.addPlayer(this.selectedPlayer!);
      }

      // Garante que sempre exista a propriedade flags, mesmo vazia
      this.selectedPlayer.flags = this.selectedPlayer.flags ?? [];

      const flagId = this.selectedFlagId;
      await this.flagService.updatePlayerFlags(
        this.selectedPlayer.id,
        flagId ? [flagId] : []
      );

      await this.loadPlayersByLeague();

      this.toaster.success(exists ? 'Jogador atualizado!' : 'Jogador adicionado!');
    } catch (err: any) {
      let errorMessage = 'Erro ao salvar jogador';

      // Se o erro for um objeto com status ou message
      if (err?.status) {
        if (err.status === 401) {
          errorMessage = 'Sem autorização para executar essa ação.';
        } else if (err.status === 403) {
          errorMessage = 'Acesso proibido.';
        } else if (err.status === 404) {
          errorMessage = 'Jogador não encontrado.';
        } else if (err.status === 409) {
          errorMessage = 'Conflito: jogador já existe.';
        } else if (err.status >= 500) {
          errorMessage = 'Erro interno no servidor. Tente novamente mais tarde.';
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      this.toaster.error('Erro ao salvar jogador');
    }
  }

  async deletePlayer(id: string) {
    if (!confirm('Deseja remover este jogador?')) return;

    try {
      await this.playerService.deletePlayer(id);
      this.toaster.success('Jogador removido!');
      this.players.update(p => p.filter(j => j.id !== id));
    } catch {
      this.toaster.error('Erro ao remover jogador');
    }
  }

  getRating(player: Player): number {
    return this.ratingService.calculate(player);
  }

  getLabelFromQualidade(nivel: number): string {
    switch (nivel) {
      case 1: return 'Ruim';
      case 2: return 'Regular';
      case 3: return 'Normal';
      case 4: return 'Bom';
      case 5: return 'Excelente';
      default: return '';
    }
  }

  getPosicaoLabel(posicao: string): string {
    switch (posicao) {
      case 'G': return 'Goleiro';
      case 'D': return 'Defensor';
      case 'M': return 'Meio Campo';
      case 'A': return 'Atacante';
      default: return '';
    }
  }

  getRatingColor(rating: number): string {
    if (rating <= 55) return 'bg-yellow-900';
    if (rating <= 69) return 'bg-yellow-500';
    if (rating <= 80) return 'bg-green-400';
    return 'bg-green-700';
  }

  getFaseIcon(player: Player): { icon: string; color: string; animation: string } {
    if (player.fase <= 4) {
      return {
        icon: 'fa-caret-down',
        color: 'text-red-500',
        animation: 'animate-bounce-down'
      };
    } else if (player.fase <= 7) {
      return {
        icon: 'fa-minus',
        color: 'text-yellow-400',
        animation: 'animate-pulse'
      };
    } else {
      return {
        icon: 'fa-caret-up',
        color: 'text-green-500',
        animation: 'animate-bounce-up'
      };
    }
  }

  get ligaSelecionadaValue() {
    return this.ligaSelecionada();
  }

  set ligaSelecionadaValue(value: string) {
    this.ligaSelecionada.set(value);
    this.loadPlayersByLeague();
  }

  searchPlayer(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  // FLAG
  redirectToFlagAdmin() {
    this.router.navigateByUrl("/admin/flags");
  }

  hasFlag(player: Player, flag: PlayerFlag): boolean {
    return !!player.flags?.some(f => f.id === flag.id);
  }

  async createAndSelectFlag() {
    const name = prompt('Nome da nova flag:');
    if (!name || !name.trim()) return;

    try {
      const novaFlag = await this.flagService.createFlag(name.trim(), this.novaFlagUsarNaGeracao());

      this.availableFlags.update(flags => [...flags, novaFlag]);
      this.selectedFlagId = novaFlag.id;

      this.toaster.success('Flag criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar flag:', error);
      this.toaster.error('Erro ao criar flag');
    }
  }

  // AVATAR
  onAvatarChange(event: Event, player: Player) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.toaster.error('Nenhum arquivo selecionado.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png'];
    const maxSizeMB = 10;

    console.log('Arquivo selecionado:', {
      name: file.name,
      type: file.type,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2),
    });

    if (!validTypes.includes(file.type)) {
      this.toaster.error('Formato inválido. Envie uma imagem JPG ou PNG.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      this.toaster.error(`Imagem muito grande. Máximo permitido: ${maxSizeMB}MB.`);
      return;
    }

    this.playerService.updateAvatar(player, file)
      .then(() => {
        this.toaster.success('Avatar atualizado com sucesso!');
      })
      .catch((err) => {
        console.error('Erro ao atualizar avatar:', err);
        this.toaster.error('Erro ao atualizar avatar.');
      });
  }

}


