import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
@Component({ selector: 'app-shell', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive], template: `
<div style="display:flex;height:100vh;background:var(--bg);">
  <aside class="sidebar">
    <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);">
      <div class="brand-font" style="font-size:.85rem;font-weight:900;color:var(--cyan);letter-spacing:2px;">CIPHER<span style="color:var(--gold);">GUARD</span></div>
      <div style="font-size:.52rem;letter-spacing:1px;color:var(--muted);margin-top:2px;">PQC AGENT</div>
    </div>
    <nav style="flex:1;padding:1rem 0;">
      @for (item of nav; track item.href) {
        <a [routerLink]="item.href" routerLinkActive="active" class="nav-link">
          <span style="font-size:.9rem;">{{ item.icon }}</span><span>{{ item.label }}</span>
        </a>
      }
    </nav>
    <div style="padding:1rem 1.25rem;border-top:1px solid var(--border);">
      @if (dbUser()?.github_avatar) {
        <img [src]="dbUser()!.github_avatar" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);margin-bottom:.5rem;display:block;">
      }
      <div style="font-size:.62rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:.5rem;">{{ dbUser()?.github_username ?? dbUser()?.email }}</div>
      <span style="font-size:.55rem;padding:2px 7px;border-radius:3px;text-transform:uppercase;letter-spacing:1px;margin-bottom:.5rem;display:inline-block;"
        [style.background]="plan()==='pro'?'rgba(124,92,252,.15)':plan()==='enterprise'?'rgba(0,229,255,.1)':'rgba(255,255,255,.05)'"
        [style.color]="plan()==='pro'?'var(--ai2)':plan()==='enterprise'?'var(--cyan)':'var(--muted)'"
        [style.border]="'1px solid '+(plan()==='pro'?'var(--ai-border)':plan()==='enterprise'?'rgba(0,229,255,.2)':'var(--border)')">
        {{ plan() }}
      </span>
      <br>
      <button (click)="signOut()" style="font-size:.58rem;color:var(--muted);background:none;border:none;cursor:pointer;">sign out</button>
    </div>
  </aside>
  <main style="flex:1;overflow:hidden;display:flex;flex-direction:column;"><router-outlet /></main>
</div>
` })
export class ShellComponent {
  private auth = inject(AuthService);
  dbUser = this.auth.dbUser; plan = this.auth.plan;
  nav = [{ href:'/dashboard',label:'Dashboard',icon:'▤' },{ href:'/scan',label:'Scanner',icon:'⬡' },{ href:'/billing',label:'Billing',icon:'◈' },{ href:'/settings',label:'Settings',icon:'⚙' }];
  signOut() { this.auth.signOut(); }
}
