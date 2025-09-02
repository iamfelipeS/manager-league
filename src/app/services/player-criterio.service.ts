import { Injectable } from "@angular/core";
import { supabase } from "../core/supabase/supabase.client";
import { PlayerCriterioValor } from "../models/criterios.model";



@Injectable({ providedIn: 'root' })
export class PlayerCriterioService {
  async getValoresPorLiga(leagueId: string): Promise<PlayerCriterioValor[]> {
    const { data, error } = await supabase
      .from('player_criterios_por_liga')
      .select('*')
      .eq('league_id', leagueId);

    if (error) throw error;
    return data ?? [];
  }

  async salvarValores(valores: PlayerCriterioValor[]): Promise<PlayerCriterioValor[]> {
    const { data, error } = await supabase
      .from('player_criterios_por_liga')
      .upsert(valores, {
        onConflict: 'player_id,league_id,criterio',
      })
      .select();

    if (error) throw error;
    return data;
  }
}
