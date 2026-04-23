import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
@Component({ selector: 'app-login', standalone: true, imports: [FormsModule], template: `
<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem;position:relative;">
  <div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(124,92,252,.08) 0%,transparent 60%);"></div>
  <div style="width:100%;max-width:380px;position:relative;z-index:1;">
    <div style="text-align:center;margin-bottom:2.5rem;">
      <div class="brand-font" style="font-size:1.5rem;font-weight:900;color:var(--cyan);letter-spacing:2px;margin-bottom:.25rem;">CIPHER<span style="color:var(--gold);">GUARD</span></div>
      <div style="font-size:.62rem;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase;">PQC Migration Agent</div>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:2rem;">
      <div style="font-size:.75rem;color:var(--muted);margin-bottom:1.5rem;display:flex;align-items:center;gap:.5rem;">
        <span style="color:var(--cyan);">$</span> auth.signin
      </div>
      <button (click)="loginGitHub()" [disabled]="loading()"
        style="width:100%;display:flex;align-items:center;justify-content:center;gap:.75rem;padding:.75rem;border-radius:5px;border:1px solid var(--ai-border);background:var(--ai-bg);color:var(--ai2);cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:.72rem;letter-spacing:1px;margin-bottom:1.25rem;transition:all .2s;text-transform:uppercase;"
        (mouseover)="$event.currentTarget.style.borderColor='var(--ai2)'" (mouseout)="$event.currentTarget.style.borderColor='var(--ai-border)'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>
        {{ loading() ? 'Redirecting...' : 'Continue with GitHub' }}
      </button>
      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.25rem;">
        <div style="flex:1;height:1px;background:var(--border);"></div>
        <span style="font-size:.6rem;color:var(--muted);">or email magic link</span>
        <div style="flex:1;height:1px;background:var(--border);"></div>
      </div>
      @if (sent()) {
        <div style="text-align:center;padding:1rem;border:1px solid rgba(57,255,20,.2);border-radius:5px;background:rgba(57,255,20,.05);">
          <div style="font-size:.75rem;color:var(--green);margin-bottom:.25rem;">✓ Magic link sent!</div>
          <div style="font-size:.62rem;color:var(--muted);">Check {{ email() }}</div>
        </div>
      } @else {
        <form (ngSubmit)="loginEmail()" style="display:flex;flex-direction:column;gap:.75rem;">
          <input type="email" [(ngModel)]="emailValue" name="email" required placeholder="you@company.com"
            style="background:rgba(0,0,0,.3);border:1px solid var(--ai-border);border-radius:5px;padding:.6rem .9rem;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:.72rem;outline:none;width:100%;">
          <button type="submit" [disabled]="loading()||!emailValue" class="btn btn-scan">Send magic link</button>
        </form>
      }
      @if (error()) { <div style="margin-top:.75rem;font-size:.65rem;color:var(--red);text-align:center;">{{ error() }}</div> }
    </div>
  </div>
</div>
` })
export class LoginComponent {
  private auth = inject(AuthService);
  loading = signal(false); sent = signal(false); error = signal('');
  emailValue = ''; email = signal('');
  async loginGitHub() { this.loading.set(true); try { await this.auth.signInWithGitHub(); } catch (e: any) { this.error.set(e.message); this.loading.set(false); } }
  async loginEmail() { if (!this.emailValue) return; this.loading.set(true); this.error.set(''); try { await this.auth.signInWithEmail(this.emailValue); this.email.set(this.emailValue); this.sent.set(true); } catch (e: any) { this.error.set(e.message); } finally { this.loading.set(false); } }
}
