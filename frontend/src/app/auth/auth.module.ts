import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AuthRoutingModule } from './auth-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { Login } from './login/login';

@NgModule({
  declarations: [],
  imports: [CommonModule, AuthRoutingModule, HttpClientModule, ReactiveFormsModule],
})
export class AuthModule {}
