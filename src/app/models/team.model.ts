import { Player } from './player.model';

export interface Team {
  name: string;
  players: Player[];
  overall: number;
  averageRating?: number;
}
