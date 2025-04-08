import { Component, inject, signal } from '@angular/core';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss'
})
export class PlayerListComponent {
  players: Player[] = [];

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.playerService.getPlayers().subscribe((players) => {
      this.players = players;
    });
  }

  openAddPlayerModal(){
    
  }
}
