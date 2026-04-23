import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScanEngineService, ScanFinding } from '../../core/services/scan.service';

const SYS = `You are an expert in post-quantum cryptography (PQC) and NIST PQC standards (FIPS 203 ML-KEM, FIPS 204 ML-DSA, FIPS 205 SLH-DSA). Help developers migrate from quantum-vulnerable cryptography (RSA, ECDH, ECDSA) to NIST-approved post-quantum algorithms. Be concise and practical. Use code examples.`;

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [FormsModule],
  template: `
<!-- Header -->
<header>
  <div class="header-inner">
    <div>
      <div class="brand-font" style="font-weight:900;font-size:1rem;color:var(--cyan);letter-spacing:2px;">
        CIPHER<span style="color:var(--gold)">GUARD</span>
        <span style="color:var(--ai2);font-size:0.7rem;letter-spacing:1px;margin-left:4px;">+AI</span>
      </div>
      <div style="font-size:0.6rem;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase;">PQC Migration Agent — NIST FIPS 203/204/205</div>
    </div>
    <div style="margin-left:auto;display:flex;gap:0.5rem;align-items:center;">
      <span class="hbadge cyan">HNDL Detection</span>
      <span class="hbadge gold">NIST PQC 2024</span>
      <span class="hbadge cyan">JS · Python · Java · Go · C# · Rust</span>
      <span class="hbadge ai" [class.connected]="apiConnected()" (click)="showModal.set(true)">
        AI Agent: {{ apiConnected() ? 'Connected ✓' : 'Click to connect' }}
      </span>
    </div>
  </div>
</header>

<!-- 3-panel workspace -->
<div class="workspace" style="position:relative;z-index:1;">

  <!-- LEFT: CODE INPUT -->
  <div class="pane pane-left">
    <div class="pane-header">
      <span class="pane-title">Code Input</span>
      <select class="lang-select" [(ngModel)]="lang">
        <option value="auto">Auto-detect language</option>
        <option value="js">JavaScript / TypeScript</option>
        <option value="py">Python</option>
        <option value="java">Java</option>
        <option value="go">Go</option>
        <option value="cs">C# / .NET</option>
        <option value="rs">Rust</option>
      </select>
      <span class="lang-badge" [class]="detectedClass()">{{ detectedLabel() }}</span>
    </div>

    <div class="editor-wrap">
      <div #lineNums class="line-nums">
        @for (n of lineNums_(); track n) {
          <div [class.ln-vuln]="vulnLines().has(n)">{{ n }}</div>
        }
      </div>
      <textarea #codeArea class="code-textarea" [(ngModel)]="code"
        (input)="onInput()" (scroll)="syncScroll()"
        spellcheck="false"
        placeholder="Paste your code here...

QuantumScan AI will:
  • Find every quantum-vulnerable primitive (RSA, ECDH, ECDSA, MD5, SHA-1...)
  • Show exact line numbers + HNDL risk windows
  • Generate context-aware PQC fixes via Claude AI
  • Auto-rewrite the entire file with NIST PQC replacements
  • Answer your quantum cryptography questions

Load an example or upload a file to start →">
      </textarea>
    </div>

    <input #fileInput type="file" style="display:none" accept=".js,.ts,.py,.java,.go,.cs,.rs" (change)="uploadFile($event)">
    <div class="editor-actions">
      <button class="btn btn-scan" (click)="runScan()" [disabled]="!code.trim()">⬡ Scan</button>
      <button class="btn btn-example" (click)="loadExample()">Example</button>
      <button class="btn btn-file" (click)="fileInput.click()">↑ File</button>
      <button class="btn btn-clear" (click)="clear()">Clear</button>
      <span class="char-count">{{ lineNums_().length }} lines</span>
    </div>
  </div>

  <!-- MID: RESULTS -->
  <div class="pane pane-mid">
    <div class="pane-header">
      <span class="pane-title">Vulnerability Report</span>
      @if (scanned()) {
        <span style="font-size:0.62rem;color:var(--muted);margin-left:auto;">{{ findings().length }} finding{{ findings().length!==1?'s':'' }}</span>
      }
    </div>

    @if (scanned()) {
      <div class="filter-bar">
        @for (f of filters; track f.id) {
          <button class="filt-btn" [class]="f.id" [class.active]="activeFilter()===f.id" (click)="activeFilter.set(f.id)">{{ f.label }}</button>
        }
        <button class="export-btn" (click)="exportMd()">↓ Export .md</button>
      </div>
    }

    <div class="results-inner">
      @if (!scanned()) {
        <div class="empty-state">
          <div class="empty-icon">⬡</div>
          <div class="empty-title">No code scanned yet</div>
          <div class="empty-hint">Paste code and click Scan, or load an example to start.</div>
        </div>
      } @else {
        <!-- Score card -->
        <div class="score-card">
          <div class="score-ring">
            <canvas #scoreCanvas width="80" height="80"></canvas>
            <div class="score-number">
              <div class="score-num" [style.color]="riskColor()">{{ riskScore() }}</div>
              <div class="score-lbl">Risk</div>
            </div>
          </div>
          <div style="flex:1;">
            <div class="score-title" [style.color]="riskColor()">
              {{ riskScore()>=70 ? 'CRITICAL RISK' : riskScore()>=40 ? 'HIGH RISK' : findings().length ? 'MODERATE RISK' : 'CLEAN' }}
            </div>
            <div class="score-summary">
              {{ findings().length }} finding{{ findings().length!==1?'s':'' }} · {{ lineNums_().length }} lines · {{ scanLang() }} · HNDL: <span style="color:var(--gold)">{{ hndlMax() }}yr</span>
            </div>
            <div class="severity-pills">
              @if (cnt('CRITICAL')>0){ <span class="spill critical">{{ cnt('CRITICAL') }} Critical</span> }
              @if (cnt('HIGH')>0)    { <span class="spill high">{{ cnt('HIGH') }} High</span> }
              @if (cnt('MEDIUM')>0)  { <span class="spill medium">{{ cnt('MEDIUM') }} Medium</span> }
              @if (cnt('LOW')>0)     { <span class="spill low">{{ cnt('LOW') }} Low</span> }
            </div>
          </div>
        </div>

        <!-- AI banner -->
        @if (findings().length > 0) {
          <div class="ai-banner">
            <div class="ai-banner-title ai-pulse">AI Migration Agent</div>
            <div class="ai-actions">
              <button class="ai-btn primary" (click)="quickAutoFix()" [disabled]="aiLoading()">
                Auto-fix all {{ findings().length }} vulnerabilities
              </button>
              <button class="ai-btn" (click)="quickReport()" [disabled]="aiLoading()">Generate report</button>
            </div>
          </div>
        }

        @if (!findings().length) {
          <div class="empty-state" style="height:auto;padding:2rem;">
            <div class="empty-icon" style="opacity:0.5;color:var(--green)">✓</div>
            <div class="empty-title" style="color:var(--green)">No vulnerabilities detected</div>
            <div class="empty-hint">No quantum-vulnerable patterns found in this code.</div>
          </div>
        }

        <!-- Finding cards -->
        @for (f of visibleFindings(); track f.lineNum+f.vuln.name; let i=$index) {
          <div class="finding" [class]="f.vuln.sev.toLowerCase()">
            <div class="finding-header" (click)="toggle(i)">
              <span class="finding-sev" [class]="f.vuln.sev.toLowerCase()">{{ f.vuln.sev }}</span>
              <div style="flex:1;">
                <div class="finding-algo">{{ f.vuln.name }}</div>
                <div class="finding-line">Line <span>{{ f.lineNum }}</span> &nbsp;·&nbsp;
                  <code style="color:var(--gold);font-size:0.62rem;">{{ f.lineText.slice(0,55) }}{{ f.lineText.length>55?'...':'' }}</code>
                </div>
              </div>
              <span class="finding-chev" [class.open]="openIdx()===i">▶</span>
            </div>

            @if (openIdx()===i) {
              <div class="finding-body">
                <div class="hndl-stats">
                  <div class="hndl-stat">
                    <div class="hndl-val" [style.color]="f.vuln.hndl>=10?'var(--red)':f.vuln.hndl>=5?'var(--gold)':'var(--green)'">{{ f.vuln.hndl }}yr</div>
                    <div class="hndl-key">HNDL window</div>
                  </div>
                  <div class="hndl-stat">
                    <div class="hndl-val" style="color:var(--red)">{{ f.vuln.qdayRisk }}</div>
                    <div class="hndl-key">Q-Day Risk</div>
                  </div>
                  <div class="hndl-stat">
                    <div class="hndl-val" style="color:var(--muted);font-size:0.75rem">~{{ 2026+f.vuln.hndl }}</div>
                    <div class="hndl-key">Exposed until</div>
                  </div>
                </div>

                <div class="finding-issue"><b style="color:var(--red)">Attack:</b> {{ f.vuln.attack }}</div>
                <div class="finding-issue"><b style="color:var(--green)">Fix:</b> {{ f.vuln.fix }}</div>

                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:0.58rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)">Diff</span>
                  <button class="copy-fix-btn" [class.copied]="copiedIdx()===i" (click)="copyFix(f,i,$event)">
                    {{ copiedIdx()===i ? 'Copied ✓' : 'Copy fix' }}
                  </button>
                </div>
                <div class="code-diff">
                  @for (line of f.vuln.diffVuln.split('\n'); let li = $index; track li) {
                    <div class="diff-row vuln"><span class="diff-marker">−</span><span class="diff-ln">{{ f.lineNum+li }}</span>{{ line }}</div>
                  }
                  @for (line of f.vuln.diffFix.split('\n'); track $index) {
                    <div class="diff-row fix"><span class="diff-marker">+</span><span class="diff-ln"> </span>{{ line }}</div>
                  }
                </div>

                <div class="ai-fix-section">
                  <button class="ai-fix-btn-sm" (click)="aiFix(f,i)" [disabled]="aiLoading()">
                    AI: Context-aware fix for this line →
                  </button>
                  @if (aiFixResults()[i]) {
                    <div class="ai-result-box" [innerHTML]="aiFixResults()[i]"></div>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  </div>

  <!-- RIGHT: AI AGENT PANEL -->
  <div class="pane agent-pane">
    <div class="pane-header">
      <span class="pane-title">AI Migration Agent</span>
      <span style="font-size:0.6rem;margin-left:auto;" [style.color]="apiConnected()?'var(--green)':'var(--muted)'">
        {{ apiConnected() ? 'Claude connected' : 'Not connected' }}
      </span>
    </div>

    @if (!showRewrite()) {
      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
        <div #agentMsgs class="agent-inner">
          @if (!msgs().length) {
            <div class="agent-empty">
              <div class="agent-empty-icon">AI</div>
              <div class="agent-empty-title">AI Agent ready</div>
              <div class="agent-empty-hint">Connect your Anthropic API key to enable Claude-powered PQC fixes, full code rewriting, and interactive Q&A.</div>
            </div>
          }
          @for (m of msgs(); track $index) {
            <div class="agent-msg" [class]="m.role" [innerHTML]="m.html"></div>
          }
        </div>

        <div class="agent-input-area">
          <div class="quick-btns">
            <button class="quick-btn" (click)="quickAutoFix()" [disabled]="aiLoading()">Auto-fix all →</button>
            <button class="quick-btn" (click)="quickReport()" [disabled]="aiLoading()">Migration report</button>
            <button class="quick-btn" (click)="quickHndl()" [disabled]="aiLoading()">Explain HNDL</button>
            <button class="quick-btn" (click)="quickY2Q()" [disabled]="aiLoading()">Y2Q estimate</button>
          </div>
          <div class="chat-row">
            <input class="chat-input" [(ngModel)]="chatInput" placeholder="Ask about your vulnerabilities..."
              (keydown.enter)="sendChat()">
            <button class="chat-send" (click)="sendChat()" [disabled]="aiLoading()||!chatInput.trim()">SEND</button>
          </div>
        </div>
      </div>
    } @else {
      <div class="rewrite-panel">
        <div class="pane-header" style="background:rgba(57,255,20,0.04);border-color:rgba(57,255,20,0.15);">
          <span class="pane-title" style="color:var(--green)">AI Rewritten Code</span>
          <span style="font-size:0.6rem;color:var(--green);margin-left:auto;">PQC Migration Complete</span>
        </div>
        <div class="rewrite-code">{{ rewriteCode() }}</div>
        <div class="rewrite-actions">
          <button class="btn btn-rewrite" (click)="copyRewrite()">Copy Fixed Code</button>
          <button class="btn btn-rewrite" (click)="downloadRewrite()">Download</button>
          <button class="btn btn-clear" (click)="showRewrite.set(false)">← Back to Chat</button>
        </div>
      </div>
    }
  </div>
</div>

<!-- API Key Modal -->
@if (showModal()) {
  <div class="modal-overlay" (click)="showModal.set(false)">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-title">Connect AI Agent</div>
      <div class="modal-sub">Enter your Anthropic API key to enable Claude-powered PQC fixes, code rewriting, and Q&A. Your key is stored in memory only — never sent to our servers.</div>
      <input class="modal-input" type="password" [(ngModel)]="apiKeyInput" placeholder="sk-ant-api03-..." autocomplete="off">
      <div class="modal-note">Get a key at <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a>. All requests go directly to the Anthropic API from your browser.</div>
      <div class="modal-actions">
        <button class="modal-btn cancel" (click)="showModal.set(false)">Cancel</button>
        <button class="modal-btn primary" (click)="connectApi()">Connect Agent</button>
      </div>
    </div>
  </div>
}
  `
})
export class ScanComponent {
  @ViewChild('lineNums')   lineNumsEl!: ElementRef<HTMLDivElement>;
  @ViewChild('codeArea')   codeAreaEl!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('scoreCanvas') canvasEl!: ElementRef<HTMLCanvasElement>;
  @ViewChild('agentMsgs')  agentMsgsEl!: ElementRef<HTMLDivElement>;

  private engine = inject(ScanEngineService);

  code = ''; lang = 'auto'; chatInput = ''; apiKeyInput = '';

  findings     = signal<ScanFinding[]>([]);
  scanned      = signal(false);
  lineNums_    = signal<number[]>([1]);
  vulnLines    = signal(new Set<number>());
  openIdx      = signal<number|null>(null);
  copiedIdx    = signal<number|null>(null);
  activeFilter = signal('all');
  riskScore    = signal(0);
  hndlMax      = signal(0);
  scanLang     = signal('');
  riskColor    = signal('var(--green)');
  aiLoading    = signal(false);
  apiConnected = signal(false);
  apiKey       = signal('');
  showModal    = signal(false);
  showRewrite  = signal(false);
  rewriteCode  = signal('');
  msgs         = signal<{role:string;html:string}[]>([]);
  aiFixResults = signal<Record<number,string>>({});

  filters = [
    {id:'all',label:'All'},{id:'critical',label:'Critical'},
    {id:'high',label:'High'},{id:'medium',label:'Medium'},{id:'low',label:'Low'}
  ];

  detectedClass(): string {
    const l = this.lang==='auto' ? this.engine.detectLang(this.code) : this.lang;
    return 'lang-badge '+(l==='auto'?'auto':l);
  }
  detectedLabel(): string {
    if (!this.code.trim()) return 'Paste code →';
    const l = this.lang==='auto' ? this.engine.detectLang(this.code) : this.lang;
    return l==='auto' ? 'Unknown' : this.engine.langName(l)+(this.lang==='auto'?' detected':'');
  }
  visibleFindings(): ScanFinding[] {
    const f = this.activeFilter();
    return f==='all' ? this.findings() : this.findings().filter(x => x.vuln.sev.toLowerCase()===f);
  }
  cnt(sev: string): number { return this.findings().filter(f=>f.vuln.sev===sev).length; }

  onInput() {
    const n = (this.code||'').split('\n').length;
    this.lineNums_.set(Array.from({length:n},(_,i)=>i+1));
  }
  syncScroll() {
    if (this.lineNumsEl && this.codeAreaEl)
      this.lineNumsEl.nativeElement.scrollTop = this.codeAreaEl.nativeElement.scrollTop;
  }

  runScan() {
    if (!this.code.trim()) return;
    const l = this.lang==='auto' ? this.engine.detectLang(this.code) : this.lang;
    const results = this.engine.scan(this.code, l);
    this.findings.set(results);
    this.scanned.set(true);
    this.openIdx.set(null);
    this.activeFilter.set('all');
    this.aiFixResults.set({});
    this.vulnLines.set(new Set(results.map(f=>f.lineNum)));
    const rs = this.engine.riskScore(results);
    this.riskScore.set(rs);
    this.hndlMax.set(this.engine.hndlMax(results));
    this.scanLang.set(this.engine.langName(l));
    this.riskColor.set(rs>=70?'var(--red)':rs>=40?'var(--gold)':'var(--green)');
    setTimeout(()=>this.drawRing(rs),60);
    this.engine.saveToDb(results, l).catch(()=>{});
    if (this.apiConnected() && results.length) {
      this.addMsg('system', 'Scan complete: '+results.length+' findings in '+this.engine.langName(l)+'. Use quick actions or ask me anything.');
    }
  }

  drawRing(score: number) {
    if (!this.canvasEl) return;
    const c = this.canvasEl.nativeElement, ctx = c.getContext('2d')!;
    ctx.clearRect(0,0,80,80);
    ctx.beginPath(); ctx.arc(40,40,30,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=8; ctx.stroke();
    ctx.beginPath(); ctx.arc(40,40,30,-Math.PI/2,-Math.PI/2+(score/100)*Math.PI*2);
    ctx.strokeStyle=score>=70?'#ff5f5f':score>=40?'#f5c518':'#39ff14';
    ctx.lineWidth=8; ctx.stroke();
  }

  loadExample() {
    const l = this.lang==='auto'?'js':this.lang;
    this.code = this.engine.examples[l] ?? this.engine.examples['js'];
    this.onInput();
  }
  clear() {
    this.code=''; this.findings.set([]); this.scanned.set(false);
    this.lineNums_.set([1]); this.vulnLines.set(new Set()); this.riskScore.set(0);
  }
  uploadFile(e: Event) {
    const file=(e.target as HTMLInputElement).files?.[0]; if(!file) return;
    this.lang=this.engine.detectLangFromFile(file.name);
    const reader=new FileReader();
    reader.onload=ev=>{this.code=ev.target?.result as string; this.onInput();};
    reader.readAsText(file);
  }
  toggle(i: number) { this.openIdx.set(this.openIdx()===i?null:i); }
  copyFix(f: ScanFinding, i: number, e: Event) {
    e.stopPropagation();
    navigator.clipboard.writeText(f.vuln.diffFix).then(()=>{
      this.copiedIdx.set(i); setTimeout(()=>this.copiedIdx.set(null),1800);
    });
  }
  exportMd() {
    const now=new Date().toISOString().slice(0,10);
    const lines=['# CipherGuard PQC Report','','**Date:** '+now,'**Language:** '+this.scanLang(),'**Risk Score:** '+this.riskScore()+'/100','**Findings:** '+this.findings().length,'','---',''];
    this.findings().forEach((f,i)=>{
      lines.push('### '+(i+1)+'. ['+f.vuln.sev+'] '+f.vuln.name);
      lines.push('**Line:** '+f.lineNum+' | **HNDL:** '+f.vuln.hndl+'yr | **Q-Day Risk:** '+f.vuln.qdayRisk);
      lines.push(''); lines.push('**Attack:** '+f.vuln.attack);
      lines.push(''); lines.push('**Fix:** '+f.vuln.fix);
      lines.push(''); lines.push('```'); lines.push(f.vuln.diffFix); lines.push('```'); lines.push(''); lines.push('---'); lines.push('');
    });
    const blob=new Blob([lines.join('\n')],{type:'text/markdown'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='cipherguard-'+now+'.md'; a.click();
  }

  connectApi() {
    const k=this.apiKeyInput.trim();
    if (!k.startsWith('sk-')) { alert('Invalid key — must start with sk-'); return; }
    this.apiKey.set(k); this.apiConnected.set(true); this.showModal.set(false);
    this.addMsg('system','AI agent connected. Scan code then use quick actions, or ask me anything about PQC.');
  }

  private fmt(text: string): string {
    return text
      .replace(/`([^`]+)`/g,'<code style="font-family:\'JetBrains Mono\',monospace;font-size:0.65rem;background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:3px;color:var(--green);">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g,'<strong style="color:var(--ai2);">$1</strong>')
      .replace(/```[\w]*\n?([\s\S]*?)```/g,'<pre style="font-family:\'JetBrains Mono\',monospace;font-size:0.62rem;background:rgba(0,0,0,0.4);padding:0.5rem;border-radius:4px;overflow-x:auto;white-space:pre-wrap;margin-top:0.5rem;color:var(--green);">$1</pre>')
      .replace(/\n/g,'<br>');
  }

  addMsg(role: string, text: string) {
    this.msgs.update(m=>[...m,{role,html:this.fmt(text)}]);
    setTimeout(()=>{ if(this.agentMsgsEl) this.agentMsgsEl.nativeElement.scrollTop=99999; },50);
  }
  updateLast(text: string) {
    this.msgs.update(m=>{ const c=[...m]; c[c.length-1]={...c[c.length-1],html:this.fmt(text)}; return c; });
    setTimeout(()=>{ if(this.agentMsgsEl) this.agentMsgsEl.nativeElement.scrollTop=99999; },0);
  }

  private ctx(): string {
    if (!this.findings().length) return '';
    return '\n\nScan findings ('+this.findings().length+' in '+this.scanLang()+'):\n'
      +this.findings().map(f=>'- ['+f.vuln.sev+'] '+f.vuln.name+' line '+f.lineNum+' HNDL:'+f.vuln.hndl+'yr').join('\n')
      +'\n\nCode:\n```\n'+this.code.slice(0,3000)+(this.code.length>3000?'\n...[truncated]':'')+'\n```';
  }

  private async claude(extra: string, userMsg: string, onChunk: (t:string)=>void): Promise<void> {
    if (!this.apiConnected()) { this.showModal.set(true); return; }
    this.aiLoading.set(true);
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':this.apiKey(),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:4096,stream:true,system:SYS+(extra?'\n\n'+extra:''),messages:[{role:'user',content:userMsg}]}),
      });
      if (!resp.ok) { const e=await resp.json(); throw new Error(e.error?.message||'API error'); }
      const reader=resp.body!.getReader(); const dec=new TextDecoder(); let buf='';
      while(true) {
        const {done,value}=await reader.read(); if(done) break;
        buf+=dec.decode(value,{stream:true});
        const parts=buf.split('\n'); buf=parts.pop()!;
        for(const line of parts) {
          if (!line.startsWith('data: ')) continue;
          const d=line.slice(6).trim(); if(d==='[DONE]') continue;
          try { const p=JSON.parse(d); if(p.type==='content_block_delta'&&p.delta?.text) onChunk(p.delta.text); } catch {}
        }
      }
    } catch(err:any) { this.addMsg('system','Error: '+err.message); }
    finally { this.aiLoading.set(false); }
  }

  async sendChat() {
    const msg=this.chatInput.trim(); if(!msg||this.aiLoading()) return;
    this.chatInput=''; this.addMsg('user',msg);
    this.addMsg('ai','<span class="ai-stream-dot"></span>');
    let full='';
    await this.claude(this.ctx(),msg,chunk=>{full+=chunk;this.updateLast(full);});
  }

  async quickAutoFix() {
    if (!this.findings().length) { this.addMsg('system','Run a scan first so I know what to fix.'); return; }
    if (!this.apiConnected()) { this.showModal.set(true); return; }
    this.addMsg('user','Auto-fix all vulnerabilities and rewrite the entire file with NIST PQC replacements.');
    this.addMsg('ai','<span class="ai-stream-dot"></span> Rewriting with NIST PQC replacements...');
    const summary=this.findings().map(f=>'- Line '+f.lineNum+': ['+f.vuln.sev+'] '+f.vuln.name+'\n  Fix: '+f.vuln.fix).join('\n');
    let rewrite='';
    await this.claude('Language: '+this.scanLang(),
      'Vulnerabilities:\n'+summary+'\n\nOriginal code:\n'+this.code+'\n\nRewrite ONLY the complete fixed code — no explanation, no markdown fences. Preserve all logic. Add inline PQC comments.',
      chunk=>{rewrite+=chunk;}
    );
    this.rewriteCode.set(rewrite);
    this.showRewrite.set(true);
    this.updateLast('Code rewritten with '+this.findings().length+' PQC fixes. See rewrite panel →');
  }

  async quickReport() {
    if (!this.findings().length) { this.addMsg('system','Run a scan first to generate a report.'); return; }
    if (!this.apiConnected()) { this.showModal.set(true); return; }
    this.addMsg('user','Generate a migration report for these findings.');
    this.addMsg('ai','<span class="ai-stream-dot"></span>');
    const s=this.findings().map(f=>'- ['+f.vuln.sev+'] '+f.vuln.name+' | Line '+f.lineNum+' | HNDL: '+f.vuln.hndl+'yr').join('\n');
    let full='';
    await this.claude('Language: '+this.scanLang(),
      'Findings:\n'+s+'\n\nWrite a board-ready PQC migration report: 1) Executive Summary, 2) Risk table, 3) Priority order, 4) Recommended algorithms (ML-KEM-768, ML-DSA-65), 5) Effort estimate. Use markdown.',
      chunk=>{full+=chunk;this.updateLast(full);});
  }

  async quickHndl() {
    if (!this.apiConnected()) { this.showModal.set(true); return; }
    this.addMsg('user','Explain what HNDL means and why it matters today.');
    this.addMsg('ai','<span class="ai-stream-dot"></span>');
    let full='';
    await this.claude('','Explain Harvest Now Decrypt Later (HNDL) attacks. Why care today even if CRQCs are years away? Under 200 words.',chunk=>{full+=chunk;this.updateLast(full);});
  }

  async quickY2Q() {
    if (!this.apiConnected()) { this.showModal.set(true); return; }
    this.addMsg('user','What is the current Y2Q estimate?');
    this.addMsg('ai','<span class="ai-stream-dot"></span>');
    let full='';
    await this.claude('','Current expert consensus on Y2Q (years until CRQC breaks RSA-2048)? Mention IBM, Google, NIST. Under 200 words.',chunk=>{full+=chunk;this.updateLast(full);});
  }

  async aiFix(f: ScanFinding, idx: number) {
    if (!this.apiConnected()) { this.showModal.set(true); return; }
    const lines=this.code.split('\n');
    const snippet=lines.slice(Math.max(0,f.lineNum-5),Math.min(lines.length,f.lineNum+10)).join('\n');
    this.aiFixResults.update(r=>({...r,[idx]:'<span class="ai-stream-dot"></span> Analyzing...'}));
    let full='';
    await this.claude('',
      'Language: '+this.scanLang()+'\nVuln: '+f.vuln.name+' ['+f.vuln.sev+']\nLine '+f.lineNum+' context:\n```\n'+snippet+'\n```\n\nGenerate context-aware PQC fix for line '+f.lineNum+'. Use exact variable names from surrounding code. Reference FIPS 203 (ML-KEM-768) or FIPS 204 (ML-DSA-65).',
      chunk=>{full+=chunk;this.aiFixResults.update(r=>({...r,[idx]:this.fmt(full)}));}
    );
  }

  copyRewrite() { navigator.clipboard.writeText(this.rewriteCode()); }
  downloadRewrite() {
    const ext=({js:'js',py:'py',java:'java',go:'go',cs:'cs',rs:'rs'} as any)[this.lang]??'txt';
    const blob=new Blob([this.rewriteCode()],{type:'text/plain'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='pqc-migrated.'+ext; a.click();
  }
}
