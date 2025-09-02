export interface CriterioBase {
  id: number;
  nome: string;
}

export interface CriterioDaLiga {
  id: number;        // identificador único do critério
  nome: string;      // nome do critério (ex: Gols, Vitórias)
  peso: number;      // peso que influencia a ordem da classificação
  ativo: boolean;    // se o critério está sendo usado atualmente
  league_id: string;
  mostrar_na_tabela: boolean;
}

export interface PlayerCriterioValor {
  player_id: string;
  league_id: string;
  criterio: string;
  valor: number;
}
