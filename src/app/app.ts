import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  title = 'Apex CRM';
  isStandalone = false;
  userName = 'User';
  userRole = 'EMPLOYEE';
  isAdmin = false;

  // Theme & Mobile Navigation State
  theme: 'light' | 'dark' = 'dark';
  isMobileSidebarOpen = false;

  private routerSub?: Subscription;

  constructor(public router: Router) {}

  ngOnInit() {
    this.initTheme();
    this.updateState();
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateState();
      this.closeMobileSidebar();
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.theme = savedTheme;
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = prefersDark ? 'dark' : 'light';
    }
    this.applyTheme();

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('app-theme')) {
          this.theme = e.matches ? 'dark' : 'light';
          this.applyTheme();
        }
      });
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('app-theme', this.theme);
    this.applyTheme();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  updateState() {
    const url = this.router.url;
    this.isStandalone = url === '/login' || url === '/' || url === '/home';
    this.userName = localStorage.getItem('user_name') || 'User';
    this.userRole = localStorage.getItem('user_role') || 'EMPLOYEE';
    this.isAdmin = this.userRole === 'ADMIN';
  }

  logout() {
    localStorage.clear();
    this.updateState();
    this.router.navigate(['/login']);
  }
}
