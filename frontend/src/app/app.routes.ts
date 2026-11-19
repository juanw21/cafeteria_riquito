import { Routes } from '@angular/router';
import { AdminComponent } from './pages/admin.component';
import { PublicComponent } from './pages/public.component';
export const routes: Routes = [{path:'admin',component:AdminComponent},{path:'',component:PublicComponent},{path:'**',redirectTo:''}];
