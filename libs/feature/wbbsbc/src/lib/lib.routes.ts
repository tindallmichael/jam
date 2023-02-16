import { Route } from '@angular/router';

export const wbbsbcRoutes: Route[] = [
  { path: '', loadComponent: () => import('./wbbsbc/wbbsbc.component').then(c => c.WbbsbcComponent) },
];
