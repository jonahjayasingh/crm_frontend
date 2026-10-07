import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Invoice, Customer } from '../../services/api.service';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css'
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  customers: Customer[] = [];
  showModal = false;
  formData: Invoice = { invoiceNumber: 'INV-' + Math.floor(10000 + Math.random() * 90000), customerId: 0, amount: 0, status: 'UNPAID' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadInvoices();
    this.api.getCustomers().subscribe(c => this.customers = c);
  }
  loadInvoices() { this.api.getInvoices().subscribe(inv => this.invoices = inv); }
  openModal() {
    if (this.customers.length > 0) this.formData.customerId = this.customers[0].id!;
    this.formData.invoiceNumber = 'INV-' + Math.floor(10000 + Math.random() * 90000);
    this.showModal = true;
  }
  closeModal() { this.showModal = false; }
  saveInvoice() { this.api.createInvoice(this.formData).subscribe(() => { this.loadInvoices(); this.closeModal(); }); }
  deleteInvoice(id: number) { if (confirm('Delete invoice?')) this.api.deleteInvoice(id).subscribe(() => this.loadInvoices()); }
}
