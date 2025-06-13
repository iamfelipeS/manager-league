import { Injectable, signal } from '@angular/core';
import { Leagues } from '../models/leagues.model';
import { supabase } from '../core/supabase/supabase.client';
import { SupabaseClient } from '@supabase/supabase-js';


@Injectable({
  providedIn: 'root'
})
export class LeaguesService {
  private supabase: SupabaseClient = supabase;

  private leagues = signal<Leagues[]>([]);

  constructor() { }

  async getAllLeagues(): Promise<Leagues[]> {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async getLeagueById(id: string): Promise<Leagues> {
    const { data, error } = await supabase
      .from('leagues')
      .select('*, organizer:organizer(user_id)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error('Erro ao buscar liga por ID: ' + error.message);
    }

    return data as Leagues;
  }
}