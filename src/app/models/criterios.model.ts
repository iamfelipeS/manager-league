export interface Criterio {
  id: number;        // identificador único do critério
  nome: string;      // nome do critério (ex: Gols, Vitórias)
  peso: number;      // peso que influencia a ordem da classificação
  ativo: boolean;    // se o critério está sendo usado atualmente
  league_id: string;
}
