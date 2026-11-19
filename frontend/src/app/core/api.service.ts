import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface ApiResult<T>{success:boolean;data:T;message?:string;token?:string;response?:string;user?:{id:number;nombre:string;email:string;rol:string};}
@Injectable({providedIn:'root'}) export class ApiService {
  private http=inject(HttpClient); private base=environment.apiUrl;
  get<T>(path:string):Observable<ApiResult<T>>{return this.http.get<ApiResult<T>>(`${this.base}/${path}`)}
  post<T>(path:string,body:unknown):Observable<ApiResult<T>>{return this.http.post<ApiResult<T>>(`${this.base}/${path}`,body)}
  put<T>(path:string,body:unknown):Observable<ApiResult<T>>{return this.http.put<ApiResult<T>>(`${this.base}/${path}`,body)}
  delete(path:string):Observable<unknown>{return this.http.delete(`${this.base}/${path}`)}
}
