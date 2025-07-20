import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../enviroments/enviroment';
import { Profile, Role } from '../models/profile.model';
import { ToasterService } from './toaster.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ✅ Instância Supabase
  private supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
    },
  });

  // ✅ Signals reativos
  readonly profile = signal<Profile | null>(null);
  readonly role = computed(() => this.profile()?.role ?? null);
  readonly loading = signal(false);

  // ✅ Injeção moderna
  private toaster = inject(ToasterService);

  // ✅ Dispara a primeira carga da sessão ao usar o serviço
  private _init = signal(true);
  private _startup = effect(() => {
    if (this._init()) this.loadUserSession();
  });

  /**
   * 🔄 Recupera sessão ativa e perfil do usuário (id, role, avatar etc)
   */
  async loadUserSession(): Promise<void> {
    this.loading.set(true);

    const { data: { session }, error } = await this.supabase.auth.getSession();

    if (error || !session) {
      this.profile.set(null);
      this.loading.set(false);
      return;
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      this.toaster.error('Erro ao carregar perfil do usuário');
      this.profile.set(null);
    } else {
      this.profile.set(profile);
    }

    this.loading.set(false);
  }

  /**
   * 🔐 Realiza login e atualiza session/profile
   */
  async login(email: string, password: string) {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    await this.loadUserSession();
    return error;
  }

  /**
   * 🧾 Cadastra novo usuário no Supabase Auth
   */
  async register(email: string, password: string) {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirmar-conta`
      }
    });
    return error;
  }

  /**
   * 🔄 Reinicia a senha via email
   */
  async sendPasswordReset(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    });
  }

  /**
   * 🔓 Encerra a sessão atual
   */
  async logout() {
    await this.supabase.auth.signOut();
    this.profile.set(null);
  }

  /**
   * 🖊 Atualiza os dados do perfil (nome, avatar etc)
   */
  async updateProfile(data: { username?: string; avatar_url?: string }) {
    const userId = this.profile()?.id;
    if (!userId) return;

    const { error } = await this.supabase.from('profiles').upsert({
      id: userId,
      ...data,
    });

    if (!error) await this.loadUserSession();
    return error;
  }

  /**
   * 🔧 Atualiza o papel (role) de um usuário específico
   */
  async updateRole(userId: string, newRole: Role) {
    const { error } = await this.supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      const user = this.profile();
      if (user?.id === userId) {
        this.profile.set({ ...user, role: newRole });
      }
    }

    return error;
  }

  /**
   * 📚 Lista todos os usuários (admin/super)
   */
  async getAllUsers(): Promise<Profile[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, username, role, avatar_url');

    if (error) {
      this.toaster.error('Erro ao buscar usuários');
      return [];
    }

    return data ?? [];
  }

  /**
   * 🛡 Define sessão a partir de token (ex: após redirect)
   */
  async setSessionWithHashToken(access_token: string, refresh_token: string) {
    return await this.supabase.auth.setSession({ access_token, refresh_token });
  }

  /**
   * 🔍 Retorna usuário bruto do Supabase (sem perfil)
   */
  async getCurrentRawUser() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  /**
   * 🧠 Retorna ID do usuário logado
   */
  userId(): string | null {
    return this.profile()?.id ?? null;
  }

  /**
   * 🔐 Retorna a role atual do usuário
   */
  userRole(): Role | null {
    return this.profile()?.role ?? null;
  }

  /**
   * 🧩 Helpers de role
   */
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

  /**
   * ✏️ Verifica se o usuário pode editar uma liga
   */
  canEditLeague(league: any): boolean {
    if (!league) return false;
    if (this.isSuper()) return true;

    if (this.isAdmin()) {
      return league.organizer?.some((org: any) => org.user_id === this.userId());
    }

    return false;
  }

  /**
   *  Verifica se o usuario pode ver botao/aba
   */
  canViewGenerateTab = computed(() => {
    const role = this.userRole();
    return role === 'super' || role === 'admin';
  });

}
