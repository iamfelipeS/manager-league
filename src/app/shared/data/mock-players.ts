import { v4 as uuidv4 } from 'uuid';
import { Player } from '../../models/player.model';

export const MOCK_PLAYERS: Player[] = [
  { id: uuidv4(), name: 'Allan', qualidade: 10, velocidade: 8, fase: 10, movimentacao: 'Normal', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Ariel', qualidade: 7, velocidade: 7, fase: 6, movimentacao: 'Estático', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Bruno', qualidade: 10, velocidade: 10, fase: 10, movimentacao: 'Intenso', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Felipe', qualidade: 10, velocidade: 10, fase: 6, movimentacao: 'Intenso', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Lucas', qualidade: 10, velocidade: 10, fase: 10, movimentacao: 'Normal', rating: 0, posicao: 'D' },
  { id: uuidv4(), name: 'Roberto', qualidade: 10, velocidade: 10, fase: 10, movimentacao: 'Normal', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Jamel', qualidade: 10, velocidade: 10, fase: 10, movimentacao: 'Intenso', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Descalço', qualidade: 10, velocidade: 10, fase: 10, movimentacao: 'Estático', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Pedrão', qualidade: 10, velocidade: 9, fase: 10, movimentacao: 'Normal', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Pedrinho', qualidade: 8, velocidade: 10, fase: 10, movimentacao: 'Intenso', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Wagner', qualidade: 9, velocidade: 8, fase: 10, movimentacao: 'Normal', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Will', qualidade: 7, velocidade: 10, fase: 10, movimentacao: 'Normal', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Val', qualidade: 7, velocidade: 10, fase: 10, movimentacao: 'Normal', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Rafhael', qualidade: 7, velocidade: 9, fase: 10, movimentacao: 'Normal', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Lucas Teixeira', qualidade: 7, velocidade: 8, fase: 10, movimentacao: 'Estático', rating: 0, posicao: 'D' },
  { id: uuidv4(), name: 'Henry', qualidade: 6, velocidade: 8, fase: 10, movimentacao: 'Estático', rating: 0, posicao: 'D' },
  { id: uuidv4(), name: 'Rafael Angelilo', qualidade: 5, velocidade: 9, fase: 10, movimentacao: 'Estático', rating: 0, posicao: 'M' },
  { id: uuidv4(), name: 'Elenilton', qualidade: 5, velocidade: 6, fase: 10, movimentacao: 'Estático', rating: 0, posicao: 'D' },
  { id: uuidv4(), name: 'Lindor', qualidade: 5, velocidade: 4, fase: 9, movimentacao: 'Estático', rating: 0, posicao: 'A' },
  { id: uuidv4(), name: 'Gil', qualidade: 8, velocidade: 10, fase: 10, movimentacao: 'Normal', rating: 0, posicao: 'G' },
  { id: uuidv4(), name: 'Jorge', qualidade: 4, velocidade: 4, fase: 8, movimentacao: 'Estático', rating: 0, posicao: 'A' },
];

