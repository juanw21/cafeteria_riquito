import { AfterViewInit, Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../core/api.service';

interface ChatMessage { role:'user'|'assistant'; text:string; }

@Component({
  standalone:true,
  imports:[CommonModule],
  template:`
    <header class="navbar" [class.navbar--menu-open]="menuOpen">
      <a class="navbar__brand" href="#inicio" (click)="closeMenu()"><span class="brand-mark" aria-hidden="true">✳</span><span>{{config?.nombre_comercial || 'CAFETERÍA'}}</span></a>
      <button class="navbar__toggle" type="button" [attr.aria-expanded]="menuOpen" aria-controls="primary-links" [attr.aria-label]="menuOpen?'Cerrar menú':'Abrir menú'" (click)="toggleMenu()"><span></span><span></span><span></span></button>
      <nav class="navbar__links" id="primary-links" aria-label="Navegación principal">
        <a href="#servicios" (click)="closeMenu()">Servicios</a><a href="#especialidades" (click)="closeMenu()">Especialidades</a><a href="#precios" (click)="closeMenu()">Precios</a><a href="#nosotros" (click)="closeMenu()">Nosotros</a><a href="#contacto" (click)="closeMenu()">Contacto</a><a class="navbar__cta" href="#precios" (click)="closeMenu()">Ver menú <span aria-hidden="true">↗</span></a>
      </nav>
    </header>

    <main>
      <section id="inicio" class="hero" aria-labelledby="hero-title">
        <video *ngIf="heroVideo" class="hero__video" [src]="heroVideo.ruta_archivo" autoplay muted loop playsinline aria-hidden="true" tabindex="-1" preload="metadata"></video>
        <div class="hero__overlay" aria-hidden="true"></div>
        <div class="hero__content">
          <div class="hero__copy"><p class="eyebrow">{{homeContent?.subtitulo || 'CAFETERÍA'}}</p><h1 id="hero-title">{{homeContent?.titulo || config?.nombre_comercial || 'Bienvenidos'}}</h1><p class="hero__description">{{homeContent?.contenido || 'La información estará disponible próximamente.'}}</p></div>
          <div class="hero__actions" aria-label="Accesos rápidos"><a class="hero__action" href="#precios"><span>Menú y precios</span><b aria-hidden="true">↗</b></a><a class="hero__action" href="#contacto"><span>Cómo encontrarnos</span><b aria-hidden="true">↗</b></a></div>
        </div>
      </section>

      <section class="carousel-section" aria-label="Galería de la cafetería" (mouseenter)="pauseGallery()" (mouseleave)="resumeGallery()" (focusin)="pauseGallery()" (focusout)="galleryFocusOut($event)">
        <div class="section-head carousel__head"><div><p class="eyebrow">GALERÍA</p><h2>Un vistazo a la cafetería</h2></div><div class="carousel__controls" *ngIf="galleryImages.length"><button type="button" aria-label="Imagen anterior" (click)="scrollGallery(-1)">←</button><button type="button" aria-label="Imagen siguiente" (click)="scrollGallery(1)">→</button></div></div>
        <p *ngIf="!galleryImages.length" class="empty-state">Las fotos de la cafetería estarán disponibles próximamente.</p>
        <div #galleryTrack class="carousel__track" tabindex="0" aria-label="Imágenes de la cafetería"><figure class="carousel__slide" *ngFor="let item of galleryImages; let index=index"><img [src]="item.ruta_archivo" [alt]="item.titulo || 'Imagen de la cafetería'" [attr.loading]="index===0?'eager':'lazy'"><figcaption *ngIf="item.titulo">{{item.titulo}}</figcaption></figure></div>
      </section>

      <section id="servicios" class="services section-pad">
        <header class="section-head section-head--center"><p class="eyebrow">SERVICIOS</p><h2>Servicios</h2></header>
        <p *ngIf="!services.length" class="empty-state">La información estará disponible próximamente.</p>
        <div class="services__grid"><article class="service-card" *ngFor="let item of services"><span class="service-card__icon" aria-hidden="true">✳</span><img *ngIf="item.imagen" [src]="item.imagen" [alt]="item.nombre" loading="lazy"><h3>{{item.nombre}}</h3><p>{{item.descripcion}}</p></article></div>
      </section>

      <section id="especialidades" class="specialties section-pad">
        <header class="section-head section-head--center"><p class="eyebrow">ESPECIALIDADES</p><h2>Especialidades</h2></header>
        <p *ngIf="!specialties.length" class="empty-state">La información estará disponible próximamente.</p>
        <div class="specialties__grid"><article class="specialty-card" *ngFor="let item of specialties"><img *ngIf="item.imagen" [src]="item.imagen" [alt]="item.nombre" loading="lazy"><div><p class="eyebrow">{{item.producto_nombre || 'ESPECIALIDAD'}}</p><h3>{{item.nombre}}</h3><p>{{item.descripcion}}</p></div></article></div>
      </section>

      <section id="precios" class="prices section-pad">
        <header class="section-head"><div><p class="eyebrow">MENÚ</p><h2>Precios</h2></div><p class="section-note">Precios y disponibilidad actualizados desde la información publicada.</p></header>
        <p *ngIf="!products.length" class="empty-state">Aún no hay productos publicados. Vuelve pronto.</p>
        <div class="prices__grid"><article class="price-card" *ngFor="let item of products"><img *ngIf="item.imagen" [src]="item.imagen" [alt]="item.nombre" loading="lazy"><p class="price-card__category">{{item.categoria_nombre || 'MENÚ'}}</p><h3>{{item.nombre}}</h3><p class="price-card__description">{{item.descripcion}}</p><p class="price-card__amount">{{config?.moneda ? (item.precio | currency:config.moneda:'symbol':'1.2-2') : (item.precio | number:'1.2-2')}}</p></article></div>
      </section>

      <section id="nosotros" class="about-section">
        <div class="about-section__copy"><p class="eyebrow">{{aboutContent?.subtitulo || 'NOSOTROS'}}</p><h2>{{aboutContent?.titulo || 'Acerca de la cafetería'}}</h2><p>{{aboutContent?.contenido || 'La información estará disponible próximamente.'}}</p></div>
        <div class="about-section__details"><p *ngIf="config?.direccion"><span>Dirección</span>{{config.direccion}}</p><p *ngIf="config?.telefono"><span>Teléfono</span><a [href]="'tel:'+config.telefono">{{config.telefono}}</a></p><p *ngIf="config?.email"><span>Correo electrónico</span><a [href]="'mailto:'+config.email">{{config.email}}</a></p><p *ngIf="config?.horario_atencion"><span>Horario de atención</span>{{config.horario_atencion}}</p></div>
      </section>

      <section id="contacto" class="contact section-pad">
        <header class="section-head"><div><p class="eyebrow">CONTACTO</p><h2>Escríbenos</h2></div><p class="section-note">Envíanos tu consulta mediante este formulario.</p></header>
        <div class="contact__layout"><form class="contact__form" (submit)="contact($event)" novalidate><label>Nombre<input name="nombre" autocomplete="name" maxlength="160" required></label><label>Correo electrónico<input name="email" type="email" autocomplete="email" required></label><label>Teléfono<input name="telefono" autocomplete="tel" maxlength="40"></label><label>Mensaje<textarea name="mensaje" rows="5" maxlength="5000" required></textarea></label><button [disabled]="contactSending">{{contactSending?'Enviando…':'Enviar mensaje'}} <span aria-hidden="true">→</span></button><p class="form-status" role="status">{{contactNotice}}</p></form><aside class="contact__details"><h3>Información de contacto</h3><p *ngIf="config?.direccion">{{config.direccion}}</p><p *ngIf="config?.telefono"><a [href]="'tel:'+config.telefono">{{config.telefono}}</a></p><p *ngIf="config?.email"><a [href]="'mailto:'+config.email">{{config.email}}</a></p><p *ngIf="config?.horario_atencion">{{config.horario_atencion}}</p><a *ngIf="config?.ubicacion_mapa" [href]="config.ubicacion_mapa" target="_blank" rel="noopener noreferrer">Ver ubicación en el mapa ↗</a><div *ngIf="socialLinks.length" class="contact__socials"><a *ngFor="let social of socialLinks" [href]="social.url" target="_blank" rel="noopener noreferrer">{{social.name}} ↗</a></div><p *ngIf="!config?.direccion && !config?.telefono && !config?.email && !config?.horario_atencion && !config?.ubicacion_mapa && !socialLinks.length" class="empty-state">Los datos de contacto estarán disponibles próximamente.</p></aside></div>
      </section>
    </main>

    <footer class="footer"><div class="footer__main"><div><a class="footer__brand" href="#inicio">{{config?.nombre_comercial || 'CAFETERÍA'}}</a><p>{{aboutContent?.subtitulo || 'Información oficial de la cafetería.'}}</p></div><nav aria-label="Enlaces rápidos"><h2>Enlaces</h2><a href="#servicios">Servicios</a><a href="#especialidades">Especialidades</a><a href="#precios">Precios</a><a href="#contacto">Contacto</a><a href="/admin">Administración</a></nav><div><h2>Horario</h2><p>{{config?.horario_atencion || 'Horario disponible próximamente.'}}</p></div><div><h2>Encuéntranos</h2><p>{{config?.direccion || 'Dirección disponible próximamente.'}}</p><p>{{config?.telefono || ''}}</p></div></div><div class="footer__bottom"><span>© {{currentYear}} {{config?.nombre_comercial || 'Cafetería'}}</span><a href="#inicio">Volver al inicio ↑</a></div></footer>

    <aside class="chatbot" [class.chatbot--open]="chatOpen"><section *ngIf="chatOpen" class="chatbot__window" role="dialog" aria-labelledby="chat-title"><header class="chatbot__header"><div><h2 id="chat-title">{{config?.nombre_comercial || 'Asistente'}}</h2><p>Asistente virtual</p></div><button type="button" aria-label="Cerrar chat" (click)="toggleChat()">×</button></header><div class="chatbot__messages" aria-live="polite"><p *ngIf="!chatMessages.length" class="chatbot__welcome">Pregunta por productos, servicios u otra información publicada.</p><p *ngFor="let item of chatMessages" class="chatbot__message" [class.chatbot__message--user]="item.role==='user'" [class.chatbot__message--assistant]="item.role==='assistant'">{{item.text}}</p><p *ngIf="chatLoading" class="chatbot__loading">Consultando la información…</p></div><form class="chatbot__form" (submit)="ask($event)"><input name="question" aria-label="Escribe una consulta" placeholder="Escribe una consulta" maxlength="500" required><button type="submit" aria-label="Enviar consulta" [disabled]="chatLoading">↑</button></form></section><button class="chatbot__toggle" type="button" [attr.aria-expanded]="chatOpen" [attr.aria-label]="chatOpen?'Cerrar asistente':'Abrir asistente'" (click)="toggleChat()"><span aria-hidden="true">{{chatOpen?'×':'✳'}}</span></button></aside>
  `
})
export class PublicComponent implements AfterViewInit,OnDestroy {
  private api=inject(ApiService);
  private isBrowser=isPlatformBrowser(inject(PLATFORM_ID));
  @ViewChild('galleryTrack') private galleryTrack?:ElementRef<HTMLDivElement>;
  private galleryTimer?:ReturnType<typeof setInterval>;
  products:any[]=[];services:any[]=[];specialties:any[]=[];gallery:any[]=[];config:any;homeContent:any;aboutContent:any;
  menuOpen=false;chatOpen=false;chatLoading=false;contactSending=false;contactNotice='';chatMessages:ChatMessage[]=[];currentYear=new Date().getFullYear();
  get heroVideo():any{return this.gallery.find(item=>item.tipo==='video')||null;}
  get galleryImages():any[]{return this.gallery.filter(item=>item.tipo!=='video');}
  get socialLinks():{name:string;url:string}[]{const links=this.config?.redes_sociales;if(!links||typeof links!=='object'||Array.isArray(links))return [];return Object.entries(links).filter((entry):entry is [string,string]=>typeof entry[1]==='string'&&/^https:\/\//i.test(entry[1])).map(([name,url])=>({name,url}));}
  constructor(){
    this.api.get<any[]>('productos').subscribe({next:r=>this.products=r.data||[],error:()=>{}});
    this.api.get<any[]>('servicios').subscribe({next:r=>this.services=r.data||[],error:()=>{}});
    this.api.get<any[]>('especialidades').subscribe({next:r=>this.specialties=r.data||[],error:()=>{}});
    this.api.get<any[]>('galeria').subscribe({next:r=>{this.gallery=r.data||[];this.resumeGallery();},error:()=>{}});
    this.api.get<any>('configuracion').subscribe({next:r=>this.config=r.data,error:()=>{}});
    this.api.get<any[]>('contenido').subscribe({next:r=>{const rows=r.data||[];this.homeContent=rows.find((x:any)=>x.seccion==='inicio');this.aboutContent=rows.find((x:any)=>x.seccion==='nosotros');},error:()=>{}});
  }
  ngAfterViewInit(){this.resumeGallery();}
  ngOnDestroy(){this.pauseGallery();}
  toggleMenu(){this.menuOpen=!this.menuOpen;}
  closeMenu(){this.menuOpen=false;}
  toggleChat(){this.chatOpen=!this.chatOpen;}
  scrollGallery(direction:-1|1){const track=this.galleryTrack?.nativeElement;if(!track)return;const max=track.scrollWidth-track.clientWidth;if(direction>0&&track.scrollLeft>=max-2){track.scrollTo({left:0,behavior:'smooth'});return;}if(direction<0&&track.scrollLeft<=2){track.scrollTo({left:max,behavior:'smooth'});return;}track.scrollBy({left:direction*Math.max(track.clientWidth*.72,260),behavior:'smooth'});}
  galleryFocusOut(event:FocusEvent){const section=event.currentTarget as HTMLElement;if(!section.contains(event.relatedTarget as Node|null))this.resumeGallery();}
  pauseGallery(){if(this.galleryTimer!==undefined){clearInterval(this.galleryTimer);this.galleryTimer=undefined;}}
  resumeGallery(){if(!this.isBrowser||this.galleryImages.length<2||this.galleryTimer!==undefined||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;this.galleryTimer=setInterval(()=>this.scrollGallery(1),5000);}
  ask(event:Event){event.preventDefault();if(this.chatLoading)return;const form=event.target as HTMLFormElement;const message=String(new FormData(form).get('question')||'').trim();if(!message)return;this.chatMessages.push({role:'user',text:message});form.reset();this.chatLoading=true;this.api.post<any>('chatbot',{message}).subscribe({next:r=>{this.chatMessages.push({role:'assistant',text:r.response||'No hay información disponible para responder.'});this.chatLoading=false;},error:()=>{this.chatMessages.push({role:'assistant',text:'No se pudo consultar la información en este momento.'});this.chatLoading=false;}});}
  contact(event:Event){event.preventDefault();if(this.contactSending)return;const form=event.target as HTMLFormElement;const values=new FormData(form);this.contactSending=true;this.contactNotice='';this.api.post<any>('contacto',{nombre:values.get('nombre'),email:values.get('email'),telefono:values.get('telefono'),mensaje:values.get('mensaje')}).subscribe({next:()=>{this.contactNotice='Mensaje enviado.';form.reset();this.contactSending=false;},error:()=>{this.contactNotice='No se pudo enviar el mensaje.';this.contactSending=false;}});}
}
