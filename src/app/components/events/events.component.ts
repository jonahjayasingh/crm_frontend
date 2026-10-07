import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, EventItem, Customer } from '../../services/api.service';
import { finalize } from 'rxjs/operators';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: EventItem[];
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {
  events: EventItem[] = [];
  customers: Customer[] = [];
  loading = false;
  viewMode: 'month' | 'list' = 'month';

  // Calendar state
  currentDate = new Date();
  monthDays: CalendarDay[] = [];
  selectedDayEvents: EventItem[] = [];
  selectedDateText: string = '';

  // Modal / Form state
  showModal = false;
  isEditing = false;
  currentEvent: EventItem = this.getEmptyEvent();
  selectedEventForDetails: EventItem | null = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {
    this.generateCalendar();
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadCustomers();
  }

  loadEvents(): void {
    this.loading = true;
    this.api.getEvents().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.events = data || [];
        try {
          this.generateCalendar();
        } catch (err) {
          console.error('Error generating calendar:', err);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load events', err);
        try {
          this.generateCalendar();
        } catch (e) {}
        this.cdr.detectChanges();
      }
    });
  }

  loadCustomers(): void {
    this.api.getCustomers().subscribe({
      next: (data) => this.customers = data || [],
      error: (err) => console.error('Failed to load customers', err)
    });
  }

  getEmptyEvent(): EventItem {
    const now = new Date();
    const startStr = this.formatDateForInput(now);
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    const endStr = this.formatDateForInput(end);

    return {
      title: '',
      description: '',
      startTime: startStr,
      endTime: endStr,
      location: '',
      eventType: 'MEETING',
      status: 'SCHEDULED'
    };
  }

  formatDateForInput(date: Date): string {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  formatDateKey(date: Date): string {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  // Calendar Grid Generation
  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const today = new Date();

    const days: CalendarDay[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: this.isSameDate(date, today),
        events: this.getEventsForDate(date)
      });
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: this.isSameDate(date, today),
        events: this.getEventsForDate(date)
      });
    }

    // Next month padding to fill grid
    const remainingGridCells = (days.length <= 35 ? 35 : 42) - days.length;
    for (let i = 1; i <= remainingGridCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: this.isSameDate(date, today),
        events: this.getEventsForDate(date)
      });
    }

    this.monthDays = days;
  }

  getEventsForDate(date: Date): EventItem[] {
    const dateStr = this.formatDateKey(date);
    return (this.events || []).filter(e => {
      if (!e.startTime) return false;
      const rawStr = String(e.startTime);
      const eDateStr = rawStr.length >= 10 ? rawStr.substring(0, 10) : '';
      if (eDateStr === dateStr) return true;

      const eventLocalDate = new Date(e.startTime);
      if (!isNaN(eventLocalDate.getTime())) {
        return this.formatDateKey(eventLocalDate) === dateStr;
      }
      return false;
    });
  }

  isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  today(): void {
    this.currentDate = new Date();
    this.generateCalendar();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDayEvents = day.events;
    this.selectedDateText = day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Event Modal Actions
  openCreateModal(initialDate?: Date): void {
    this.isEditing = false;
    this.currentEvent = this.getEmptyEvent();
    if (initialDate) {
      const dateStr = this.formatDateKey(initialDate);
      this.currentEvent.startTime = `${dateStr}T09:00`;
      this.currentEvent.endTime = `${dateStr}T10:00`;
    }
    this.showModal = true;
  }

  openEditModal(ev: EventItem, e?: MouseEvent): void {
    if (e) e.stopPropagation();
    this.isEditing = true;
    this.currentEvent = { ...ev };

    // Safely format LocalDateTime string for datetime-local input
    if (this.currentEvent.startTime) {
      const d = new Date(this.currentEvent.startTime);
      if (!isNaN(d.getTime())) {
        this.currentEvent.startTime = this.formatDateForInput(d);
      } else if (this.currentEvent.startTime.length >= 16) {
        this.currentEvent.startTime = this.currentEvent.startTime.slice(0, 16);
      }
    }
    if (this.currentEvent.endTime) {
      const d = new Date(this.currentEvent.endTime);
      if (!isNaN(d.getTime())) {
        this.currentEvent.endTime = this.formatDateForInput(d);
      } else if (this.currentEvent.endTime.length >= 16) {
        this.currentEvent.endTime = this.currentEvent.endTime.slice(0, 16);
      }
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveEvent(): void {
    if (!this.currentEvent.title || !this.currentEvent.startTime || !this.currentEvent.endTime) {
      alert('Please fill in title, start time, and end time.');
      return;
    }

    const start = new Date(this.currentEvent.startTime);
    const end = new Date(this.currentEvent.endTime);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
      alert('End time cannot be before start time.');
      return;
    }

    if (this.currentEvent.customerId) {
      const custIdNum = Number(this.currentEvent.customerId);
      const cust = this.customers.find(c => Number(c.id) === custIdNum);
      if (cust) {
        this.currentEvent.customerId = custIdNum;
        this.currentEvent.customerName = cust.name;
      }
    }

    if (this.isEditing && this.currentEvent.id) {
      this.api.updateEvent(this.currentEvent.id, this.currentEvent).subscribe({
        next: () => {
          this.loadEvents();
          this.closeModal();
        },
        error: (err) => console.error('Failed to update event', err)
      });
    } else {
      this.api.createEvent(this.currentEvent).subscribe({
        next: () => {
          this.loadEvents();
          this.closeModal();
        },
        error: (err) => console.error('Failed to create event', err)
      });
    }
  }

  deleteEvent(id?: number, e?: MouseEvent): void {
    if (e) e.stopPropagation();
    if (!id) return;
    if (confirm('Are you sure you want to cancel and delete this scheduled event?')) {
      this.api.deleteEvent(id).subscribe({
        next: () => this.loadEvents(),
        error: (err) => console.error('Failed to delete event', err)
      });
    }
  }

  viewEventDetails(ev: EventItem, e: MouseEvent): void {
    e.stopPropagation();
    this.selectedEventForDetails = ev;
  }

  closeDetails(): void {
    this.selectedEventForDetails = null;
  }
}
