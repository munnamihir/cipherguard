import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-home', standalone: true, imports: [RouterLink], template: `
<div style="min-height:100vh;position:relative;z-index:1;">
  <header>
    <div class="header-inner">
      <div>
        <div class="brand-font" style="font-weight:900;font-size:1rem;color:var(--cyan);letter-spacing:2px;">CIPHER<span style="color:var(--gold)">GUARD</span> <span style="color:var(--ai2);font-size:.7rem;">+AI</span></div>
        <div style="font-size:.6rem;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase;">PQC Migration Agent — NIST FIPS 203/204/205</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:.5rem;align-items:center;">
        <span class="hbadge cyan">HNDL Detection</span>
        <span class="hbadge gold">NIST PQC 2024</span>
        <span class="hbadge cyan">JS · Python · Java · Go · C# · Rust</span>
      </div>
      <a routerLink="/login" class="btn btn-scan" style="margin-left:1rem;">Get started →</a>
    </div>
  </header>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:calc(100vh - 56px);padding:3rem 1rem;text-align:center;position:relative;">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,255,.05) 0%,transparent 70%);pointer-events:none;"></div>
    <div style="font-size:.7rem;letter-spacing:2px;color:var(--cyan);background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.2);padding:4px 16px;border-radius:3px;margin-bottom:2rem;text-transform:uppercase;">
      ⬡ NIST FIPS 203 · 204 · 205 — Finalized 2024
    </div>
    <h1 class="brand-font" style="font-size:clamp(1.8rem,5vw,3.2rem);font-weight:900;color:#fff;margin-bottom:1.5rem;line-height:1.1;">
      Quantum-proof your code<br><span style="color:var(--cyan);">before Q-Day arrives</span>
    </h1>
    <p style="font-size:.9rem;color:var(--muted);max-width:600px;margin-bottom:.75rem;line-height:1.8;">
      Scan any codebase for RSA, ECDH, ECDSA, MD5, SHA-1 vulnerabilities. AI-powered migration to ML-KEM-768, ML-DSA-65, SLH-DSA.
    </p>
    <p style="font-size:.7rem;color:rgba(0,229,255,.4);margin-bottom:3rem;">HNDL attacks start today. Adversaries harvest encrypted traffic now.</p>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-bottom:4rem;">
      <a routerLink="/login" class="btn btn-scan" style="font-size:.8rem;padding:.8rem 2rem;">⬡ Start scanning free</a>
      <a routerLink="/scan" class="btn btn-example" style="font-size:.8rem;padding:.8rem 2rem;">Try scanner →</a>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;text-align:left;max-width:640px;width:100%;overflow:hidden;margin-bottom:3rem;">
      <div class="pane-header" style="gap:.4rem;">
        <div style="width:10px;height:10px;border-radius:50%;background:rgba(255,95,95,.6);"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:rgba(245,197,24,.6);"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:rgba(57,255,20,.6);"></div>
        <span class="pane-title" style="margin-left:.5rem;">live scan output</span>
      </div>
      <div style="padding:1rem;font-size:.72rem;line-height:2;">
        <div><span style="color:var(--cyan);">$</span> <span>cipherguard scan ./src</span></div>
        <div style="color:var(--muted);">Scanning 247 files across 6 languages...</div>
        <div><span style="color:var(--red);">CRITICAL</span>&nbsp;&nbsp;<span>RSA-OAEP key generation</span>&nbsp;&nbsp;<span style="color:var(--muted);">auth/crypto.js:42</span></div>
        <div><span style="color:var(--red);">CRITICAL</span>&nbsp;&nbsp;<span>ECDH key agreement</span>&nbsp;&nbsp;<span style="color:var(--muted);">lib/session.ts:118</span></div>
        <div><span style="color:var(--orange);">HIGH</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>JWT RS256 algorithm</span>&nbsp;&nbsp;<span style="color:var(--muted);">middleware/auth.py:31</span></div>
        <div style="padding-top:.5rem;border-top:1px solid var(--border);margin-top:.5rem;">
          <span style="color:var(--red);">Risk: 87/100</span><span style="color:var(--muted);margin:0 .75rem;">·</span><span style="color:var(--gold);">HNDL: 15yr</span><span style="color:var(--muted);margin:0 .75rem;">·</span><span style="color:var(--muted);">14 findings</span>
        </div>
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;max-width:700px;">
      @for (f of features; track f) {
        <span style="font-size:.6rem;padding:3px 12px;border-radius:3px;background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.15);color:var(--cyan);letter-spacing:.5px;">{{ f }}</span>
      }
    </div>
  </div>
</div>
` })
export class HomeComponent {
  features = ['18+ vuln patterns','JS · Python · Java · Go · C# · Rust','AI auto-fix (Claude)','HNDL scoring','ZIP scanner','ML-KEM-768','ML-DSA-65','Export .md','GitHub integration'];
}
