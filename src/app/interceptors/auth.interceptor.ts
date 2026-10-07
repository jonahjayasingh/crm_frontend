import { HttpInterceptorFn, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { AuthResponse } from '../services/api.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const token = localStorage.getItem('access_token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status === 401 || error.status === 403) && !req.url.includes('/auth/')) {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          localStorage.clear();
          router.navigate(['/login']);
          return throwError(() => error);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return http.post<AuthResponse>('http://localhost:8080/api/auth/refresh', { refreshToken }).pipe(
            switchMap((res: AuthResponse) => {
              isRefreshing = false;
              if (res.accessToken) {
                localStorage.setItem('access_token', res.accessToken);
              }
              if (res.refreshToken) {
                localStorage.setItem('refresh_token', res.refreshToken);
              }
              refreshTokenSubject.next(res.accessToken);

              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` }
              }));
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              localStorage.clear();
              router.navigate(['/login']);
              return throwError(() => refreshErr);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter((t): t is string => t !== null),
            take(1),
            switchMap((newToken: string) => {
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              }));
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};

