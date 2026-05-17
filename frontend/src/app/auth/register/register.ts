import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.scss',
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class Register {

  registerForm: FormGroup;
  errorMessage = '';
  selectedFile: File | null = null; //para la imagen de perfil

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['EMPLOYEE', Validators.required] // por defecto empleado
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {  //enviar el formulario
    if (this.registerForm.invalid) return;
      const formData = new FormData();
      formData.append('name', this.registerForm.value.name);
      formData.append('email', this.registerForm.value.email);
      formData.append('password', this.registerForm.value.password);
      formData.append('role', this.registerForm.value.role);   
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }
    this.authService.register(formData).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al registrar';
      }
    });
  }
}
