import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  searchControl = new FormControl('');
  filteredTasks$ = this.taskService.getTasks().pipe(
    map(tasks => this.filterTasks(tasks, this.searchControl.value || ''))
  );

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(50),
      distinctUntilChanged(),
      startWith('')
    ).subscribe(searchTerm => {
      this.filteredTasks$ = this.taskService.getTasks().pipe(
        map(tasks => this.filterTasks(tasks, searchTerm || ''))
      );
    });
  }

  isOverdue(task: Task): boolean {
    return new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
  }

  deleteTask(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.taskService.deleteTask(id);
    }
  }

  private filterTasks(tasks: Task[], searchTerm: string): Task[] {
    if (!searchTerm) return tasks;
    searchTerm = searchTerm.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm)
    );
  }

  getPriorityClass(priority: Task['priority']): string {
    const classes = {
      'HIGH': 'bg-red-100 text-red-800 px-2 py-1 rounded',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded',
      'LOW': 'bg-green-100 text-green-800 px-2 py-1 rounded'
    };
    return classes[priority];
  }

  getStatusClass(status: Task['status']): string {
    const classes = {
      'COMPLETED': 'bg-green-100 text-green-800 px-2 py-1 rounded',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded',
      'NOT_STARTED': 'bg-gray-100 text-gray-800 px-2 py-1 rounded'
    };
    return classes[status];
  }
}
