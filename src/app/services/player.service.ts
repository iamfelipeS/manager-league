import { Injectable, signal } from '@angular/core';
import { Player, PlayerFlag } from '../models/player.model';
import { supabase } from '../core/supabase/supabase.client';
import { SupabaseClient } from '@supabase/supabase-js';

type PlayerWithJoin = Player & {
  pontua: boolean;
  trofeus?: number;
  player_flags?: {
    flag_id: number;
    flags: PlayerFlag;
  }[];
  avatar_url?: string | null;
};

@Injectable({ providedIn: 'root' })
export class PlayerService {

  private players = signal<Player[]>([]);
  private supabase: SupabaseClient = supabase;

    async getPlayers(): Promise<Player[]> {
    const { data, error } = await this.supabase
      .from('players')
      .select('*, player_flags:player_flags(flag_id, flags(id, name, affectsTeamGeneration))')

    if (error) throw error;

    const players = (data as PlayerWithJoin[] ?? []).map(player => {
      const { player_flags, avatar_url, pontua, ...rest } = player;

      return {
        ...rest,
        pontua: pontua ?? false,
        avatarUrl: avatar_url ?? null,
        flags: player_flags?.map(pf => pf.flags) ?? [],
      };
    });

    return players;
  }

  async getPlayersByLeague(leagueId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*, player_flags:player_flags(flag_id, flags(id, name, affectsTeamGeneration))')
      .eq('league_id', leagueId);

    if (error) throw error;

    return (data as PlayerWithJoin[] ?? []).map(player => {
      const { player_flags, avatar_url, pontua, trofeus, ...rest } = player;
      return {
        ...rest,
        pontua: pontua ?? false,
        trofeus: trofeus ?? 0,
        avatarUrl: avatar_url ?? null,
        flags: player_flags?.map(pf => pf.flags) ?? [],
      };
    });
  }

  async addPlayer(player: PlayerWithJoin): Promise<void> {
    const { flags, player_flags, avatarUrl, ...playerData } = player;

    const insertData = {
      ...playerData,
      pontua: player.pontua ?? false,
      league_id: player.league_id ?? null,
      avatar_url: avatarUrl ?? null,
    };

    const { error } = await this.supabase
      .from('players')
      .insert([insertData]);

    if (error) throw error;
  }

  async updatePlayer(player: PlayerWithJoin): Promise<void> {
    const { flags, player_flags, avatarUrl, ...rest } = player;

    const updatePayload = {
      ...rest,
      pontua: player.pontua ?? false,
      avatar_url: avatarUrl ?? null,
    };

    console.log('Enviando para update:', updatePayload);

    const { error } = await this.supabase
      .from('players')
      .update(updatePayload)
      .eq('id', player.id);

    if (error) throw error;
  }


  async deletePlayer(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('players')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async getPlayersPontuaveis(leagueId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*, player_flags:player_flags(flag_id, flags(id, name, affectsTeamGeneration))')
      .eq('pontua', true)
      .eq('league_id', leagueId);

    if (error) throw error;

    return (data as PlayerWithJoin[] ?? []).map(player => {
      const { player_flags, avatar_url, pontua, trofeus, ...rest } = player;

      return {
        ...rest,
        pontua: pontua ?? false,
        trofeus: trofeus ?? 0,
        avatarUrl: avatar_url ?? null,
        flags: player_flags?.map(pf => pf.flags) ?? [],
      };
    });
  }

  async update(player: Player): Promise<void> {
    const { error } = await supabase
      .from('players')
      .update({
        name: player.name,
        posicao: player.posicao,
        qualidade: player.qualidade,
        velocidade: player.velocidade,
        fase: player.fase,
        movimentacao: player.movimentacao,
        avatar_url: player.avatarUrl,
        pontua: player.pontua,
      })
      .eq('id', player.id);

    if (error) throw error;
  }


  // AVATAR // 
  async updateAvatar(player: Player, file: File): Promise<void> {
    const fileExt = file.name.split('.').pop();
    const filePath = `players/${player.id}/avatar.${fileExt}`; // novo caminho organizado

    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Erro ao fazer upload do avatar');
    }

    const { data: publicData } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!publicData) {
      throw new Error('Erro ao obter URL pública do avatar');
    }

    const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await this.supabase
      .from('players')
      .update({ avatar_url: avatarUrl })
      .eq('id', player.id);

    if (updateError) {
      console.error('Update player error:', updateError);
      throw new Error('Erro ao atualizar o jogador com avatar');
    }

    player.avatarUrl = avatarUrl;
  }


}