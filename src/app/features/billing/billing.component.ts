import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
const PLANS = [
  { id:'free', name:'FREE', price:'$0', period:'forever', color:'var(--muted)', features:['5 scans/month','18+ vuln patterns','ZIP upload','10 AI messages','Export .md'] },
  { id:'pro', name:'PRO', price:'$49', period:'/month', color:'var(--ai2)', featured:true, features:['Unlimited scans','GitHub repo sync','AI auto-fix + rewrite','CI/CD Action','Unlimited AI chat','Migration PDF reports'] },
  { id:'enterprise', name:'ENTERPRISE', price:'Custom', period:'annual', color:'var(--cyan)', features:['Everything in Pro','CISO dashboard','CBOM + compliance','Slack + Jira','SSO + audit logs','Dedicated SLA'] },
];
@Component({ selector:'app-billing', standalone:true, template:`
<div style="height:100%;overflow-y:auto;padding:2rem;position:relative;z-index:1;">
  <div style="max-width:1000px;margin:0 auto;">
    <div style="margin-bottom:2rem;">
      <h1 class="brand-font" style="font-size:1.2rem;font-weight:700;color:var(--cyan);letter-spacing:2px;">BILLING & PLANS</h1>
      <div style="font-size:0.65rem;color:var(--muted);margin-top:4px;">
        Current plan: <span [style.color]="plan()==='pro'?'var(--ai2)':plan()==='enterprise'?'var(--cyan)':'var(--muted)'">{{ plan().toUpperCase() }}</span>
        @if (plan()!=='free') {
          <button (click)="portal()" [disabled]="loading()" style="margin-left:1rem;font-size:0.62rem;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline;">{{ loading()?'Opening...':'Manage billing →' }}</button>
        }
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;">
      @for (p of plans; track p.id) {
        <div style="background:var(--bg2);border-radius:10px;padding:1.75rem;display:flex;flex-direction:column;position:relative;"
          [style.border]="plan()===p.id?'1px solid '+p.color:p.featured?'1px solid var(--ai-border)':'1px solid var(--border)'">
          @if (p.featured) {
            <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:0.55rem;letter-spacing:1.5px;text-transform:uppercase;background:var(--ai);color:#fff;padding:3px 12px;border-radius:3px;">Most popular</div>
          }
          <div class="brand-font" style="font-size:0.75rem;font-weight:700;letter-spacing:2px;margin-bottom:0.5rem;" [style.color]="p.color">{{ p.name }}</div>
          <div class="brand-font" style="font-size:2rem;font-weight:900;color:#fff;line-height:1;margin-bottom:0.25rem;">{{ p.price }}</div>
          <div style="font-size:0.6rem;color:var(--muted);margin-bottom:1.5rem;">{{ p.period }}</div>
          <ul style="flex:1;display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1.5rem;list-style:none;padding:0;">
            @for (f of p.features; track f) {
              <li style="font-size:0.68rem;color:var(--muted);display:flex;gap:0.5rem;"><span style="color:var(--green);">✓</span>{{ f }}</li>
            }
          </ul>
          @if (plan()===p.id) {
            <div style="text-align:center;font-size:0.62rem;color:var(--muted);border:1px solid var(--border);border-radius:5px;padding:0.6rem;letter-spacing:1px;text-transform:uppercase;">Current Plan</div>
          } @else if (p.id==='free') {
            <div></div>
          } @else if (p.id==='enterprise') {
            <a href="mailto:hello@cipherguard.io" class="btn" style="display:block;text-align:center;text-decoration:none;background:rgba(0,229,255,0.08);color:var(--cyan);border:1px solid rgba(0,229,255,0.2);">Contact Sales</a>
          } @else {
            <button (click)="upgrade()" [disabled]="loading()" class="btn" style="background:var(--ai);color:#fff;border:none;">{{ loading()?'Redirecting...':'Upgrade to Pro' }}</button>
          }
        </div>
      }
    </div>
    <div style="margin-top:1.5rem;text-align:center;font-size:0.6rem;color:var(--muted);">Payments via Stripe. Cancel anytime. No setup fees.</div>
  </div>
</div>
` })
export class BillingComponent implements OnInit {
  private auth = inject(AuthService);
  plans = PLANS; plan = this.auth.plan; loading = signal(false);
  ngOnInit() {}
  async upgrade() {
    if (!this.auth.isLoggedIn()) return;
    this.loading.set(true);
    try {
      const { data: { session } } = await this.auth.client.auth.getSession();
      const res = await fetch(environment.apiUrl+'/api/stripe/checkout', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+(session?.access_token??'')}, body:JSON.stringify({plan:'pro'}) });
      const { url } = await res.json(); if (url) window.location.href=url;
    } catch {} finally { this.loading.set(false); }
  }
  async portal() {
    this.loading.set(true);
    try {
      const { data: { session } } = await this.auth.client.auth.getSession();
      const res = await fetch(environment.apiUrl+'/api/stripe/portal', { headers:{'Authorization':'Bearer '+(session?.access_token??'')} });
      const { url } = await res.json(); if (url) window.location.href=url;
    } catch {} finally { this.loading.set(false); }
  }
}
