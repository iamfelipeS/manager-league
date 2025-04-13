import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private supabaseUrl: string = 'https://jyiqaftpqikqqvfrojiu.supabase.co';
  private supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aXFhZnRwcWlrcXF2ZnJvaml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDM4MzUsImV4cCI6MjA1OTc3OTgzNX0.zn1sTE9DrWjSloORfCi67TLqfm1wM5SEtXzP7MIGBgU';
  private supabase = createClient(this.supabaseUrl, this.supabaseKey);
  private players = signal<Player[]>([]);
  
  async getPlayers(): Promise<Player[]> {
    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .order('name', { ascending: true });
  
    if (error) throw error;
    return data as Player[];
  }
  
  async addPlayer(player: Player) {
    const { error } = await this.supabase.from('players').insert([player]);
    if (error) throw error;
  }
  
  async updatePlayer(player: Player) {
    const { error } = await this.supabase
      .from('players')
      .update(player)
      .eq('id', player.id);
  
    if (error) throw error;
  }
  
  async deletePlayer(id: string) {
    const { error } = await this.supabase
      .from('players')
      .delete()
      .eq('id', id);
  
    if (error) throw error;
  }
}  