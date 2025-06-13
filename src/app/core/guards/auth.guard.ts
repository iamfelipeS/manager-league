import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard = (roles: Array<'super' | 'admin' | 'guest'>) => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

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
