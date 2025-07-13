import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
  active?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  @Input() items: BreadcrumbItem[] = [];
  @Input() showHome: boolean = true;
  @Input() maxItems: number = 5;
  @Output() itemClick = new EventEmitter<BreadcrumbItem>();

  breadcrumbs: BreadcrumbItem[] = [];
  collapsed: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Listen to route changes to automatically generate breadcrumbs
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.buildBreadcrumbs())
    ).subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs;
      this.checkCollapse();
    });
  }

  private buildBreadcrumbs(): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (this.showHome) {
      breadcrumbs.push({
        label: 'Home',
        url: '/',
        icon: 'fas fa-home'
      });
    }

    // Add custom items if provided
    if (this.items.length > 0) {
      breadcrumbs.push(...this.items);
    } else {
      // Auto-generate from route
      const route = this.activatedRoute;
      const url = this.router.url;
      
      // Parse URL segments and create breadcrumbs
      const segments = url.split('/').filter(segment => segment);
      let currentUrl = '';
      
      segments.forEach((segment, index) => {
        currentUrl += `/${segment}`;
        const label = this.formatSegment(segment);
        
        breadcrumbs.push({
          label: label,
          url: currentUrl,
          active: index === segments.length - 1
        });
      });
    }

    return breadcrumbs;
  }

  private formatSegment(segment: string): string {
    // Convert URL segments to readable labels
    const mappings: { [key: string]: string } = {
      'programs': 'Programs',
      'program-wizard': 'Create Program',
      'program-edit': 'Edit Program',
      'progress-entry': 'Log Workout',
      'progress-dashboard': 'Progress Dashboard',
      'analytic': 'Analytics',
      'profile': 'Profile',
      'login': 'Login'
    };

    return mappings[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  }

  private checkCollapse(): void {
    this.collapsed = this.breadcrumbs.length > this.maxItems;
  }

  onItemClick(item: BreadcrumbItem, event: Event): void {
    event.preventDefault();
    
    if (item.url && !item.active) {
      this.router.navigate([item.url]);
    }
    
    this.itemClick.emit(item);
  }

  getVisibleBreadcrumbs(): BreadcrumbItem[] {
    if (!this.collapsed) {
      return this.breadcrumbs;
    }

    const visible = [];
    const total = this.breadcrumbs.length;
    
    // Always show first item (Home)
    visible.push(this.breadcrumbs[0]);
    
    // Add ellipsis
    visible.push({
      label: '...',
      active: false
    });
    
    // Show last few items
    const lastItems = this.breadcrumbs.slice(-2);
    visible.push(...lastItems);
    
    return visible;
  }

  getCollapsedBreadcrumbs(): BreadcrumbItem[] {
    if (!this.collapsed) {
      return [];
    }

    const total = this.breadcrumbs.length;
    return this.breadcrumbs.slice(1, total - 2);
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }
} 