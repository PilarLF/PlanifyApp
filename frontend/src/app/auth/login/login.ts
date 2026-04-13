import { Component } from '@angular/core';
import { Form, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm : FormGroup;
  errorMessage: string = '';
  
  //creamos el formulario con FormBuilder y validaciones básicas
  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router) {
      //validamos el email y la contraseña
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
   }

  onSubmit() { //aqui va la logica del login
    if (this.loginForm.valid) {
      //si es valido lo anterior:
      const { email, password } = this.loginForm.value;
      
      this.authService.login({ email, password }).subscribe({
        next: (response: any) => {
          //guardo el token en localStorage
          localStorage.setItem('token', response.token);
          //redirigo al dashboard según el rol 
          if (response.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/employee/dashboard']);
          }
        },
        error: (err) => {
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
      });
    }
  }
}
