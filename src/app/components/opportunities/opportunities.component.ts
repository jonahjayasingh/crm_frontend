import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Opportunity, Customer } from '../../services/api.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './opportunities.component.html',
  styleUrl: './opportunities.component.css'
})
export class OpportunitiesComponent implements OnInit {
  opportunities: Opportunity[] = [];
  customers: Customer[] = [];
  showModal = false;
  isLoading = false;
  formData: Opportunity = { title: '', amount: 0, stage: 'PROSPECTING', customerId: 0 };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadOpps();
    this.api.getCustomers().subscribe(c => {
      this.customers = c || [];
      this.cdr.detectChanges();
    });
  }

  loadOpps() {
    this.isLoading = true;
    this.api.getOpportunities().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (o) => {
        this.opportunities = o || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load opportunities:', err);
        this.cdr.detectChanges();
      }
    });
  }
  openModal() {
    if (this.customers.length > 0) this.formData.customerId = this.customers[0].id!;
    this.showModal = true;
  }
  closeModal() { this.showModal = false; }
  saveOpp() {
    this.api.createOpportunity(this.formData).subscribe(() => { this.loadOpps(); this.closeModal(); });
  }
  deleteOpp(id: number) {
    if (confirm('Delete opportunity?')) this.api.deleteOpportunity(id).subscribe(() => this.loadOpps());
  }
}
