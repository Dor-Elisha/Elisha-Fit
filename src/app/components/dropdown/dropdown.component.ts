import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent {
  @Input() items: any[] = [];
  @Input() text = 'Select';
  @Input() itemDisplayKey = '';
  @Input() itemValueKey = '';
  @Input() isMultipleSelection = false;
  @Output() onItemClick = new EventEmitter<any>();

  menuOpen = false;

  get displayText(): string {
    if (this.isMultipleSelection) {
      const selectedItems = this.items.filter((i) => i && i.selected);
      if (selectedItems.length) {
        return selectedItems.map((i) => this.getItemLabel(i)).join(', ');
      }
    } else {
      const selectedItem = this.items.find((i) => i && i.selected);
      if (selectedItem) {
        return this.getItemLabel(selectedItem);
      }
    }
    return this.text || 'Select';
  }

  getItemLabel(item: any): string {
    if (item === null || item === undefined) {
      return '';
    }
    if (typeof item === 'object') {
      if (this.itemDisplayKey && item[this.itemDisplayKey] !== undefined) {
        return String(item[this.itemDisplayKey]);
      }
      const firstKey = Object.keys(item)[0];
      return firstKey ? String(item[firstKey]) : '';
    }
    return String(item);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  itemClick(item: any): void {
    if (this.isMultipleSelection) {
      if (item && typeof item === 'object') {
        item.selected = !item.selected;
      }
      // keep menu open for multiple selection
    } else {
      this.menuOpen = false;
      this.items.forEach((i) => {
        if (i && typeof i === 'object') {
          i.selected = false;
        }
      });
      if (item && typeof item === 'object') {
        item.selected = true;
      }
    }

    let emitItem: any = item;
    if (this.itemValueKey && item && typeof item === 'object') {
      emitItem = item[this.itemValueKey];
    }
    this.onItemClick.emit(emitItem);
  }
}
