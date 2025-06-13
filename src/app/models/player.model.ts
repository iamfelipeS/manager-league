export interface PlayerFlag {
  id: number;
  name: string;
  affectsTeamGeneration: boolean;
}
export interface Player {
  id: string;
  name: string;
  qualidade: number;
  velocidade: number;
  fase: number;
  rating: number;
  selected?: boolean;
  avatarUrl?: string | null;
  pontua: boolean;
  league_id: string;
  trofeus?: number;
  flags: PlayerFlag[];
  criterios?: { [nome: string]: number };
  movimentacao: 'Estático' | 'Normal' | 'Intenso';
  posicao: 'G' | 'D' | 'M' | 'A'; 
}
