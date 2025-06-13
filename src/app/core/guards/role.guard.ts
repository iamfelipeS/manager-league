import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard = (roles: Array<'super' | 'admin' | 'guest'>) => async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // aguarda sessão
  if (auth.loading()) {
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (!auth.loading()) {
          clearInterval(interval);
          resolve(true);
        }
      }, 50);
    });
  }

  const role = auth.userRole();

  if (!role && !roles.includes('guest')) {
    router.navigateByUrl('/login');
    return false;
  }

  if (role && !roles.includes(role as 'super' | 'admin')) {
    router.navigateByUrl('/login');
    return false;
  }

  return true;
};

