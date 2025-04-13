export interface Player {
  id: string;
  name: string;
  qualidade: number;
  velocidade: number;
  fase: number;
  rating: number;
  selected?: boolean;
  avatarUrl?: string | null;
  movimentacao: 'Estático' | 'Normal' | 'Intenso';
  posicao: 'A' | 'M' | 'D' | 'G'; // Atacante, Meio campo, Defensor, Goleiro
}
