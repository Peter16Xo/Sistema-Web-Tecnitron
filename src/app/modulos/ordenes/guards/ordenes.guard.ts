import { CanActivateFn } from '@angular/router';

export const ordenesGuard: CanActivateFn = (route, state) => {
  return true;
};
