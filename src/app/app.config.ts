import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LucideAngularModule, Sparkles, BookOpen, Plus, Search, ChevronLeft, Save, Download, Trash2, Edit3, CheckCircle, X, Filter, Heart, Scroll, Mic, Mail, Music } from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(
      LucideAngularModule.pick({ 
        Sparkles, BookOpen, Plus, Search, ChevronLeft, Save, Download, 
        Trash2, Edit3, CheckCircle, X, Filter, Heart, Scroll, Mic, Mail, Music 
      })
    )
  ],
};
