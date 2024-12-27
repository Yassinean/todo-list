import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl:'./category-form.component.html'
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryForm = this.createForm();
  }

  ngOnInit() {
    const categoryId = this.route.snapshot.params['id'];
    if (categoryId) {
      this.isEditMode = true;
      this.loadCategory(categoryId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      color: ['#3B82F6']
    });
  }

  private loadCategory(id: string) {
    this.categoryService.getCategoryById(id).subscribe(category => {
      if (category) {
        this.categoryForm.patchValue(category);
      }
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      try {
        if (this.isEditMode) {
          this.categoryService.updateCategory(
            this.route.snapshot.params['id'],
            this.categoryForm.value
          );
        } else {
          this.categoryService.addCategory(this.categoryForm.value);
        }
        this.router.navigate(['/categories']);
      } catch (error: any) {
        alert(error.message);
      }
    }
  }

  onCancel() {
    this.router.navigate(['/categories']);
  }
}