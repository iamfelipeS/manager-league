import { v4 as uuidv4 } from 'uuid';
import { Player } from '../../models/player.model';

export const PLAYERS: Player[] = [
    {
        id: uuidv4(),
        name: 'Allan',
        qualidade: 8,
        velocidade: 8,
        fase: 7,
        movimentacao: 'Normal',
        rating: 77
    },
    {
        id: uuidv4(),
        name: 'Aryel',
        qualidade: 6,
        velocidade: 6,
        fase: 6,
        movimentacao: 'Estático',
        rating: 63
    },
    {
        id: uuidv4(),
        name: 'Bruno',
        qualidade: 9,
        velocidade: 8,
        fase: 8,
        movimentacao: 'Normal',
        rating: 81
    },
    {
        id: uuidv4(),
        name: 'Descalço',
        qualidade: 6,
        velocidade: 7,
        fase: 6,
        movimentacao: 'Estático',
        rating: 65
    },
    {
        id: uuidv4(),
        name: 'Elenilton',
        qualidade: 4,
        velocidade: 5,
        fase: 5,
        movimentacao: 'Estático',
        rating: 46
    },
    {
        id: uuidv4(),
        name: 'Felipe',
        qualidade: 10,
        velocidade: 9,
        fase: 9,
        movimentacao: 'Intenso',
        rating: 91
    },
    {
        id: uuidv4(),
        name: 'Gil',
        qualidade: 4,
        velocidade: 5,
        fase: 4,
        movimentacao: 'Normal',
        rating: 42
    },
    {
        id: uuidv4(),
        name: 'Henry',
        qualidade: 4,
        velocidade: 4,
        fase: 4,
        movimentacao: 'Estático',
        rating: 40
    },
    {
        id: uuidv4(),
        name: 'Jamel',
        qualidade: 9,
        velocidade: 9,
        fase: 8,
        movimentacao: 'Intenso',
        rating: 82
    },
    {
        id: uuidv4(),
        name: 'Jorge',
        qualidade: 4,
        velocidade: 4,
        fase: 4,
        movimentacao: 'Estático',
        rating: 41
    },
    {
        id: uuidv4(),
        name: 'Lindor',
        qualidade: 6,
        velocidade: 6,
        fase: 6,
        movimentacao: 'Normal',
        rating: 59
    },
    {
        id: uuidv4(),
        name: 'Lucas',
        qualidade: 9,
        velocidade: 9,
        fase: 8,
        movimentacao: 'Intenso',
        rating: 90
    },
    {
        id: uuidv4(),
        name: 'Lucas Teixeira',
        qualidade: 5,
        velocidade: 5,
        fase: 5,
        movimentacao: 'Estático',
        rating: 53
    },
    {
        id: uuidv4(),
        name: 'Maranhao',
        qualidade: 5,
        velocidade: 5,
        fase: 5,
        movimentacao: 'Normal',
        rating: 49
    },
    {
        id: uuidv4(),
        name: 'Pedrinho',
        qualidade: 7,
        velocidade: 7,
        fase: 7,
        movimentacao: 'Normal',
        rating: 71
    },
    {
        id: uuidv4(),
        name: 'Pedrão',
        qualidade: 7,
        velocidade: 7,
        fase: 7,
        movimentacao: 'Normal',
        rating: 72
    }
];
   