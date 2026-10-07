import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, TaskItem, Ticket } from '../../services/api.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  tasks: TaskItem[] = [];
  tickets: Ticket[] = [];
  pendingTasks: TaskItem[] = [];
  inProgressTasks: TaskItem[] = [];
  completedTasks: TaskItem[] = [];
  
  viewMode: 'board' | 'table' = 'board';
  isLoading = false;

  showModal = false;
  formData: TaskItem = { title: '', priority: 'MEDIUM', status: 'PENDING' };

  // Drag-and-drop state
  draggedTask: TaskItem | null = null;
  dragOverColumn: string | null = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTasks();
    this.loadTickets();
  }

  loadTasks() {
    this.isLoading = true;
    this.api.getTasks().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (t) => {
        this.tasks = t || [];
        try {
          this.updateCategorizedTasks();
        } catch (err) {
          console.error('Error updating categorized tasks:', err);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load tasks:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadTickets() {
    this.api.getTickets().subscribe({
      next: (t) => this.tickets = t || [],
      error: (err) => console.error('Failed to load tickets:', err)
    });
  }

  updateCategorizedTasks() {
    const list = this.tasks || [];
    this.pendingTasks = list.filter(t => t && (t.status || 'PENDING').toString().trim().toUpperCase() === 'PENDING');
    this.inProgressTasks = list.filter(t => t && (t.status || '').toString().trim().toUpperCase() === 'IN_PROGRESS');
    this.completedTasks = list.filter(t => t && (t.status || '').toString().trim().toUpperCase() === 'COMPLETED');
  }

  // HTML5 Drag and Drop handlers
  onDragStart(event: DragEvent, task: TaskItem) {
    this.draggedTask = task;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify(task));
    }
  }

  onDragOver(event: DragEvent, status: string) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverColumn = status;
  }

  onDragLeave(event: DragEvent) {
    this.dragOverColumn = null;
  }

  onDrop(event: DragEvent, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
    event.preventDefault();
    this.dragOverColumn = null;

    if (this.draggedTask && this.draggedTask.id && this.draggedTask.status !== newStatus) {
      const updated: TaskItem = { ...this.draggedTask, status: newStatus };
      this.api.updateTask(this.draggedTask.id, updated).subscribe({
        next: () => {
          this.loadTasks();
          this.draggedTask = null;
        },
        error: (err) => console.error('Failed to move task status', err)
      });
    }
  }

  // Drag task to create ticket
  onDropToTicket(event: DragEvent) {
    event.preventDefault();
    this.dragOverColumn = null;

    if (this.draggedTask) {
      const taskToConvert = this.draggedTask;
      if (confirm(`Create support ticket from task "${taskToConvert.title}"?`)) {
        // Create ticket from task
        const newTicket: Ticket = {
          subject: taskToConvert.title,
          description: taskToConvert.description || `Converted from task: ${taskToConvert.title}`,
          status: 'OPEN',
          priority: taskToConvert.priority === 'URGENT' ? 'CRITICAL' : taskToConvert.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
          customerId: 1
        };

        this.api.createTicket(newTicket).subscribe({
          next: () => {
            this.loadTickets();
            this.draggedTask = null;
          },
          error: (err) => console.error('Failed to create ticket from task', err)
        });
      }
    }
  }

  getPriorityBadge(priority: string) {
    switch (priority) {
      case 'URGENT': case 'HIGH': return 'badge-danger';
      case 'MEDIUM': return 'badge-warning';
      default: return 'badge-info';
    }
  }

  getStatusBadge(status: string) {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'IN_PROGRESS': return 'badge-purple';
      default: return 'badge-warning';
    }
  }

  openModal() {
    this.formData = { title: '', priority: 'MEDIUM', status: 'PENDING' };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveTask() {
    this.api.createTask(this.formData).subscribe(() => {
      this.loadTasks();
      this.closeModal();
    });
  }

  deleteTask(id: number) {
    if (confirm('Delete task?')) {
      this.api.deleteTask(id).subscribe(() => this.loadTasks());
    }
  }
}
