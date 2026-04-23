import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Scan } from '../../core/models';
@Component({ selector: 'app-dashboard', standalone: true, imports: [RouterLink, DatePipe], template: `
<div style="height:100%;overflow-y:auto;padding:2rem;position:relative;z-index:1;">
  <div style="max-width:1200px;margin:0 auto;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;">
      <div>
        <h1 class="brand-font" style="font-size:1.2rem;font-weight:700;color:var(--cyan);letter-spacing:2px;">DASHBOARD</h1>
        <div style="font-size:.65rem;color:var(--muted);margin-top:2px;">Welcome back, <span style="color:var(--text);">{{ dbUser()?.github_username ?? dbUser()?.email }}</span></div>
      </div>
      <a routerLink="/scan" class="btn btn-scan">⬡ New Scan</a>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem;">
      @for (s of stats(); track s.label) {
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:1.25rem;">
          <div style="font-size:.55rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:.5rem;">{{ s.label }}</div>
          <div class="brand-font" style="font-size:1.8rem;font-weight:700;" [style.color]="s.color">{{ s.value }}</div>
        </div>
      }
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden;">
      <div class="pane-header"><span class="pane-title">Recent Scans</span><span style="font-size:.6rem;color:var(--muted);margin-left:auto;">{{ scans().length }} total</span></div>
      @if (loading()) {
        <div style="padding:3rem;text-align:center;color:var(--muted);font-size:.7rem;">Loading...</div>
      } @else if (!scans().length) {
        <div class="empty-state">
          <div class="empty-icon">⬡</div>
          <div class="empty-title">No scans yet</div>
          <div class="empty-hint">Run your first quantum vulnerability scan.</div>
          <a routerLink="/scan" class="btn btn-scan" style="margin-top:1rem;">⬡ Start scanning</a>
        </div>
      } @else {
        @for (scan of scans(); track scan.id) {
          <div style="display:flex;align-items:center;padding:.75rem 1.25rem;border-bottom:1px solid rgba(0,229,255,.06);">
            <div style="flex:1;min-width:0;">
              <div style="font-size:.75rem;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ scan.repo_full_name ?? 'Manual scan' }}</div>
              <div style="font-size:.6rem;color:var(--muted);">{{ scan.created_at | date:'mediumDate' }} · {{ scan.total_findings }} findings · {{ scan.files_scanned }} files</div>
            </div>
            <div style="display:flex;align-items:center;gap:1rem;">
              @if (scan.critical_count > 0) { <span class="spill critical">{{ scan.critical_count }} critical</span> }
              @if (scan.high_count > 0) { <span class="spill high">{{ scan.high_count }} high</span> }
              <span class="brand-font" style="font-size:1rem;font-weight:700;" [style.color]="scan.risk_score>=70?'var(--red)':scan.risk_score>=40?'var(--gold)':'var(--green)'">{{ scan.risk_score }}</span>
            </div>
          </div>
        }
      }
    </div>
    @if (plan() === 'free') {
      <div style="margin-top:1.5rem;background:linear-gradient(135deg,rgba(124,92,252,.1),rgba(0,229,255,.05));border:1px solid var(--ai-border);border-radius:8px;padding:1.25rem;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:.75rem;color:var(--ai2);margin-bottom:.25rem;">{{ dbUser()?.scans_this_month ?? 0 }}/5 free scans used this month</div>
          <div style="font-size:.65rem;color:var(--muted);">Upgrade to Pro for unlimited scans + AI auto-fix.</div>
        </div>
        <a routerLink="/billing" class="btn" style="background:var(--ai);color:#fff;margin-left:1rem;">Upgrade to Pro →</a>
      </div>
    }
  </div>
</div>
` })
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  dbUser = this.auth.dbUser; plan = this.auth.plan;
  scans = signal<Scan[]>([]); loading = signal(true); stats = signal<any[]>([]);
  async ngOnInit() {
    const sb = this.auth.client;
    const { data: { user } } = await sb.auth.getUser(); if (!user) return;
    const { data } = await sb.from('scans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    if (data) {
      this.scans.set(data as Scan[]);
      const tc = data.reduce((s: number, r: any) => s + r.critical_count, 0);
      const ar = data.length ? Math.round(data.reduce((s: number, r: any) => s + r.risk_score, 0) / data.length) : 0;
      this.stats.set([
        { label:'Total scans', value:data.length, color:'var(--cyan)' },
        { label:'Critical findings', value:tc, color:'var(--red)' },
        { label:'Avg risk score', value:ar+'/100', color:ar>=70?'var(--red)':ar>=40?'var(--gold)':'var(--green)' },
        { label:'Scans this month', value:(this.dbUser()?.scans_this_month??0)+(this.plan()==='free'?'/5':''), color:'var(--text)' },
      ]);
    }
    this.loading.set(false);
  }
}
