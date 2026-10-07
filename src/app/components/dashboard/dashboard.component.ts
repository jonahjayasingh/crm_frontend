import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, DashboardMetrics } from '../../services/api.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  metrics: DashboardMetrics | null = null;
  isLoading = false;
  userRole = 'EMPLOYEE';
  isExecutive = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateUserContext();
    this.loadMetrics();
  }

  updateUserContext() {
    this.userRole = localStorage.getItem('user_role') || 'EMPLOYEE';
    this.isExecutive = this.userRole === 'ADMIN' || this.userRole === 'MANAGER';
  }

  loadMetrics() {
    this.isLoading = true;
    this.api.getDashboard().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.metrics = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load dashboard metrics:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
