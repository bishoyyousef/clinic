import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const langService = inject(LanguageService);
  const currentLang = langService.currentLang();
  
  req = req.clone({
    setHeaders: {
      'Accept-Language': currentLang
    }
  });
  
  return next(req);
};
