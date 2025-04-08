import { Component, computed, inject, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss'
})
export class PlayerListComponent implements OnInit {
  private playerService = inject(PlayerService);

  players = computed(() => this.playerService.getPlayers());

  ngOnInit(): void {
    // Nenhuma ação necessária aqui por enquanto
  }

  openAddPlayerModal(){
    // lógica para abrir o modal
  }
}
