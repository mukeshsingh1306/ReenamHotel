import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  name: string = '';
  email: string = '';
  message: string = '';
  isSubmitting: boolean = false;
  submitMessage: string = '';
  submitError: string = '';

  ngOnInit(): void {
    // Auto-populate name and email if user is logged in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.name = user.name || '';
        this.email = user.email || '';
      }
    });
  }

  onSubmit(): void {
    // Validation
    if (!this.name.trim()) {
      this.submitError = 'Please enter your name.';
      return;
    }
    if (!this.email.trim()) {
      this.submitError = 'Please enter your email.';
      return;
    }
    if (!this.message.trim()) {
      this.submitError = 'Please enter your message.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitMessage = '';

    this.http.post('http://localhost:4000/api/contact', {
      name: this.name.trim(),
      email: this.email.trim(),
      message: this.message.trim()
    }).subscribe({
      next: (response: any) => {
        this.submitMessage = response.message || 'Thank you! Your message has been sent successfully.';
        this.isSubmitting = false;
        // Reset form
        this.name = '';
        this.email = '';
        this.message = '';
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.submitMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.submitError = error.error?.message || 'Failed to send message. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  closeToast(): void {
    this.submitMessage = '';
    this.submitError = '';
  }
}
