import {
  Component,
  ViewChild,
  TemplateRef,
  inject,
  computed,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../services/player.service';
import { RatingService } from '../../services/rating.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Player } from '../../models/player.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

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

  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('playerFormTemplate') formTemplateRef!: TemplateRef<any>;

  selectedPlayer: Player | null = null;

  players = signal<Player[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadPlayers();
  }

  ngAfterViewInit(): void {
    this.modal.confirmed.subscribe(() => this.savePlayer());
  }

  async loadPlayers() {
    this.isLoading.set(true); // Set loading state to true
    const fetchedPlayers = await this.playerService.getPlayers(); // Fetch players from Supabase
    this.players.set(fetchedPlayers); // Update the players signal
    this.isLoading.set(false); // Set loading state to false
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

    this.modal.open({
      title: 'Adicionar Jogador',
      template: this.formTemplateRef,
      context: { player: this.selectedPlayer },
      confirmButtonText: 'Salvar',
      showFooter: true,
      showConfirmButton: true,
      showCancelButton: true,
    });
  }

  editPlayer(player: Player) {
    this.selectedPlayer = { ...player };
    this.modal.open({
      title: 'Editar Jogador',
      template: this.formTemplateRef,
      context: { player: this.selectedPlayer },
      confirmButtonText: 'Salvar',
      showFooter: true,
      showConfirmButton: true,
      showCancelButton: true,
    });
  }

  async deletePlayer(id: string) {
    const confirmDelete = confirm('Tem certeza que deseja remover este jogador?');
    if (!confirmDelete) return;

    await this.playerService.delete(id);
    await this.loadPlayers();
  }

  async savePlayer() {
    if (!this.selectedPlayer) return;

    const exists = this.players().find(p => p.id === this.selectedPlayer!.id);

    if (exists) {
      await this.playerService.update(this.selectedPlayer);
    } else {
      await this.playerService.add(this.selectedPlayer);
    }

    await this.loadPlayers();
    this.modal.close();
  }

  getRating(player: Player): number {
    return this.ratingService.calculate(player);
  }
}