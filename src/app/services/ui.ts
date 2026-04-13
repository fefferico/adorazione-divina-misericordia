import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UIService {
  isSidebarCollapsed = signal<boolean>(this.getInitialCollapsed());
  isSidebarMobileOpen = signal<boolean>(false);

  constructor() {}

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
    localStorage.setItem('sidebar-collapsed', this.isSidebarCollapsed().toString());
  }

  setMobileSidebar(open: boolean) {
    this.isSidebarMobileOpen.set(open);
  }

  private getInitialCollapsed(): boolean {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  }
}
