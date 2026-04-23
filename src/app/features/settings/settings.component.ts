import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
@Component({ selector:'app-settings', standalone:true, template:`
<div style="height:100%;overflow-y:auto;padding:2rem;position:relative;z-index:1;">
  <div style="max-width:700px;margin:0 auto;">
    <h1 class="brand-font" style="font-size:1.2rem;font-weight:700;color:var(--cyan);letter-spacing:2px;margin-bottom:2rem;">SETTINGS</h1>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:1.5rem;">
      @for (row of rows(); track row.label) {
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.85rem 1.25rem;border-bottom:1px solid rgba(0,229,255,0.06);">
          <span style="font-size:0.65rem;color:var(--muted);letter-spacing:0.5px;">{{ row.label }}</span>
          <span style="font-size:0.72rem;color:var(--text);">{{ row.value }}</span>
        </div>
      }
    </div>
    <div style="background:rgba(255,95,95,0.05);border:1px solid rgba(255,95,95,0.2);border-radius:8px;padding:1.25rem;">
      <div style="font-size:0.7rem;color:var(--red);margin-bottom:0.5rem;font-weight:500;">Danger Zone</div>
      <div style="font-size:0.62rem;color:var(--muted);margin-bottom:0.75rem;">Permanently delete your account and all data.</div>
      <button disabled style="font-size:0.62rem;color:var(--red);background:rgba(255,95,95,0.08);border:1px solid rgba(255,95,95,0.25);border-radius:5px;padding:0.4rem 1rem;cursor:not-allowed;opacity:0.6;font-family:'JetBrains Mono',monospace;">Delete account (contact support)</button>
    </div>
  </div>
</div>
` })
export class SettingsComponent {
  private auth = inject(AuthService);
  rows() {
    const u = this.auth.dbUser();
    return [
      { label:'Email', value: u?.email??'—' },
      { label:'GitHub username', value: u?.github_username??'—' },
      { label:'Plan', value: (u?.plan??'free').toUpperCase() },
      { label:'Scans this month', value: (u?.scans_this_month??0)+(u?.plan==='free'?'/5':' (unlimited)') },
      { label:'Member since', value: u?.created_at?new Date(u.created_at).toLocaleDateString():'—' },
    ];
  }
}
