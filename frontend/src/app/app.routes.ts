import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./pages/portfolio/portfolio.page').then((m) => m.PortfolioPage),
  },
  {
    path: 'portfolio/:slug',
    loadComponent: () => import('./pages/portfolio-detail/portfolio-detail.page').then((m) => m.PortfolioDetailPage),
  },
  {
    path: 'sluzby',
    loadComponent: () => import('./pages/services/services.page').then((m) => m.ServicesPage),
  },
  {
    path: 'o-studiu',
    loadComponent: () => import('./pages/about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'dopyt',
    loadComponent: () => import('./pages/brief/brief.page').then((m) => m.BriefPage),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
