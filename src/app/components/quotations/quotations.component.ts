import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Quotation, Customer } from '../../services/api.service';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quotations.component.html',
  styleUrl: './quotations.component.css'
})
export class QuotationsComponent implements OnInit {
  quotations: Quotation[] = [];
  customers: Customer[] = [];
  showModal = false;
  formData: Quotation = { quotationNumber: 'QT-' + Math.floor(1000 + Math.random() * 9000), customerId: 0, totalAmount: 0, status: 'DRAFT' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadQuotations();
    this.api.getCustomers().subscribe(c => this.customers = c);
  }
  loadQuotations() { this.api.getQuotations().subscribe(q => this.quotations = q); }
  openModal() {
    if (this.customers.length > 0) this.formData.customerId = this.customers[0].id!;
    this.formData.quotationNumber = 'QT-' + Math.floor(1000 + Math.random() * 9000);
    this.showModal = true;
  }
  closeModal() { this.showModal = false; }
  saveQuotation() { this.api.createQuotation(this.formData).subscribe(() => { this.loadQuotations(); this.closeModal(); }); }
  deleteQuotation(id: number) { if (confirm('Delete quotation?')) this.api.deleteQuotation(id).subscribe(() => this.loadQuotations()); }
}
