import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://verssat.supabase.co',
      'jyiqaftpqikqqvfrojiu'
    );
  }

  async getPlayers(): Promise<Player[]> {
    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar jogadores:', error.message);
      return [];
    }

    return data as Player[];
  }

  async add(player: Player): Promise<void> {
    const { error } = await this.supabase
      .from('players')
      .insert([player]);

    if (error) {
      console.error('Erro ao adicionar jogador:', error.message);
    }
  }

  async update(player: Player): Promise<void> {
    const { error } = await this.supabase
      .from('players')
      .update(player)
      .eq('id', player.id);

    if (error) {
      console.error('Erro ao atualizar jogador:', error.message);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir jogador:', error.message);
    }
  }

  async clearAll(): Promise<void> {
    const { error } = await this.supabase
      .from('players')
      .delete()
      .neq('id', '');

    if (error) {
      console.error('Erro ao limpar jogadores:', error.message);
    }
  }
}
