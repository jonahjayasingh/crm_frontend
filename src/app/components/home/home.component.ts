import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

interface ModuleHighlight {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  icon: string;
  statsLabel: string;
  statsValue: string;
  features: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  activeTab: string = 'leads';
  activeWorkflowStep: number = 1;
  currentYear: number = new Date().getFullYear();

  modules: ModuleHighlight[] = [
    {
      id: 'leads',
      tag: '01 / ACQUISITION',
      title: 'Lead Pipeline & Conversion Matrix',
      subtitle: 'Track incoming prospects, score lead potential, and convert prospects directly to customer accounts.',
      icon: 'fa-user-check',
      statsLabel: 'Active Pipeline Lead Conversion Rate',
      statsValue: '68.4%',
      features: ['Lead status classification (NEW, CONTACTED, QUALIFIED)', 'Direct conversion into Customer records', 'Source attribution & contact history timeline']
    },
    {
      id: 'deals',
      tag: '02 / REVENUE',
      title: 'Commercial Opportunities & Quotations',
      subtitle: 'Manage deal stages from discovery to negotiation, generating binding product quotes with live price rules.',
      icon: 'fa-chart-line',
      statsLabel: 'Average Deal Velocity',
      statsValue: '14 Days',
      features: ['Stage-by-stage pipeline tracking (QUALIFICATION, PROPOSAL, CLOSED_WON)', 'Product catalog line items with quantity & unit prices', 'Instant quote generation and approval workflow']
    },
    {
      id: 'support',
      tag: '03 / RETENTION',
      title: 'Operations Tasks & Helpdesk Tickets',
      subtitle: 'Connect customer accounts directly with support tickets and internal team tasks for rapid issue resolution.',
      icon: 'fa-headset',
      statsLabel: 'Resolution SLA Compliance',
      statsValue: '99.2%',
      features: ['Priority dispatching (LOW, MEDIUM, HIGH, URGENT)', 'Automated state machine (OPEN, IN_PROGRESS, RESOLVED, CLOSED)', 'Direct linking between client records, tickets, and tasks']
    },
    {
      id: 'finance',
      tag: '04 / GOVERNANCE',
      title: 'Invoicing & Immutable Audit Logging',
      subtitle: 'Turn approved quotes into billing invoices while recording every single write operation in secure audit logs.',
      icon: 'fa-file-shield',
      statsLabel: 'Audit Event Records Captured',
      statsValue: '100% Immutable',
      features: ['Automated invoice creation from accepted quotes', 'Payment status tracking (UNPAID, PAID, OVERDUE)', 'Granular Admin audit logs recording entity modifications']
    }
  ];

  activeModule: ModuleHighlight = this.modules[0];

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
    this.activeModule = this.modules.find(m => m.id === this.activeTab) || this.modules[0];
  }

  setWorkflowStep(step: number) {
    this.activeWorkflowStep = step;
  }

  goToApp() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
