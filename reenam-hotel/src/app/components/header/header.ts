import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  user: any = null;
  showUserMenu = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.checkAuth();
  }

  checkAuth() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = this.authService.getUser();
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.user = null;
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }
}
