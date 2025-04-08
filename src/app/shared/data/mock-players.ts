import { v4 as uuidv4 } from 'uuid';
import { Player } from '../../models/player.model';

export const MOCK_PLAYERS: Player[] = [
  { id: uuidv4(), name: 'Allan', qualidade: 9, velocidade: 7, fase: 9, movimentacao: 'Normal', rating: 0, posicao: 'M' }, // ≈86
  { id: uuidv4(), name: 'Felipe', qualidade: 9, velocidade: 8, fase: 8, movimentacao: 'Intenso', rating: 0, posicao: 'M' }, // ≈85
  { id: uuidv4(), name: 'Bruno', qualidade: 9, velocidade: 8, fase: 8, movimentacao: 'Intenso', rating: 0, posicao: 'M' }, // ≈83
  { id: uuidv4(), name: 'Lucas', qualidade: 8, velocidade: 9, fase: 8, movimentacao: 'Normal', rating: 0, posicao: 'D' }, // ≈78
  { id: uuidv4(), name: 'Roberto', qualidade: 8, velocidade: 8, fase: 8, movimentacao: 'Normal', rating: 0, posicao: 'M' }, // ≈75
  { id: uuidv4(), name: 'Jamel', qualidade: 8, velocidade: 7, fase: 7, movimentacao: 'Intenso', rating: 0, posicao: 'M' }, // ≈73
  { id: uuidv4(), name: 'Descalço', qualidade: 8, velocidade: 7, fase: 8, movimentacao: 'Estático', rating: 0, posicao: 'M' }, // ≈71
  { id: uuidv4(), name: 'Pedrão', qualidade: 8, velocidade: 6, fase: 7, movimentacao: 'Normal', rating: 0, posicao: 'M' }, // ≈70
  { id: uuidv4(), name: 'Ariel', qualidade: 7, velocidade: 6, fase: 6, movimentacao: 'Estático', rating: 0, posicao: 'M' }, // ≈68
  { id: uuidv4(), name: 'Pedrinho', qualidade: 7, velocidade: 6, fase: 6, movimentacao: 'Normal', rating: 0, posicao: 'M' }, // ≈66
  { id: uuidv4(), name: 'Wagner', qualidade: 7, velocidade: 5, fase: 6, movimentacao: 'Normal', rating: 0, posicao: 'M' }, // ≈65
  { id: uuidv4(), name: 'Will', qualidade: 7, velocidade: 5, fase: 5, movimentacao: 'Normal', rating: 0, posicao: 'M' }, // ≈63
  { id: uuidv4(), name: 'Val', qualidade: 6, velocidade: 6, fase: 6, movimentacao: 'Normal', rating: 0, posicao: 'M' }, // ≈63
  { id: uuidv4(), name: 'Rafhael', qualidade: 6, velocidade: 6, fase: 6, movimentacao: 'Normal', rating: 0, posicao: 'M' }, // ≈60
  { id: uuidv4(), name: 'Lucas Teixeira', qualidade: 6, velocidade: 5, fase: 5, movimentacao: 'Estático', rating: 0, posicao: 'D' }, // ≈58
  { id: uuidv4(), name: 'Henry', qualidade: 5, velocidade: 5, fase: 5, movimentacao: 'Estático', rating: 0, posicao: 'D' }, // ≈55
  { id: uuidv4(), name: 'Rafael Angelilo', qualidade: 5, velocidade: 5, fase: 5, movimentacao: 'Estático', rating: 0, posicao: 'M' }, // ≈55
  { id: uuidv4(), name: 'Elenilton', qualidade: 4, velocidade: 5, fase: 5, movimentacao: 'Estático', rating: 0, posicao: 'D' }, // ≈48
  { id: uuidv4(), name: 'Lindor', qualidade: 4, velocidade: 4, fase: 4, movimentacao: 'Estático', rating: 0, posicao: 'A' }, // ≈41
  { id: uuidv4(), name: 'Jorge', qualidade: 3, velocidade: 3, fase: 4, movimentacao: 'Estático', rating: 0, posicao: 'A' }, // ≈36
  { id: uuidv4(), name: 'Maranhão', qualidade: 3, velocidade: 3, fase: 3, movimentacao: 'Estático', rating: 0, posicao: 'A' }, // ≈30
  { id: uuidv4(), name: 'Gil', qualidade: 8, velocidade: 7, fase: 7, movimentacao: 'Normal', rating: 0, posicao: 'G' }, // ≈74
  { id: uuidv4(), name: 'Ioio', qualidade: 5, velocidade: 4, fase: 5, movimentacao: 'Estático', rating: 0, posicao: 'D' }, // ≈50  
];

