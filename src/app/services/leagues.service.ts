// leagues.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Leagues } from '../models/leagues.model';
import { supabase } from '../core/supabase/supabase.client';
import { SupabaseClient } from '@supabase/supabase-js';


@Injectable({
  providedIn: 'root'
})
export class LeaguesService {
  private supabase: SupabaseClient = supabase;

  private leagues: Leagues[] = [];

  constructor() { }

  async getAllLeagues(): Promise<Leagues[]> {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

async getLeagueById(id: string): Promise<Leagues | null> {
  const { data, error } = await this.supabase
    .from('leagues')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

}