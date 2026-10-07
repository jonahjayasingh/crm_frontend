import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Ticket, Customer } from '../../services/api.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css'
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  customers: Customer[] = [];
  showModal = false;
  formData: Ticket = { subject: '', description: '', status: 'OPEN', priority: 'MEDIUM', customerId: 0 };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadTickets();
    this.api.getCustomers().subscribe(c => this.customers = c);
  }
  loadTickets() { this.api.getTickets().subscribe(t => this.tickets = t); }
  openModal() {
    if (this.customers.length > 0) this.formData.customerId = this.customers[0].id!;
    this.showModal = true;
  }
  closeModal() { this.showModal = false; }
  saveTicket() { this.api.createTicket(this.formData).subscribe(() => { this.loadTickets(); this.closeModal(); }); }
  deleteTicket(id: number) { if (confirm('Delete ticket?')) this.api.deleteTicket(id).subscribe(() => this.loadTickets()); }
}
