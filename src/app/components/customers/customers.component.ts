import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Customer } from '../../services/api.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomersList: Customer[] = [];
  searchTerm = '';
  showModal = false;
  editingId: number | null = null;
  isLoading = false;
  formData: Customer = { name: '', phoneNo: '', collegeName: '', isInterested: true, note: '' };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.isLoading = true;
    this.api.getCustomers().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.customers = data || [];
        try {
          this.applyFilter();
        } catch (err) {
          console.error('Error applying customer filter:', err);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange() {
    this.applyFilter();
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredCustomersList = this.customers;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCustomersList = this.customers.filter(c => 
      (c.name && c.name.toLowerCase().includes(term)) || 
      (c.collegeName && c.collegeName.toLowerCase().includes(term))
    );
  }

  openModal() {
    this.editingId = null;
    this.formData = { name: '', phoneNo: '', collegeName: '', isInterested: true, note: '' };
    this.showModal = true;
  }

  editCustomer(c: Customer) {
    this.editingId = c.id!;
    this.formData = { ...c };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCustomer() {
    if (this.editingId) {
      this.api.updateCustomer(this.editingId, this.formData).subscribe(() => {
        this.loadCustomers();
        this.closeModal();
      });
    } else {
      this.api.createCustomer(this.formData).subscribe(() => {
        this.loadCustomers();
        this.closeModal();
      });
    }
  }

  deleteCustomer(id: number) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.api.deleteCustomer(id).subscribe(() => this.loadCustomers());
    }
  }
}
