import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard = (roles: Array<'super' | 'admin' | 'guest'>) => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const currentUser = auth.currentUser();
  const currentRole = auth.role();

  if (!currentUser || currentRole === null || !roles.includes(currentRole)) {
    router.navigateByUrl('/login');
    return false;
  }

  return true;
};
