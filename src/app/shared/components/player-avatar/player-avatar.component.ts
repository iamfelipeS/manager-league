import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-avatar.component.html',
  styleUrl: './player-avatar.component.scss'
})
export class PlayerAvatarComponent {
  @Input() name: string = '';
  @Input() posicao: string = '';
  @Input() avatarUrl: string | null = null;
}
