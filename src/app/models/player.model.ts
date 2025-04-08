export interface Player {
  id: string;
  name: string;
  qualidade: number;
  velocidade: number;
  fase: number;
  movimentacao: 'Estático' | 'Normal' | 'Intenso';
  rating: number;
}
