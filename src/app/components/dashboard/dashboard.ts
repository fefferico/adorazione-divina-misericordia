import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Sparkles, BookOpen, Plus, Search } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  readonly Sparkles = Sparkles;
  readonly BookOpen = BookOpen;
  readonly Plus = Plus;
  readonly Search = Search;

  quickThemes = [
    { name: 'Misericordia', color: 'text-accent-crimson' },
    { name: 'Creato', color: 'text-green-600' },
    { name: 'Eucaristia', color: 'text-accent-gold' },
    { name: 'Perdono', color: 'text-primary-500' }
  ];
}
