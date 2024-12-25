import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { Task, TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  categories$ = this.categoryService.getCategories();
  taskStatuses: TaskStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.taskForm = this.createForm();
  }

  ngOnInit() {
    const taskId = this.route.snapshot.params['id'];
    if (taskId) {
      this.isEditMode = true;
      this.loadTask(taskId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      dueDate: ['', [Validators.required, this.futureDateValidator()]],
      priority: ['MEDIUM', Validators.required],
      status: ['NOT_STARTED', Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  private futureDateValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const date = new Date(control.value);
      return date < new Date() ? { pastDate: true } : null;
    };
  }

  private loadTask(id: string) {
    this.taskService.getTaskById(id).subscribe(task => {
      if (task) {
        this.taskForm.patchValue({
          ...task,
          dueDate: new Date(task.dueDate).toISOString().slice(0, 16)
        });
      }
    });
  }

  getStatusLabel(status: TaskStatus): string {
    const statusLabels = {
      'NOT_STARTED': 'Non commencé',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminé'
    };
    return statusLabels[status];
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const taskData = {
        ...this.taskForm.value,
        dueDate: new Date(this.taskForm.value.dueDate)
      };

      if (this.isEditMode) {
        this.taskService.updateTask(
          this.route.snapshot.params['id'],
          taskData
        );
      } else {
        this.taskService.addTask(taskData);
      }
      
      this.router.navigate(['/tasks']);
    }
  }

  onCancel() {
    this.router.navigate(['/tasks']);
  }
}
