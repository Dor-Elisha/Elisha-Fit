import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  const mockDialogData: ConfirmDialogData = {
    title: 'Delete Program',
    message: 'Are you sure you want to delete this program? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
    showIcon: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    component.data = mockDialogData;
    component.isVisible = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display dialog when isVisible is true', () => {
    component.isVisible = true;
    fixture.detectChanges();
    
    const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should hide dialog when isVisible is false', () => {
    component.isVisible = false;
    fixture.detectChanges();
    
    const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
    expect(overlay).toBeFalsy();
  });

  it('should display correct title', () => {
    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement.textContent).toContain('Delete Program');
  });

  it('should display correct message', () => {
    const messageElement = fixture.nativeElement.querySelector('.dialog-message');
    expect(messageElement.textContent).toContain('Are you sure you want to delete this program?');
  });

  it('should display correct button text', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.btn');
    expect(buttons[0].textContent.trim()).toBe('Cancel');
    expect(buttons[1].textContent.trim()).toBe('Delete');
  });

  it('should show icon when showIcon is true', () => {
    component.data.showIcon = true;
    fixture.detectChanges();
    
    const icon = fixture.nativeElement.querySelector('.dialog-icon');
    expect(icon).toBeTruthy();
  });

  it('should hide icon when showIcon is false', () => {
    component.data.showIcon = false;
    fixture.detectChanges();
    
    const icon = fixture.nativeElement.querySelector('.dialog-icon');
    expect(icon).toBeFalsy();
  });

  it('should emit confirm event when confirm button is clicked', () => {
    spyOn(component.confirm, 'emit');
    
    const confirmButton = fixture.nativeElement.querySelector('.btn-danger');
    confirmButton.click();
    
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should emit cancel event when cancel button is clicked', () => {
    spyOn(component.cancel, 'emit');
    
    const cancelButton = fixture.nativeElement.querySelector('.btn-secondary');
    cancelButton.click();
    
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should emit close event when close button is clicked', () => {
    spyOn(component.close, 'emit');
    
    const closeButton = fixture.nativeElement.querySelector('.close-button');
    closeButton.click();
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit close event when backdrop is clicked', () => {
    spyOn(component.close, 'emit');
    
    const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
    overlay.click();
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should not emit close event when dialog container is clicked', () => {
    spyOn(component.close, 'emit');
    
    const container = fixture.nativeElement.querySelector('.dialog-container');
    container.click();
    
    expect(component.close.emit).not.toHaveBeenCalled();
  });

  it('should set default values when data is not provided', () => {
    component.data = {} as ConfirmDialogData;
    fixture.detectChanges();
    
    expect(component.data.title).toBe('Confirm Action');
    expect(component.data.message).toBe('Are you sure you want to proceed?');
    expect(component.data.confirmText).toBe('Confirm');
    expect(component.data.cancelText).toBe('Cancel');
    expect(component.data.type).toBe('info');
    expect(component.data.showIcon).toBe(true);
  });

  it('should get correct icon for danger type', () => {
    component.data.type = 'danger';
    expect(component.getIcon()).toBe('warning');
  });

  it('should get correct icon for warning type', () => {
    component.data.type = 'warning';
    expect(component.getIcon()).toBe('warning');
  });

  it('should get correct icon for info type', () => {
    component.data.type = 'info';
    expect(component.getIcon()).toBe('info');
  });

  it('should get correct icon color for danger type', () => {
    component.data.type = 'danger';
    expect(component.getIconColor()).toBe('#dc3545');
  });

  it('should get correct icon color for warning type', () => {
    component.data.type = 'warning';
    expect(component.getIconColor()).toBe('#ffc107');
  });

  it('should get correct icon color for info type', () => {
    component.data.type = 'info';
    expect(component.getIconColor()).toBe('#17a2b8');
  });

  it('should get correct button class for danger type', () => {
    component.data.type = 'danger';
    expect(component.getConfirmButtonClass()).toBe('btn-danger');
  });

  it('should get correct button class for warning type', () => {
    component.data.type = 'warning';
    expect(component.getConfirmButtonClass()).toBe('btn-warning');
  });

  it('should get correct button class for info type', () => {
    component.data.type = 'info';
    expect(component.getConfirmButtonClass()).toBe('btn-primary');
  });

  it('should have proper accessibility attributes', () => {
    const closeButton = fixture.nativeElement.querySelector('.close-button');
    expect(closeButton.getAttribute('aria-label')).toBe('Close dialog');
  });

  it('should handle custom confirm and cancel text', () => {
    component.data = {
      title: 'Custom Dialog',
      message: 'Custom message',
      confirmText: 'Yes, proceed',
      cancelText: 'No, go back',
      type: 'info'
    };
    fixture.detectChanges();
    
    const buttons = fixture.nativeElement.querySelectorAll('.btn');
    expect(buttons[0].textContent.trim()).toBe('No, go back');
    expect(buttons[1].textContent.trim()).toBe('Yes, proceed');
  });

  it('should handle empty message', () => {
    component.data.message = '';
    fixture.detectChanges();
    
    const messageElement = fixture.nativeElement.querySelector('.dialog-message');
    expect(messageElement.textContent.trim()).toBe('');
  });

  it('should handle long titles and messages', () => {
    component.data = {
      title: 'This is a very long title that might wrap to multiple lines',
      message: 'This is a very long message that contains a lot of text and might need to wrap to multiple lines to display properly in the dialog.',
      type: 'warning'
    };
    fixture.detectChanges();
    
    const titleElement = fixture.nativeElement.querySelector('h2');
    const messageElement = fixture.nativeElement.querySelector('.dialog-message');
    
    expect(titleElement.textContent).toContain('This is a very long title');
    expect(messageElement.textContent).toContain('This is a very long message');
  });
});
