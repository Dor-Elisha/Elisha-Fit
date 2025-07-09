import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent {
  @Input() items: any[] = [];
  @Input() text = '';
  @Input() itemDisplayKey = '';
  @Output() onItemClick = new EventEmitter<any>();

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  itemClick(item: any): void {
    this.menuOpen = false;
    this.onItemClick.emit(item);
  }
}
