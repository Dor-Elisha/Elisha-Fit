import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() text = 'Select';
  @Input() itemDisplayKey = '';
  @Input() isMultipleSelection = false;
  @Output() onItemClick = new EventEmitter<any>();

  menuOpen = false;
  displayText = '';
  selectedIndex: number | null = null;
  _=_;

  ngOnInit() {
    this.displayText = 'Select';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  itemClick(item: any, index: number): void {
    this.selectedIndex = index;
    this.menuOpen = false;
    this.displayText = (this.displayText === item) ? 'Select' : item;
    const emitItem = this.itemDisplayKey && !this.isMultipleSelection ? item[this.itemDisplayKey] : item;
    this.onItemClick.emit(emitItem);
  }
}
