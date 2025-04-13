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
import { Player } from '../../models/player.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, LoaderComponent],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss',
})
export class PlayerListComponent implements OnInit {
  private playerService = inject(PlayerService);
  private ratingService = inject(RatingService);
  private toaster = inject(ToasterService);

  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('playerFormTemplate') formTemplateRef!: TemplateRef<any>;

  selectedPlayer: Player | null = null;

  players = signal<Player[]>([]);
  isLoading = signal(true);

  orderBy = signal<'rating' | 'name' | 'posicao'>('rating');

  ngOnInit(): void {
    this.loadPlayers();
  }

  ngAfterViewInit(): void {
    this.modal.confirmed.subscribe(() => this.savePlayer());
  }

  async loadPlayers() {
    this.isLoading.set(true);
    try {
      const data = await this.playerService.getPlayers();
      this.players.set(data);
    } catch (err) {
      this.toaster.error('Erro ao carregar jogadores');
    } finally {
      this.isLoading.set(false);
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
      rating: 0
    };
    this.modal.open({
      title: 'Adicionar Jogador',
      template: this.formTemplateRef,
    });
  }

  editPlayer(player: Player) {
    this.selectedPlayer = { ...player };
    this.modal.open({
      title: 'Editar Jogador',
      template: this.formTemplateRef,
    });
  }

  async savePlayer() {
    if (!this.selectedPlayer) return;
    this.selectedPlayer.rating = this.getRating(this.selectedPlayer);

    try {
      const exists = this.players().some(p => p.id === this.selectedPlayer!.id);

      if (exists) {
        await this.playerService.updatePlayer(this.selectedPlayer!);
      } else {
        await this.playerService.addPlayer(this.selectedPlayer!);
      }

      await this.loadPlayers();

      this.toaster.success(exists ? 'Jogador atualizado!' : 'Jogador adicionado!');
    } catch (err) {
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

  orderedPlayers = computed(() => {
    const players = [...this.players()];
    const sortBy = this.orderBy();

    return players.sort((a, b) => {
      if (sortBy === 'rating') return this.getRating(b) - this.getRating(a);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'posicao') return a.posicao.localeCompare(b.posicao);
      return 0;
    });
  });


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
  
}


