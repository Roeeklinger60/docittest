import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../services/navbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isLoggedIn = false;
  role = '';

  constructor(private navbarService: NavbarService) {
    this.navbarService.getLoginStatus().subscribe(status => this.isLoggedIn = status);
  }

  ngOnInit() {
  }

  loginUser() {
    this.navbarService.updateNavAfterAuth('user');
    this.navbarService.updateLoginStatus(true);
    this.role = 'user';
  }

  loginAdmin() {
    this.navbarService.updateNavAfterAuth('admin');
    this.navbarService.updateLoginStatus(true);
    this.role = 'admin';
  }
}
