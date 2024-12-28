import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { TaskService } from '../../core/services/task.service';
import { CategoryService } from '../../core/services/category.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Tableau de bord</h1>

      <!-- Statistiques générales -->
      <div class="grid gap-4 md:grid-cols-3 mb-8">
        <div class="p-6 bg-green-100 rounded-lg">
          <h3 class="text-lg font-semibold text-green-800">Tâches accomplies</h3>
          <p class="text-3xl font-bold text-green-600">
            {{ (stats$ | async)?.completed }}%
          </p>
        </div>

        <div class="p-6 bg-yellow-100 rounded-lg">
          <h3 class="text-lg font-semibold text-yellow-800">Tâches en cours</h3>
          <p class="text-3xl font-bold text-yellow-600">
            {{ (stats$ | async)?.pending }}%
          </p>
        </div>

        <div class="p-6 bg-red-100 rounded-lg">
          <h3 class="text-lg font-semibold text-red-800">Tâches en retard</h3>
          <p class="text-3xl font-bold text-red-600">
            {{ (stats$ | async)?.overdue }}
          </p>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Graphique circulaire des statuts -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Répartition des statuts</h3>
          <canvas baseChart
            [type]="'pie'"
            [data]="statusChartData"
            [options]="pieChartOptions">
          </canvas>
        </div>

        <!-- Graphique en barres des tâches par catégorie -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Tâches par catégorie</h3>
          <canvas baseChart
            [type]="'bar'"
            [data]="categoryChartData"
            [options]="barChartOptions">
          </canvas>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats$ = this.taskService.getTaskStats();

  // Configuration des graphiques
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Données des graphiques
  statusChartData: ChartData = {
    labels: ['Terminées', 'En cours', 'Non commencées'],
    datasets: [{ data: [0, 0, 0] }]
  };

  categoryChartData: ChartData = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Nombre de tâches'
    }]
  };

  timelineChartData: ChartData = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Tâches créées',
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1
      },
      {
        data: [],
        label: 'Tâches terminées',
        borderColor: 'rgb(34, 197, 94)',
        tension: 0.1
      }
    ]
  };

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.updateCharts();
  }

  private updateCharts() {
    // Mise à jour du graphique des statuts
    this.taskService.getTasks().subscribe(tasks => {
      const completed = tasks.filter(t => t.status === 'COMPLETED').length;
      const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const notStarted = tasks.filter(t => t.status === 'NOT_STARTED').length;

      this.statusChartData.datasets[0].data = [completed, inProgress, notStarted];
    });

    // Mise à jour du graphique par catégorie
    combineLatest([
      this.categoryService.getCategories(),
      this.taskService.getTasks()
    ]).subscribe(([categories, tasks]) => {
      this.categoryChartData.labels = categories.map(c => c.name);
      this.categoryChartData.datasets[0].data = categories.map(category => 
        tasks.filter(task => task.categoryId === category.id).length
      );
    });

    // Mise à jour du graphique temporel
    this.taskService.getTasks().subscribe(tasks => {
      const dates = this.getLast7Days();
      
      this.timelineChartData.labels = dates.map(date => 
        date.toLocaleDateString('fr-FR', { weekday: 'short' })
      );

      this.timelineChartData.datasets[0].data = dates.map(date =>
        tasks.filter(task => this.isSameDay(new Date(task.createdAt), date)).length
      );

      this.timelineChartData.datasets[1].data = dates.map(date =>
        tasks.filter(task => 
          task.status === 'COMPLETED' && 
          this.isSameDay(new Date(task.updatedAt), date)
        ).length
      );
    });
  }

  private getLast7Days(): Date[] {
    const dates: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
}
