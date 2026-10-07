import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Lead } from '../../services/api.service';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.css'
})
export class LeadsComponent implements OnInit {
  leads: Lead[] = [];
  showModal = false;
  editingId: number | null = null;
  formData: Lead = { name: '', email: '', phone: '', status: 'NEW' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadLeads(); }
  loadLeads() { this.api.getLeads().subscribe(data => this.leads = data); }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'CONVERTED': case 'QUALIFIED': return 'badge-success';
      case 'NEW': return 'badge-info';
      case 'CONTACTED': return 'badge-purple';
      case 'LOST': return 'badge-danger';
      default: return 'badge-warning';
    }
  }

  openModal() { this.editingId = null; this.formData = { name: '', email: '', phone: '', status: 'NEW' }; this.showModal = true; }
  editLead(l: Lead) { this.editingId = l.id!; this.formData = { ...l }; this.showModal = true; }
  closeModal() { this.showModal = false; }
  saveLead() {
    if (this.editingId) {
      this.api.updateLead(this.editingId, this.formData).subscribe(() => { this.loadLeads(); this.closeModal(); });
    } else {
      this.api.createLead(this.formData).subscribe(() => { this.loadLeads(); this.closeModal(); });
    }
  }
  deleteLead(id: number) {
    if (confirm('Delete this lead?')) this.api.deleteLead(id).subscribe(() => this.loadLeads());
  }
}
