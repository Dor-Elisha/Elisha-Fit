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
  @Input() isMultipleSelection = false;
  @Output() onItemClick = new EventEmitter<any>();

  menuOpen = false;

  get displayText(): string {
    if (this.isMultipleSelection) {
      const selectedItems = this.items.filter((i) => i && i.selected);
      if (selectedItems.length) {
        return selectedItems.map((i) => (this.itemDisplayKey ? i[this.itemDisplayKey] : i)).join(', ');
      }
    } else {
      const selectedItem = this.items.find((i) => i && i.selected);
      if (selectedItem) {
        return this.itemDisplayKey ? selectedItem[this.itemDisplayKey] : selectedItem;
      }
    }
    return this.text || 'Select';
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

    const emitItem = this.itemDisplayKey && !this.isMultipleSelection ? item[this.itemDisplayKey] : item;
    this.onItemClick.emit(emitItem);
  }
}
