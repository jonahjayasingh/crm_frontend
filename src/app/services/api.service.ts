import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  name: string;
  role: string;
}

export interface Customer {
  id?: number;
  name: string;
  phoneNo: string;
  collegeName?: string;
  isInterested: boolean;
  note?: string;
  createAt?: string;
  updateAt?: string;
  userId?: number;
  userName?: string;
}

export interface Lead {
  id?: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED' | 'LOST';
  notes?: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
  createdAt?: string;
}

export interface Opportunity {
  id?: number;
  title: string;
  amount: number;
  stage: 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  probability?: number;
  expectedCloseDate?: string;
  customerId: number;
  customerName?: string;
}

export interface TaskItem {
  id?: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
}

export interface Ticket {
  id?: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  customerId: number;
  customerName?: string;
  assignedToUserId?: number;
}

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category?: string;
}

export interface Quotation {
  id?: number;
  quotationNumber: string;
  customerId: number;
  customerName?: string;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil?: string;
  termsAndConditions?: string;
}

export interface Invoice {
  id?: number;
  invoiceNumber: string;
  customerId: number;
  customerName?: string;
  amount: number;
  status: 'UNPAID' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate?: string;
  dueDate?: string;
}

export interface EventItem {
  id?: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  eventType?: 'MEETING' | 'DEMO' | 'FOLLOW_UP' | 'WEBINAR' | 'CONFERENCE';
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  customerId?: number;
  customerName?: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
}

export interface DashboardMetrics {
  role: string;
  totalCustomers: number;
  totalLeads: number;
  totalOpportunities: number;
  totalTasks: number;
  openTickets: number;
  totalProducts: number;
  totalQuotations: number;
  totalInvoices: number;
  totalEvents: number;
  totalPipelineValue: number;
  totalRevenueCollected: number;
  myAssignedLeads: number;
  myPendingTasks: number;
  myOpenTickets: number;
}

export interface AuditLog {
  id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityName: string;
  entityId: number;
  performedBy: string;
  details: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders({'Content-Type': 'application/json'});
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Auth
  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data);
  }

  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, data);
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, { refreshToken });
  }

  // Dashboard
  getDashboard(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.baseUrl}/dashboard`, { headers: this.getHeaders() });
  }

  // Audit Logs (ADMIN ONLY)
  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/audit-logs`, { headers: this.getHeaders() });
  }

  // Customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`, { headers: this.getHeaders() });
  }
  createCustomer(c: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, c, { headers: this.getHeaders() });
  }
  updateCustomer(id: number, c: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/customers/${id}`, c, { headers: this.getHeaders() });
  }
  deleteCustomer(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/customers/${id}`, { headers: this.getHeaders(), responseType: 'text' });
  }

  // Leads
  getLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.baseUrl}/leads`, { headers: this.getHeaders() });
  }
  createLead(lead: Lead): Observable<Lead> {
    return this.http.post<Lead>(`${this.baseUrl}/leads`, lead, { headers: this.getHeaders() });
  }
  updateLead(id: number, lead: Lead): Observable<Lead> {
    return this.http.put<Lead>(`${this.baseUrl}/leads/${id}`, lead, { headers: this.getHeaders() });
  }
  deleteLead(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/leads/${id}`, { headers: this.getHeaders(), responseType: 'text' });
  }

  // Opportunities
  getOpportunities(): Observable<Opportunity[]> {
    return this.http.get<Opportunity[]>(`${this.baseUrl}/opportunities`, { headers: this.getHeaders() });
  }
  createOpportunity(opp: Opportunity): Observable<Opportunity> {
    return this.http.post<Opportunity>(`${this.baseUrl}/opportunities`, opp, { headers: this.getHeaders() });
  }
  updateOpportunity(id: number, opp: Opportunity): Observable<Opportunity> {
    return this.http.put<Opportunity>(`${this.baseUrl}/opportunities/${id}`, opp, { headers: this.getHeaders() });
  }
  deleteOpportunity(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/opportunities/${id}`, { headers: this.getHeaders(), responseType: 'text' });
  }

  // Tasks
  getTasks(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(`${this.baseUrl}/tasks`, { headers: this.getHeaders() });
  }
  createTask(task: TaskItem): Observable<TaskItem> {
    return this.http.post<TaskItem>(`${this.baseUrl}/tasks`, task, { headers: this.getHeaders() });
  }
  updateTask(id: number, task: TaskItem): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.baseUrl}/tasks/${id}`, task, { headers: this.getHeaders() });
  }
  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tasks/${id}`, { headers: this.getHeaders(), responseType: 'text' });
  }

  // Tickets
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets`, { headers: this.getHeaders() });
  }
  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/tickets`, ticket, { headers: this.getHeaders() });
  }
  updateTicket(id: number, ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}/tickets/${id}`, ticket, { headers: this.getHeaders() });
  }
  deleteTicket(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tickets/${id}`, { headers: this.getHeaders(), responseType: 'text' });
  }

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`, { headers: this.getHeaders() });
  }
  createProduct(prod: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, prod, { headers: this.getHeaders() });
  }
  updateProduct(id: number, prod: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, prod, { headers: this.getHeaders() });
  }
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}`, { headers: this.getHeaders(), responseType: 'text' });
  }

  // Quotations
  getQuotations(): Observable<Quotation[]> {
    return this.http.get<Quotation[]>(`${this.baseUrl}/quotations`, { headers: this.getHeaders() });
  }
  createQuotation(q: Quotation): Observable<Quotation> {
    return this.http.post<Quotation>(`${this.baseUrl}/quotations`, q, { headers: this.getHeaders() });
  }
  updateQuotation(id: number, q: Quotation): Observable<Quotation> {
    return this.http.put<Quotation>(`${this.baseUrl}/quotations/${id}`, q, { headers: this.getHeaders() });
  }
  deleteQuotation(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/quotations/${id}`, { headers: this.getHeaders(), responseType: 'text' });
  }

  // Invoices
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices`, { headers: this.getHeaders() });
  }
  createInvoice(inv: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/invoices`, inv, { headers: this.getHeaders() });
  }
  updateInvoice(id: number, inv: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.baseUrl}/invoices/${id}`, inv, { headers: this.getHeaders() });
  }
  deleteInvoice(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/invoices/${id}`, { headers: this.getHeaders(), responseType: 'text' });
  }

  // Events
  getEvents(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${this.baseUrl}/events`, { headers: this.getHeaders() });
  }
  createEvent(event: EventItem): Observable<EventItem> {
    return this.http.post<EventItem>(`${this.baseUrl}/events`, event, { headers: this.getHeaders() });
  }
  updateEvent(id: number, event: EventItem): Observable<EventItem> {
    return this.http.put<EventItem>(`${this.baseUrl}/events/${id}`, event, { headers: this.getHeaders() });
  }
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/events/${id}`, { headers: this.getHeaders(), responseType: 'text' });
  }
}
