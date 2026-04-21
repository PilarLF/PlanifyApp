import { NgModule, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AuthRoutingModule } from './auth-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { Login } from './login/login';
import { Register } from './register/register';

@NgModule({
  declarations: [],
  //se me olvidará pero lo vuelvo a poner: no declares Login porque los componentes son standalone
  imports: [CommonModule, AuthRoutingModule, HttpClientModule, ReactiveFormsModule],
})
export class AuthModule {}
