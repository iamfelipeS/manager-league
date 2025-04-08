import {
  Component,
  ViewChild,
  TemplateRef,
  inject,
  computed,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../services/player.service';
import { RatingService } from '../../services/rating.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss',
})
export class PlayerListComponent implements OnInit {
  private playerService = inject(PlayerService);
  private ratingService = inject(RatingService);

  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('playerFormTemplate') formTemplateRef!: TemplateRef<any>;

  selectedPlayer: Player | null = null;

  players = computed(() => this.playerService.getPlayers());

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.modal.confirmed.subscribe(() => {
      this.savePlayer();
    });
  }

  openAddPlayerModal() {
    this.selectedPlayer = {
      id: crypto.randomUUID(),
      name: '',
      qualidade: 5,
      velocidade: 5,
      fase: 5,
      movimentacao: 'Normal',
      rating: 0,
      posicao: 'M',
    };
  
    // Verifica se o modal foi inicializado
    if (this.modal) {
      this.modal.open({
        title: this.selectedPlayer?.id ? 'Editar Jogador' : 'Adicionar Jogador',
        template: this.formTemplateRef,
        context: { player: this.selectedPlayer },
        confirmButtonText: 'Salvar',
        showConfirmButton: true,
        showCancelButton: true,
        showFooter: true,
      });      
    }
  }

  editPlayer(player: Player) {
    this.selectedPlayer = { ...player };
    this.modal.open({
      title: 'Editar Jogador',
      template: this.formTemplateRef,
      context: { player: this.selectedPlayer }
    });
  }

  deletePlayer(id: string) {
    if (confirm('Tem certeza que deseja remover este jogador?')) {
      this.playerService.delete(id);
    }
  }

  savePlayer() {
    if (!this.selectedPlayer) return;

    // Rating é recalculado pelo PlayerService
    const existing = this.players().find(p => p.id === this.selectedPlayer!.id);
    if (existing) {
      this.playerService.update(this.selectedPlayer);
    } else {
      this.playerService.add(this.selectedPlayer);
    }

    this.modal.close();
  }

  getRating(player: Player): number {
    return this.ratingService.calculate(player);
  }
}
