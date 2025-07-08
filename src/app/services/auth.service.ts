import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../enviroments/enviroment';
import { Profile, Role } from '../models/profile.model';
import { ToasterService } from './toaster.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  currentUser = signal<Profile | null>(null);
  role = signal<'super' | 'admin' | 'guest' | null>(null);

 readonly profile = signal<Profile | null>(null);
  readonly loading = signal(false);

  constructor(private toaster: ToasterService) {
    this.loadSession();
  }

  // Retorna o papel atual
  userRole(): string | null {
    return this.profile()?.role ?? null;
  }

  // Retorna o ID do usuário atual
  userId(): string | null {
    return this.profile()?.id ?? null;
  }

  isSuper(): boolean {
    return this.userRole() === 'super';
  }

  isAdmin(): boolean {
    return this.userRole() === 'admin';
  }

  isGuest(): boolean {
    return this.userRole() === null;
  }

  isPrivileged(): boolean {
    return this.isSuper() || this.isAdmin();
  }

  // Verifica se o usuário pode editar uma liga específica
  canEditLeague(league: any): boolean {
    if (!league) return false;

    if (this.isSuper()) return true;

    if (this.isAdmin()) {
      const userId = this.userId();
      return league.organizer?.some((org: any) => org.user_id === userId);
    }

    return false;
  }

  // Carrega a sessão atual
  async loadSession(): Promise<void> {
    this.loading.set(true);

    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();

    if (error) {
      this.toaster.error('Erro ao recuperar sessão');
      this.loading.set(false);
      return;
    }

    if (!session) {
      this.profile.set(null);
      this.loading.set(false);
      return;
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

console.log('[Auth] Recuperando perfil para usuário:', session.user.id);

if (profileError) {
  console.error('[Auth] Erro ao carregar perfil:', profileError.message);
} else {
  console.log('[Auth] Perfil carregado:', profile);
}


    this.profile.set(profile);
    this.loading.set(false);
  }

  async refreshUserSession() {
    const { data } = await this.supabase.auth.getUser();
    if (data.user) {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id, username, role, avatar_url')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        this.currentUser.set(profile);
        this.role.set(profile.role);
      }
    }
  }

  async login(email: string, password: string) {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    await this.refreshUserSession();
    return error;
  }

  async register(email: string, password: string) {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/confirmar-conta'
      }
    });
    return error;
  }

  async sendPasswordReset(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/nova-senha',
    });
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
    this.role.set(null);
  }

  async updateProfile(data: { username?: string; avatar_url?: string }) {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    const { error } = await this.supabase.from('profiles').upsert({
      id: userId,
      ...data,
    });

    return error;
  }

  async updateRole(userId: string, newRole: Role) {
    const { error } = await this.supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      this.role.set(newRole);
    }

    return error;
  }

  async getAllUsers(): Promise<Profile[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, username, role, avatar_url');

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }

    return data as Profile[];
  }

  async setSessionWithHashToken(access_token: string, refresh_token: string) {
    return await this.supabase.auth.setSession({ access_token, refresh_token });
  }

  async getCurrentRawUser() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }
}
