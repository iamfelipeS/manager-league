import { Injectable, signal } from '@angular/core';
import { supabase } from '../core/supabase/supabase.client';
import { Criterio } from '../models/criterios.model';

interface CriterioPorLiga {
  id?: number;
  criterio_id: number;
  league_id: string;
  peso: number;
  ativo: boolean;
  nome?: string;
}

@Injectable({ providedIn: 'root' })
export class CriterioService {
  readonly criterios = signal<Criterio[]>([]);

  async getCriteriosPorLiga(leagueId: string): Promise<Criterio[]> {
    const { data, error } = await supabase
      .from('criterios_por_liga')
      .select('*, criterios (nome)')
      .eq('league_id', leagueId)
      .order('peso', { ascending: true });

    if (error) throw error;

    const mapped: Criterio[] = (data ?? []).map((row: any) => ({
      id: row.criterio_id,
      nome: row.criterios.nome,
      peso: row.peso,
      ativo: row.ativo,
      league_id: row.league_id,
    }));

    this.criterios.set(mapped);
    return mapped;
  }

  async getValoresPorLiga(leagueId: string) {
    const { data, error } = await supabase
      .from('player_criterios_por_liga')
      .select('*')
      .eq('league_id', leagueId);

    if (error) throw error;
    return data ?? [];
  }

  async updateCriteriosPorLiga(criterios: Criterio[]): Promise<void> {
    const upserts = criterios.map(c => ({
      criterio_id: c.id,
      league_id: c.league_id,
      peso: c.peso,
      ativo: c.ativo,
    }));

    const { error } = await supabase
      .from('criterios_por_liga')
      .upsert(upserts, { onConflict: 'unique_criterio_liga' });


    if (error) throw error;
  }

  async salvarValores(dados: {
    player_id: string;
    league_id: string;
    criterio: string;
    valor: number;
  }[]) {
    const { data, error } = await supabase
      .from('player_criterios_por_liga')

      .upsert(dados, {
        onConflict: 'player_id,league_id,criterio',
      })
      .select(); // <- ESSENCIAL para retorno dos dados salvos

    if (error) throw error;
    return data;
  }



}
