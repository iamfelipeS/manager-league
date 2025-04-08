import { Component, inject } from '@angular/core';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss'
})
export class PlayerListComponent {
  players: Player[] = [];

    private playerService = inject(PlayerService);
    // private modalService = inject(ModalService);

  ngOnInit(): void {
    // this.players = this.playerService.getPlayers();
  }

  openPlayerModal(): void {
    // this.modalService.open('create-player');
  }
}
