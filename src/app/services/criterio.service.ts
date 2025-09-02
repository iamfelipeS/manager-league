import { Injectable, signal } from '@angular/core';
import { supabase } from '../core/supabase/supabase.client';
import { CriterioBase, CriterioDaLiga } from '../models/criterios.model';

interface CriterioPorLiga {
  id?: number;
  criterio_id: number;
  league_id: string;
  peso: number;
  ativo: boolean;
  nome?: string;
}
//gerencia critérios da liga (estrutura e visibilidade)
@Injectable({ providedIn: 'root' })
export class CriterioService {
  readonly criterios = signal<CriterioDaLiga[]>([]);

  async getCriteriosBase(): Promise<CriterioBase[]> {
    const { data, error } = await supabase
      .from('criterios')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async getCriteriosDaLiga(leagueId: string): Promise<CriterioDaLiga[]> {
    const { data, error } = await supabase
      .from('criterios_por_liga')
      .select('*, criterios (nome)')
      .eq('league_id', leagueId)
      .order('peso', { ascending: true });

    if (error) throw error;

    const mapped: CriterioDaLiga[] = (data ?? []).map((row: any) => ({
      id: row.criterio_id,
      nome: row.criterios.nome,
      peso: row.peso,
      ativo: row.ativo,
      league_id: row.league_id,
      mostrar_na_tabela: row.mostrar_na_tabela ?? true,
    }));
console.log('Criterios da liga:', data);

    this.criterios.set(mapped);
    return mapped;
  }

  async createCriterio(nome: string): Promise<CriterioBase> {
    const { data, error } = await supabase
      .from('criterios')
      .insert({ nome })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async salvarCriteriosDaLiga(league_id: string, criterios: CriterioDaLiga[]): Promise<void> {
    const payload = criterios.map(c => ({
      criterio_id: c.id,
      league_id,
      peso: c.peso,
      ativo: c.ativo ?? true,
      mostrar_na_tabela: c.mostrar_na_tabela ?? true,
    }));

    const { error } = await supabase
      .from('criterios_por_liga')
      .upsert(payload, { onConflict: 'criterio_id,league_id' });

    if (error) throw error;
  }

}

