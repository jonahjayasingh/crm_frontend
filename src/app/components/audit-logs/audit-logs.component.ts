import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AuditLog } from '../../services/api.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];
  searchTerm = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.api.getAuditLogs().subscribe({
      next: (data) => this.logs = data,
      error: () => {}
    });
  }

  getActionBadge(action: string): string {
    switch (action) {
      case 'CREATE': return 'badge-success';
      case 'UPDATE': return 'badge-warning';
      case 'DELETE': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  filteredLogs(): AuditLog[] {
    if (!this.searchTerm) return this.logs;
    const term = this.searchTerm.toLowerCase();
    return this.logs.filter(l => 
      l.performedBy.toLowerCase().includes(term) ||
      l.entityName.toLowerCase().includes(term) ||
      (l.details && l.details.toLowerCase().includes(term))
    );
  }
}
