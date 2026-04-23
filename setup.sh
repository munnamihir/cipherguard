#!/bin/bash
set -e
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo -e "${CYAN}⬡ Building CipherGuard Angular...${NC}"

# ── Directories ───────────────────────────────────────
mkdir -p src/app/core/{services,guards,models}
mkdir -p src/app/features/{home,auth/login,dashboard,scan,billing,settings}
mkdir -p src/app/shared/layout/shell
mkdir -p src/environments
mkdir -p src/assets
mkdir -p server/routes
mkdir -p supabase/migrations
echo -e "${GREEN}✓ Directories${NC}"

# ══════════════════════════════════════════════════════
# ROOT CONFIG FILES
# ══════════════════════════════════════════════════════

cat > package.json << 'EOF'
{
  "name": "cipherguard",
  "version": "0.1.0",
  "scripts": {
    "start": "ng serve --port 4200",
    "build": "ng build --configuration production",
    "watch": "ng build --watch --configuration development",
    "server": "node server/index.js",
    "dev": "concurrently \"npm start\" \"npm run server\""
  },
  "dependencies": {
    "@angular/animations": "^17.3.0",
    "@angular/common": "^17.3.0",
    "@angular/compiler": "^17.3.0",
    "@angular/core": "^17.3.0",
    "@angular/forms": "^17.3.0",
    "@angular/platform-browser": "^17.3.0",
    "@angular/platform-browser-dynamic": "^17.3.0",
    "@angular/router": "^17.3.0",
    "@supabase/supabase-js": "^2.43.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.3"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.3.0",
    "@angular/cli": "^17.3.0",
    "@angular/compiler-cli": "^17.3.0",
    "@types/node": "^20.0.0",
    "autoprefixer": "^10.4.19",
    "concurrently": "^8.2.2",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "~5.4.2"
  }
}
EOF

cat > angular.json << 'EOF'
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "cipherguard": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": { "style": "css", "standalone": true }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/cipherguard",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          },
          "configurations": {
            "production": { "outputHashing": "all" },
            "development": { "optimization": false, "sourceMap": true }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": { "buildTarget": "cipherguard:build:production" },
            "development": { "buildTarget": "cipherguard:build:development" }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
EOF

cat > tsconfig.app.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "outDir": "./out-tsc/app", "types": [] },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
EOF

cat > tailwind.config.js << 'EOF'
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: { extend: {} },
  plugins: []
}
EOF

cat > postcss.config.js << 'EOF'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
EOF

cat > .env.example << 'EOF'
# Angular — paste these into src/environments/environment.ts
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Express server
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
EOF

echo -e "${GREEN}✓ Root config files${NC}"

# ══════════════════════════════════════════════════════
# SRC FILES
# ══════════════════════════════════════════════════════

cat > src/index.html << 'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CipherGuard — Quantum Vulnerability Scanner</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="AI-powered post-quantum cryptography migration. Find RSA, ECDH, ECDSA vulnerabilities and migrate to NIST FIPS 203/204/205.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-950 text-white antialiased">
  <app-root></app-root>
</body>
</html>
EOF

cat > src/styles.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; }
  code, pre { font-family: 'JetBrains Mono', monospace; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 2px; }
}

@layer components {
  .btn-primary   { @apply bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
  .btn-secondary { @apply border border-gray-700 hover:border-gray-500 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors; }
  .card          { @apply bg-gray-900 border border-gray-800 rounded-xl; }
  .input         { @apply w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent; }
  .badge-CRITICAL { @apply text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/10 text-red-400 border border-red-500/20; }
  .badge-HIGH     { @apply text-xs px-2 py-0.5 rounded-full font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20; }
  .badge-MEDIUM   { @apply text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20; }
  .badge-LOW      { @apply text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/10 text-green-400 border border-green-500/20; }
}
EOF

cat > src/main.ts << 'EOF'
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
EOF

cat > src/environments/environment.ts << 'EOF'
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  apiUrl: 'http://localhost:3001',
};
EOF

cat > src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  apiUrl: 'https://YOUR_RAILWAY_URL',
};
EOF

echo -e "${GREEN}✓ src/ base files${NC}"

# ══════════════════════════════════════════════════════
# APP CORE
# ══════════════════════════════════════════════════════

cat > src/app/app.component.ts << 'EOF'
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet], template: `<router-outlet />` })
export class AppComponent {}
EOF

cat > src/app/app.config.ts << 'EOF'
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withFetch()),
    provideAnimations(),
  ],
};
EOF

cat > src/app/app.routes.ts << 'EOF'
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  {
    path: '',
    loadComponent: () => import('./shared/layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'scan',      loadComponent: () => import('./features/scan/scan.component').then(m => m.ScanComponent) },
      { path: 'billing',   loadComponent: () => import('./features/billing/billing.component').then(m => m.BillingComponent) },
      { path: 'settings',  loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
EOF

echo -e "${GREEN}✓ App core${NC}"

# ── Models ────────────────────────────────────────────
cat > src/app/core/models/index.ts << 'EOF'
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string; email: string; github_username?: string; github_avatar?: string;
  plan: UserPlan; scans_this_month: number; stripe_customer_id?: string; created_at: string;
}

export interface Scan {
  id: string; user_id: string; repo_full_name?: string; status: string;
  total_findings: number; critical_count: number; high_count: number;
  medium_count: number; low_count: number; risk_score: number; hndl_max: number;
  files_scanned: number; triggered_by: string; created_at: string; completed_at?: string;
}

export interface VulnPattern {
  lang: string[]; sev: Severity; name: string; pattern: RegExp;
  hndl: number; qdayRisk: string; attack: string; fix: string; diffVuln: string; diffFix: string;
}

export interface ScanFinding {
  lineNum: number; lineText: string; filePath?: string; vuln: VulnPattern;
}
EOF

# ── Services ─────────────────────────────────────────
cat > src/app/core/services/supabase.service.ts << 'EOF'
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
}
EOF

cat > src/app/core/services/auth.service.ts << 'EOF'
import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb     = inject(SupabaseService).client;
  private router = inject(Router);

  private _session = signal<Session | null>(null);
  private _dbUser  = signal<User | null>(null);
  private _loading = signal(true);

  readonly session    = this._session.asReadonly();
  readonly dbUser     = this._dbUser.asReadonly();
  readonly loading    = this._loading.asReadonly();
  readonly isLoggedIn = computed(() => !!this._session());
  readonly plan       = computed(() => this._dbUser()?.plan ?? 'free');

  constructor() {
    this.sb.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      if (data.session) this.loadDbUser(data.session.user.id);
      else this._loading.set(false);
    });
    this.sb.auth.onAuthStateChange((_e, session) => {
      this._session.set(session);
      if (session) this.loadDbUser(session.user.id);
      else { this._dbUser.set(null); this._loading.set(false); }
    });
  }

  private async loadDbUser(id: string) {
    const { data } = await this.sb.from('users').select('*').eq('id', id).single();
    this._dbUser.set(data as User);
    this._loading.set(false);
  }

  async signInWithGitHub() {
    await this.sb.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  async signInWithEmail(email: string) {
    const { error } = await this.sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
  }

  async signOut() {
    await this.sb.auth.signOut();
    this.router.navigate(['/']);
  }

  get client() { return this.sb; }
}
EOF

cat > src/app/core/services/scan.service.ts << 'EOF'
import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ScanFinding, VulnPattern, Severity } from '../models';

const DB: VulnPattern[] = [
  { lang:['js','auto'], sev:'CRITICAL', name:'RSA-OAEP Key Generation',
    pattern:/generateKey\s*\(\s*\{[^}]*name\s*:\s*['"]RSA-OAEP['"]/gi, hndl:15, qdayRisk:'HIGH',
    attack:"Shor's algorithm factors RSA in polynomial time on a CRQC. Keys generated today are harvestable via HNDL.",
    fix:'Replace with ML-KEM-768 (FIPS 203) via @noble/post-quantum.',
    diffVuln:"crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048 }, true, ['encrypt'])",
    diffFix:"import { ml_kem768 } from '@noble/post-quantum/ml-kem'\nconst { publicKey, secretKey } = ml_kem768.keygen()" },
  { lang:['js','auto'], sev:'CRITICAL', name:'ECDH Key Agreement',
    pattern:/generateKey\s*\(\s*\{[^}]*name\s*:\s*['"]ECDH['"]/gi, hndl:15, qdayRisk:'HIGH',
    attack:"Shor's solves ECDLP. P-256, P-384, P-521 all broken by quantum.",
    fix:'Replace with ML-KEM-768 (FIPS 203).',
    diffVuln:"crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey'])",
    diffFix:"const { publicKey, secretKey } = ml_kem768.keygen()" },
  { lang:['js','auto'], sev:'HIGH', name:'ECDSA Signature',
    pattern:/generateKey\s*\(\s*\{[^}]*name\s*:\s*['"]ECDSA['"]/gi, hndl:15, qdayRisk:'HIGH',
    attack:"ECDSA broken by Shor's. Long-lived signatures at risk.",
    fix:'Replace with ML-DSA-65 (FIPS 204).',
    diffVuln:"crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign'])",
    diffFix:"import { ml_dsa65 } from '@noble/post-quantum/ml-dsa'\nconst { publicKey, secretKey } = ml_dsa65.keygen()" },
  { lang:['js','auto'], sev:'HIGH', name:'JWT RS256/RS512',
    pattern:/algorithm\s*:\s*['"]RS(256|384|512)['"]/gi, hndl:10, qdayRisk:'HIGH',
    attack:"RSA JWTs: quantum computer derives private key, forges any token.",
    fix:'Use HS256 for short-lived tokens. ML-DSA-65 for long-lived.',
    diffVuln:"jwt.sign(payload, privateKey, { algorithm: 'RS256' })",
    diffFix:"jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256' })" },
  { lang:['js','auto'], sev:'MEDIUM', name:'SHA-1 Hash',
    pattern:/['"]SHA-1['"]/gi, hndl:5, qdayRisk:'MEDIUM',
    attack:"SHA-1 classically broken. Grover's reduces to ~40-bit quantum security.",
    fix:'Use SHA-256.',
    diffVuln:"crypto.subtle.digest('SHA-1', data)",
    diffFix:"crypto.subtle.digest('SHA-256', data)" },
  { lang:['js','auto'], sev:'HIGH', name:'Node.js RSA generateKeyPair',
    pattern:/generateKeyPair\s*\(\s*['"]rsa['"]/gi, hndl:15, qdayRisk:'HIGH',
    attack:"RSA keypairs broken by Shor's. HNDL: adversaries harvest today.",
    fix:'Use @noble/post-quantum ml_kem768.',
    diffVuln:"crypto.generateKeyPair('rsa', { modulusLength: 2048 }, cb)",
    diffFix:"const { publicKey, secretKey } = ml_kem768.keygen()" },
  { lang:['py','auto'], sev:'CRITICAL', name:'Python RSA Key Generation',
    pattern:/rsa\.generate_private_key|generate_private_key\s*\(\s*public_exponent/gi, hndl:15, qdayRisk:'HIGH',
    attack:"Python cryptography RSA broken by Shor's.",
    fix:'Use liboqs-python: oqs.KeyEncapsulation("ML-KEM-768").',
    diffVuln:"rsa.generate_private_key(public_exponent=65537, key_size=2048)",
    diffFix:"import oqs\nkem = oqs.KeyEncapsulation('ML-KEM-768')\npk = kem.generate_keypair()" },
  { lang:['py','auto'], sev:'CRITICAL', name:'Python EC Key',
    pattern:/ec\.generate_private_key|EllipticCurvePrivateKey/gi, hndl:15, qdayRisk:'HIGH',
    attack:"ECDH/ECDSA broken by quantum Shor's.",
    fix:'Use liboqs-python ML-KEM-768.',
    diffVuln:"ec.generate_private_key(ec.SECP256R1())",
    diffFix:"kem = oqs.KeyEncapsulation('ML-KEM-768')\npk = kem.generate_keypair()" },
  { lang:['py','auto'], sev:'MEDIUM', name:'Python hashlib MD5',
    pattern:/hashlib\.md5/gi, hndl:2, qdayRisk:'MEDIUM',
    attack:"MD5 classically broken.",
    fix:'Use hashlib.sha256().',
    diffVuln:"h = hashlib.md5(data).hexdigest()",
    diffFix:"h = hashlib.sha256(data).hexdigest()" },
  { lang:['py','auto'], sev:'MEDIUM', name:'Python hashlib SHA-1',
    pattern:/hashlib\.sha1/gi, hndl:3, qdayRisk:'MEDIUM',
    attack:"SHA-1 broken. Grover's reduces to ~40-bit quantum security.",
    fix:'Replace with hashlib.sha256().',
    diffVuln:"h = hashlib.sha1(data).hexdigest()",
    diffFix:"h = hashlib.sha256(data).hexdigest()" },
  { lang:['java','auto'], sev:'CRITICAL', name:'Java RSA KeyPairGenerator',
    pattern:/KeyPairGenerator\.getInstance\s*\(\s*['"]RSA['"]/gi, hndl:15, qdayRisk:'HIGH',
    attack:"Java RSA broken by Shor's.",
    fix:'Use BouncyCastle 1.78+ MLKEMKeyPairGenerator.',
    diffVuln:'KeyPairGenerator.getInstance("RSA")',
    diffFix:'new MLKEMKeyPairGenerator()' },
  { lang:['java','auto'], sev:'CRITICAL', name:'Java EC KeyPairGenerator',
    pattern:/KeyPairGenerator\.getInstance\s*\(\s*['"]EC['"]/gi, hndl:15, qdayRisk:'HIGH',
    attack:"Java EC (ECDH/ECDSA) — zero quantum resistance.",
    fix:'Migrate to ML-KEM-768 via BouncyCastle 1.78+.',
    diffVuln:'KeyPairGenerator.getInstance("EC")',
    diffFix:'new MLDSAKeyPairGenerator()' },
  { lang:['go','auto'], sev:'CRITICAL', name:'Go crypto/rsa GenerateKey',
    pattern:/rsa\.GenerateKey|rsa\.GenerateMultiPrimeKey/gi, hndl:15, qdayRisk:'HIGH',
    attack:"Go crypto/rsa broken by Shor's.",
    fix:'Use github.com/cloudflare/circl kyber768.',
    diffVuln:'rsa.GenerateKey(rand.Reader, 2048)',
    diffFix:'scheme := kyber768.Scheme()\npk, sk, _ := scheme.GenerateKeyPair()' },
  { lang:['go','auto'], sev:'CRITICAL', name:'Go ECDH/elliptic',
    pattern:/elliptic\.P256|elliptic\.P384|ecdh\.P256/gi, hndl:15, qdayRisk:'HIGH',
    attack:"Go ECDH — no quantum resistance.",
    fix:'Use circl Kyber768.',
    diffVuln:'elliptic.P256()',
    diffFix:'kyber768.Scheme().GenerateKeyPair()' },
  { lang:['cs','auto'], sev:'CRITICAL', name:'C# RSA.Create()',
    pattern:/RSA\.Create\s*\(|new RSACryptoServiceProvider/gi, hndl:15, qdayRisk:'HIGH',
    attack:".NET RSA broken by Shor's.",
    fix:'Use .NET 9 MLKem or BouncyCastle.NET.',
    diffVuln:'RSA.Create(2048)',
    diffFix:'MLKem.Create(MLKemAlgorithm.MLKem768)' },
  { lang:['auto','js','py','java','go','cs','rs'], sev:'CRITICAL', name:'TLS 1.0/1.1',
    pattern:/TLSv1\.0|TLSv1\.1|SSLv3/gi, hndl:10, qdayRisk:'HIGH',
    attack:'TLS 1.0/1.1 with RSA key exchange — quantum-vulnerable AND classically deprecated.',
    fix:'Enforce TLS 1.3 minimum.',
    diffVuln:"ssl_protocols TLSv1 TLSv1.1;",
    diffFix:"ssl_protocols TLSv1.3;" },
  { lang:['auto','js','py','java','go','cs','rs'], sev:'HIGH', name:'Hardcoded RSA Private Key',
    pattern:/-----BEGIN RSA PRIVATE KEY-----|-----BEGIN PRIVATE KEY-----/gi, hndl:15, qdayRisk:'CRITICAL',
    attack:'Hardcoded key immediately harvestable. Quantum retroactive decryption applies.',
    fix:'Remove. Rotate the key. Use a secrets manager.',
    diffVuln:"const KEY = '-----BEGIN RSA PRIVATE KEY-----'",
    diffFix:"const key = process.env.PRIVATE_KEY" },
];

const EXT_MAP: Record<string, string> = {
  '.js':'js','.ts':'js','.jsx':'js','.tsx':'js',
  '.py':'py','.java':'java','.go':'go','.cs':'cs','.rs':'rs',
};

@Injectable({ providedIn: 'root' })
export class ScanService {
  private auth = inject(AuthService);

  detectLang(code: string): string {
    if (/import\s+\w+\s+from|require\s*\(|const\s+\w+\s*=/.test(code)) return 'js';
    if (/def\s+\w+\s*\(|hashlib\.|cryptography\./.test(code)) return 'py';
    if (/public\s+class|import\s+java\./.test(code)) return 'java';
    if (/func\s+\w+\s*\(|package\s+main/.test(code)) return 'go';
    if (/using\s+System|namespace\s+\w+/.test(code)) return 'cs';
    if (/fn\s+\w+\s*\(|let\s+mut/.test(code)) return 'rs';
    return 'auto';
  }

  detectLangFromFile(filename: string): string {
    const ext = '.' + filename.split('.').pop()!.toLowerCase();
    return EXT_MAP[ext] ?? 'auto';
  }

  scan(code: string, lang: string, filePath?: string): ScanFinding[] {
    const lines = code.split('\n');
    const findings: ScanFinding[] = [];
    for (const vuln of DB) {
      if (!vuln.lang.includes(lang) && !vuln.lang.includes('auto')) continue;
      const regex = new RegExp(vuln.pattern.source, 'gi');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(code)) !== null) {
        const lineNum = code.substring(0, m.index).split('\n').length;
        const lineText = (lines[lineNum - 1] ?? '').trim();
        if (findings.some(f => f.lineNum === lineNum && f.vuln.name === vuln.name)) continue;
        findings.push({ lineNum, lineText, filePath, vuln: { ...vuln } });
      }
    }
    const ord: Record<string, number> = { CRITICAL:0, HIGH:1, MEDIUM:2, LOW:3 };
    return findings.sort((a, b) => (ord[a.vuln.sev]??5) - (ord[b.vuln.sev]??5) || a.lineNum - b.lineNum);
  }

  riskScore(findings: ScanFinding[]): number {
    if (!findings.length) return 0;
    const w: Record<string, number> = { CRITICAL:100, HIGH:75, MEDIUM:40, LOW:15 };
    return Math.min(100, Math.round(findings.reduce((s, f) => s + (w[f.vuln.sev]??10), 0) / findings.length));
  }

  hndlMax(findings: ScanFinding[]): number {
    return findings.reduce((m, f) => Math.max(m, f.vuln.hndl), 0);
  }

  async saveToDb(findings: ScanFinding[], lang: string): Promise<string | null> {
    const sb = this.auth.client;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;

    const { data: scan } = await sb.from('scans').insert({
      user_id: user.id, status: 'complete',
      total_findings: findings.length,
      critical_count: findings.filter(f => f.vuln.sev === 'CRITICAL').length,
      high_count:     findings.filter(f => f.vuln.sev === 'HIGH').length,
      medium_count:   findings.filter(f => f.vuln.sev === 'MEDIUM').length,
      low_count:      findings.filter(f => f.vuln.sev === 'LOW').length,
      risk_score: this.riskScore(findings),
      hndl_max: this.hndlMax(findings),
      files_scanned: 1, triggered_by: 'manual',
      completed_at: new Date().toISOString(),
    }).select().single();

    if (!scan) return null;

    if (findings.length > 0) {
      await sb.from('findings').insert(findings.map(f => ({
        scan_id: (scan as any).id, user_id: user.id,
        file_path: f.filePath ?? 'untitled', line_number: f.lineNum, line_text: f.lineText,
        algorithm: f.vuln.name, severity: f.vuln.sev, hndl_years: f.vuln.hndl,
        qday_risk: f.vuln.qdayRisk, attack_description: f.vuln.attack,
        fix_description: f.vuln.fix, diff_vulnerable: f.vuln.diffVuln, diff_fix: f.vuln.diffFix,
      })));
    }

    await sb.rpc('increment_scan_count', { p_user_id: user.id });
    return (scan as any).id;
  }
}
EOF

echo -e "${GREEN}✓ Services${NC}"

# ── Guards ────────────────────────────────────────────
cat > src/app/core/guards/auth.guard.ts << 'EOF'
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return toObservable(auth.loading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => auth.isLoggedIn() || router.createUrlTree(['/login']))
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return toObservable(auth.loading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => !auth.isLoggedIn() || router.createUrlTree(['/dashboard']))
  );
};
EOF

echo -e "${GREEN}✓ Guards${NC}"

# ══════════════════════════════════════════════════════
# FEATURES
# ══════════════════════════════════════════════════════

# ── Home (Landing page) ───────────────────────────────
cat > src/app/features/home/home.component.ts << 'EOF'
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 text-white flex flex-col">
      <!-- Nav -->
      <nav class="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <span class="text-lg font-bold">Cipher<span class="text-purple-400">Guard</span></span>
        <div class="flex items-center gap-4">
          <a routerLink="/login" class="text-sm text-gray-400 hover:text-white transition-colors">Sign in</a>
          <a routerLink="/login" class="btn-primary">Get started free</a>
        </div>
      </nav>

      <!-- Hero -->
      <main class="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <div class="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-xs font-medium text-purple-400 mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
          NIST FIPS 203 · 204 · 205 — Finalized 2024
        </div>

        <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight max-w-3xl">
          Find every quantum-vulnerable
          <span class="text-purple-400"> cryptographic flaw</span>
          in your codebase
        </h1>

        <p class="text-xl text-gray-400 mb-4 max-w-2xl leading-relaxed">
          AI-powered scanner detecting RSA, ECDH, ECDSA, MD5 across JavaScript, Python, Java, Go, C# and Rust.
          Auto-migrates to NIST post-quantum standards.
        </p>

        <p class="text-sm text-gray-600 mb-10">
          HNDL attacks start today. Your encrypted traffic is being harvested right now.
        </p>

        <div class="flex gap-4 flex-wrap justify-center mb-16">
          <a routerLink="/login" class="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base">
            Start scanning free →
          </a>
          <a routerLink="/scan" class="btn-secondary px-8 py-4 text-base">
            Try the scanner
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-8 max-w-2xl w-full mb-16">
          @for (stat of stats; track stat.label) {
            <div class="text-center">
              <p class="text-3xl font-bold text-purple-400 mb-1">{{ stat.value }}</p>
              <p class="text-sm text-gray-500">{{ stat.label }}</p>
            </div>
          }
        </div>

        <!-- Feature pills -->
        <div class="flex flex-wrap gap-3 justify-center max-w-2xl">
          @for (f of features; track f) {
            <span class="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">{{ f }}</span>
          }
        </div>
      </main>

      <!-- Footer -->
      <footer class="text-center py-6 text-xs text-gray-700 border-t border-gray-800">
        CipherGuard · NIST FIPS 203 / 204 / 205 · Built with Claude AI
      </footer>
    </div>
  `,
})
export class HomeComponent {
  stats = [
    { value: '25+', label: 'Vuln patterns' },
    { value: '~0', label: 'SaaS competitors' },
    { value: '2030', label: 'NSA deadline' },
  ];
  features = [
    'RSA · ECDH · ECDSA detection',
    'AI auto-fix with Claude',
    'HNDL risk scoring',
    'ZIP codebase scanner',
    'ML-KEM-768 migration',
    'ML-DSA-65 migration',
    'Migration PDF reports',
    'GitHub repo scanning',
  ];
}
EOF

# ── Login ─────────────────────────────────────────────
cat > src/app/features/auth/login/login.component.ts << 'EOF'
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white">Cipher<span class="text-purple-400">Guard</span></h1>
          <p class="text-sm text-gray-500 mt-2">Post-quantum cryptography scanner</p>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 class="text-lg font-semibold text-white mb-6">Sign in</h2>

          <!-- GitHub -->
          <button (click)="loginGitHub()" [disabled]="loading()"
            class="w-full flex items-center justify-center gap-3 border border-gray-700 rounded-xl py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 mb-5">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
            </svg>
            {{ loading() ? 'Redirecting...' : 'Continue with GitHub' }}
          </button>

          <!-- Divider -->
          <div class="relative my-5">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-800"></div></div>
            <div class="relative flex justify-center"><span class="bg-gray-900 px-3 text-xs text-gray-600">or sign in with email</span></div>
          </div>

          <!-- Magic link -->
          @if (sent()) {
            <div class="text-center py-4">
              <p class="text-sm text-green-400 font-medium">✓ Magic link sent!</p>
              <p class="text-xs text-gray-500 mt-1">Check {{ email() }} for your sign-in link.</p>
            </div>
          } @else {
            <form (ngSubmit)="loginEmail()" class="space-y-3">
              <input type="email" [(ngModel)]="emailValue" name="email" required
                placeholder="you@company.com" class="input" />
              <button type="submit" [disabled]="loading() || !emailValue"
                class="w-full btn-primary py-3">
                Send magic link
              </button>
            </form>
          }
        </div>

        @if (error()) {
          <p class="text-center text-xs text-red-400 mt-4">{{ error() }}</p>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);

  loading  = signal(false);
  sent     = signal(false);
  error    = signal('');
  emailValue = '';
  email    = signal('');

  async loginGitHub() {
    this.loading.set(true);
    try { await this.auth.signInWithGitHub(); }
    catch (e: any) { this.error.set(e.message); this.loading.set(false); }
  }

  async loginEmail() {
    if (!this.emailValue) return;
    this.loading.set(true);
    try {
      await this.auth.signInWithEmail(this.emailValue);
      this.email.set(this.emailValue);
      this.sent.set(true);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
EOF

echo -e "${GREEN}✓ Home + Login${NC}"

# ── Shell layout ──────────────────────────────────────
cat > src/app/shared/layout/shell/shell.component.ts << 'EOF'
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem { href: string; label: string; icon: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-950">
      <!-- Sidebar -->
      <aside class="w-56 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
        <!-- Logo -->
        <div class="px-5 py-5 border-b border-gray-800">
          <a routerLink="/dashboard" class="text-lg font-bold text-white">
            Cipher<span class="text-purple-400">Guard</span>
          </a>
          <span class="ml-2 text-xs px-2 py-0.5 rounded-full"
            [class]="plan() === 'pro' ? 'bg-purple-500/20 text-purple-400' : plan() === 'enterprise' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'">
            {{ plan() }}
          </span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-0.5">
          @for (item of nav; track item.href) {
            <a [routerLink]="item.href" routerLinkActive="bg-purple-600/20 text-purple-300 font-medium"
              [routerLinkActiveOptions]="{exact: false}"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
              <span class="text-base">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- User -->
        <div class="px-4 py-4 border-t border-gray-800">
          @if (dbUser()?.github_avatar) {
            <img [src]="dbUser()!.github_avatar" alt="" class="w-7 h-7 rounded-full mb-2">
          }
          <p class="text-xs text-gray-500 truncate mb-2">{{ dbUser()?.github_username ?? dbUser()?.email }}</p>
          <button (click)="signOut()" class="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            Sign out
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="flex-1 overflow-y-auto bg-gray-950">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  private auth = inject(AuthService);

  dbUser = this.auth.dbUser;
  plan   = this.auth.plan;

  nav: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: '▤' },
    { href: '/scan',      label: 'New Scan',   icon: '⬡' },
    { href: '/billing',   label: 'Billing',    icon: '◈' },
    { href: '/settings',  label: 'Settings',   icon: '⚙' },
  ];

  signOut() { this.auth.signOut(); }
}
EOF

echo -e "${GREEN}✓ Shell layout${NC}"

# ── Dashboard ─────────────────────────────────────────
cat > src/app/features/dashboard/dashboard.component.ts << 'EOF'
import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Scan } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-8 max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-semibold text-white">Dashboard</h1>
          <p class="text-sm text-gray-500 mt-1">Welcome back, {{ dbUser()?.github_username ?? dbUser()?.email }}</p>
        </div>
        <a routerLink="/scan" class="btn-primary">⬡ New scan</a>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="card p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Total scans</p>
          <p class="text-3xl font-semibold text-white">{{ scans().length }}</p>
        </div>
        <div class="card p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Critical findings</p>
          <p class="text-3xl font-semibold text-red-400">{{ totalCritical() }}</p>
        </div>
        <div class="card p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Avg risk score</p>
          <p class="text-3xl font-semibold" [class]="avgRisk() >= 70 ? 'text-red-400' : avgRisk() >= 40 ? 'text-amber-400' : 'text-green-400'">
            {{ avgRisk() }}/100
          </p>
        </div>
        <div class="card p-5">
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Scans this month</p>
          <p class="text-3xl font-semibold text-white">
            {{ dbUser()?.scans_this_month ?? 0 }}
            @if (plan() === 'free') { <span class="text-lg text-gray-600">/5</span> }
          </p>
        </div>
      </div>

      <!-- Recent scans -->
      <div class="card overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 class="text-sm font-semibold text-white">Recent scans</h2>
        </div>

        @if (loading()) {
          <div class="px-6 py-12 text-center">
            <div class="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        } @else if (!scans().length) {
          <div class="px-6 py-12 text-center">
            <p class="text-gray-600 text-sm mb-3">No scans yet.</p>
            <a routerLink="/scan" class="text-sm text-purple-400 hover:text-purple-300">Run your first scan →</a>
          </div>
        } @else {
          @for (scan of scans(); track scan.id) {
            <div class="flex items-center px-6 py-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ scan.repo_full_name ?? 'Manual scan' }}</p>
                <p class="text-xs text-gray-600 mt-0.5">
                  {{ scan.created_at | date:'mediumDate' }} · {{ scan.total_findings }} findings
                </p>
              </div>
              <div class="flex items-center gap-3">
                @if (scan.critical_count > 0) {
                  <span class="badge-CRITICAL">{{ scan.critical_count }} critical</span>
                }
                <span class="text-sm font-semibold"
                  [class]="scan.risk_score >= 70 ? 'text-red-400' : scan.risk_score >= 40 ? 'text-amber-400' : 'text-green-400'">
                  {{ scan.risk_score }}/100
                </span>
              </div>
            </div>
          }
        }
      </div>

      <!-- Upgrade banner -->
      @if (plan() === 'free') {
        <div class="mt-6 bg-purple-600/10 border border-purple-500/20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-white mb-1">
              {{ dbUser()?.scans_this_month ?? 0 }}/5 free scans used this month
            </p>
            <p class="text-xs text-gray-500">Upgrade to Pro for unlimited scans + GitHub integration + AI auto-fix.</p>
          </div>
          <a routerLink="/billing" class="btn-primary ml-4 whitespace-nowrap">Upgrade to Pro →</a>
        </div>
      }
    </div>
  `,
  providers: [],
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);

  dbUser  = this.auth.dbUser;
  plan    = this.auth.plan;
  scans   = signal<Scan[]>([]);
  loading = signal(true);

  totalCritical = signal(0);
  avgRisk       = signal(0);

  async ngOnInit() {
    const sb = this.auth.client;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    const { data } = await sb.from('scans')
      .select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(10);

    if (data) {
      this.scans.set(data as Scan[]);
      this.totalCritical.set(data.reduce((s: number, r: any) => s + r.critical_count, 0));
      this.avgRisk.set(data.length
        ? Math.round(data.reduce((s: number, r: any) => s + r.risk_score, 0) / data.length)
        : 0);
    }
    this.loading.set(false);
  }
}
EOF

echo -e "${GREEN}✓ Dashboard${NC}"

# ── Scan ──────────────────────────────────────────────
cat > src/app/features/scan/scan.component.ts << 'EOF'
import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScanService } from '../../core/services/scan.service';
import { ScanFinding } from '../../core/models';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="h-screen grid grid-cols-2 divide-x divide-gray-800">
      <!-- LEFT: Editor -->
      <div class="flex flex-col">
        <!-- Toolbar -->
        <div class="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800 bg-gray-900">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Code Input</span>
          <select [(ngModel)]="lang"
            class="ml-auto text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300">
            <option value="auto">Auto-detect</option>
            <option value="js">JavaScript / TypeScript</option>
            <option value="py">Python</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="cs">C# / .NET</option>
            <option value="rs">Rust</option>
          </select>
        </div>

        <!-- Editor area -->
        <div class="flex flex-1 overflow-hidden">
          <!-- Line numbers -->
          <div #lineNums class="bg-gray-900 border-r border-gray-800 overflow-y-hidden select-none w-10 flex-shrink-0 pt-2"
            style="font-family:'JetBrains Mono',monospace;font-size:12px;line-height:24px;">
            @for (n of lineNumbers(); track n) {
              <div class="text-right pr-2 text-xs"
                [class]="vulnLineSet().has(n) ? 'text-red-400 font-bold' : 'text-gray-700'">
                {{ n }}
              </div>
            }
          </div>
          <!-- Textarea -->
          <textarea #codeArea [(ngModel)]="code" (input)="onCodeInput()" (scroll)="syncScroll()"
            spellcheck="false"
            placeholder="Paste your code here, or upload a file below..."
            class="flex-1 resize-none outline-none p-2 bg-gray-950 text-gray-300 overflow-auto"
            style="font-family:'JetBrains Mono',monospace;font-size:12px;line-height:24px;"></textarea>
        </div>

        <!-- Bottom bar -->
        <div class="flex items-center gap-2 px-4 py-2 border-t border-gray-800 bg-gray-900">
          <button (click)="runScan()" [disabled]="!code.trim() || scanning()"
            class="btn-primary flex items-center gap-2">
            @if (scanning()) {
              <span class="w-3 h-3 border border-purple-300 border-t-transparent rounded-full animate-spin"></span>
            }
            ⬡ Scan
          </button>
          <label class="cursor-pointer btn-secondary">
            ↑ Upload file
            <input type="file" class="hidden" accept=".js,.ts,.py,.java,.go,.cs,.rs" (change)="uploadFile($event)">
          </label>
          <button (click)="clear()" class="text-xs text-gray-600 hover:text-gray-400 ml-auto">Clear</button>
          <span class="text-xs text-gray-600">{{ lineNumbers().length }} lines</span>
          @if (saving()) { <span class="text-xs text-purple-400">Saving...</span> }
        </div>
      </div>

      <!-- RIGHT: Results -->
      <div class="flex flex-col overflow-hidden bg-gray-950">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Vulnerability Report</span>
          @if (scanned()) {
            <span class="text-xs text-gray-600">{{ findings().length }} findings</span>
          }
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          @if (!scanned()) {
            <div class="flex flex-col items-center justify-center h-full text-center gap-3">
              <div class="text-5xl opacity-10">⬡</div>
              <p class="text-sm text-gray-600">Paste code and click Scan</p>
              <p class="text-xs text-gray-700">Checks RSA · ECDH · ECDSA · MD5 · SHA-1 and 15+ more</p>
            </div>
          } @else {
            <!-- Risk card -->
            <div class="card p-4 mb-4 flex items-center gap-4">
              <div class="text-center">
                <p class="text-4xl font-bold" [class]="riskColor()">{{ riskScore() }}</p>
                <p class="text-xs text-gray-600 uppercase tracking-wide mt-0.5">Risk score</p>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-white mb-1">
                  {{ riskScore() >= 70 ? 'Critical risk' : riskScore() >= 40 ? 'High risk' : findings().length ? 'Moderate risk' : 'Clean ✓' }}
                </p>
                <p class="text-xs text-gray-600">
                  {{ findings().length }} findings · Max HNDL: {{ hndlMax() }} years · Exposed until ~{{ 2026 + hndlMax() }}
                </p>
                <div class="flex gap-2 mt-2">
                  @for (sev of ['CRITICAL','HIGH','MEDIUM','LOW']; track sev) {
                    @if (countBySev(sev) > 0) {
                      <span [class]="'badge-' + sev">{{ countBySev(sev) }} {{ sev.toLowerCase() }}</span>
                    }
                  }
                </div>
              </div>
            </div>

            @if (!findings().length) {
              <div class="text-center py-10 text-gray-600 text-sm">No quantum vulnerabilities detected ✓</div>
            }

            <!-- Finding cards -->
            @for (f of findings(); track f.lineNum + f.vuln.name; let i = $index) {
              <div class="border rounded-xl mb-3 overflow-hidden border-gray-800"
                [style.border-left]="'3px solid ' + sevColor(f.vuln.sev)">
                <!-- Header -->
                <button (click)="toggle(i)"
                  class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-900 transition-colors">
                  <span [class]="'badge-' + f.vuln.sev">{{ f.vuln.sev }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white">{{ f.vuln.name }}</p>
                    <p class="text-xs text-gray-600">
                      Line {{ f.lineNum }} · <code class="text-amber-500">{{ f.lineText.slice(0, 55) }}</code>
                    </p>
                  </div>
                  <span class="text-gray-700 text-xs">{{ openIdx() === i ? '▲' : '▼' }}</span>
                </button>

                <!-- Expanded -->
                @if (openIdx() === i) {
                  <div class="px-4 pb-4 space-y-3 border-t border-gray-800">
                    <div class="flex gap-3 pt-3">
                      @for (stat of [['HNDL', f.vuln.hndl + ' yr'], ['Q-Day', f.vuln.qdayRisk], ['Exposed', '~' + (2026 + f.vuln.hndl)]]; track stat[0]) {
                        <div class="bg-gray-900 rounded-lg px-3 py-2 text-center">
                          <p class="text-sm font-semibold text-white">{{ stat[1] }}</p>
                          <p class="text-xs text-gray-600 uppercase">{{ stat[0] }}</p>
                        </div>
                      }
                    </div>
                    <div>
                      <p class="text-xs font-medium text-red-400 mb-1">Attack vector</p>
                      <p class="text-xs text-gray-400 leading-relaxed">{{ f.vuln.attack }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-green-400 mb-1">Recommended fix</p>
                      <p class="text-xs text-gray-400 leading-relaxed">{{ f.vuln.fix }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-600 uppercase tracking-wide mb-2">PQC replacement</p>
                      <pre class="text-xs bg-gray-900 text-green-400 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{{ f.vuln.diffFix }}</pre>
                      <button (click)="copy(f.vuln.diffFix)"
                        class="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                        {{ copied() ? '✓ Copied!' : 'Copy fix' }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class ScanComponent {
  @ViewChild('lineNums') lineNumsRef!: ElementRef<HTMLDivElement>;
  @ViewChild('codeArea') codeAreaRef!: ElementRef<HTMLTextAreaElement>;

  private scanSvc = inject(ScanService);

  code     = '';
  lang     = 'auto';
  findings = signal<ScanFinding[]>([]);
  scanned  = signal(false);
  scanning = signal(false);
  saving   = signal(false);
  openIdx  = signal<number | null>(null);
  copied   = signal(false);
  lineNumbers = signal<number[]>([1]);

  vulnLineSet  = signal(new Set<number>());
  riskScore    = signal(0);
  hndlMax      = signal(0);
  riskColor    = signal('text-green-400');

  onCodeInput() {
    const count = (this.code || '').split('\n').length;
    this.lineNumbers.set(Array.from({ length: count }, (_, i) => i + 1));
  }

  syncScroll() {
    if (this.lineNumsRef && this.codeAreaRef) {
      this.lineNumsRef.nativeElement.scrollTop = this.codeAreaRef.nativeElement.scrollTop;
    }
  }

  runScan() {
    if (!this.code.trim()) return;
    this.scanning.set(true);
    const l = this.lang === 'auto' ? this.scanSvc.detectLang(this.code) : this.lang;
    const results = this.scanSvc.scan(this.code, l);
    this.findings.set(results);
    this.scanned.set(true);
    this.openIdx.set(null);
    this.vulnLineSet.set(new Set(results.map(f => f.lineNum)));
    const rs = this.scanSvc.riskScore(results);
    this.riskScore.set(rs);
    this.hndlMax.set(this.scanSvc.hndlMax(results));
    this.riskColor.set(rs >= 70 ? 'text-red-400' : rs >= 40 ? 'text-amber-400' : 'text-green-400');
    this.scanning.set(false);

    // Save to Supabase asynchronously
    this.saving.set(true);
    this.scanSvc.saveToDb(results, l).then(() => this.saving.set(false));
  }

  uploadFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.lang = this.scanSvc.detectLangFromFile(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      this.code = e.target?.result as string;
      this.onCodeInput();
    };
    reader.readAsText(file);
  }

  clear() {
    this.code = ''; this.findings.set([]); this.scanned.set(false);
    this.lineNumbers.set([1]); this.vulnLineSet.set(new Set());
  }

  toggle(i: number) { this.openIdx.set(this.openIdx() === i ? null : i); }

  countBySev(sev: string): number { return this.findings().filter(f => f.vuln.sev === sev).length; }

  sevColor(sev: string): string {
    return { CRITICAL:'#f87171', HIGH:'#fb923c', MEDIUM:'#fbbf24', LOW:'#4ade80' }[sev] ?? '#6b7280';
  }

  async copy(text: string) {
    await navigator.clipboard.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
EOF

echo -e "${GREEN}✓ Scan component${NC}"

# ── Billing ───────────────────────────────────────────
cat > src/app/features/billing/billing.component.ts << 'EOF'
import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

const PLANS = [
  { id: 'free', name: 'Free', price: '$0', period: 'forever',
    features: ['5 scans/month','All 25+ patterns','ZIP upload (10MB)','10 AI messages'],
    cta: 'Current plan', featured: false },
  { id: 'pro',  name: 'Pro',  price: '$49', period: '/month per seat',
    features: ['Unlimited scans','GitHub repo sync','AI auto-fix + rewrite','CI/CD GitHub Action','Unlimited AI chat','Migration PDF reports'],
    cta: 'Upgrade to Pro', featured: true },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', period: 'annual contract',
    features: ['Everything in Pro','Org-wide CISO dashboard','CBOM + compliance reports','Slack + Jira integration','SSO + audit logs','Dedicated SLA'],
    cta: 'Contact sales', featured: false },
];

@Component({
  selector: 'app-billing',
  standalone: true,
  template: `
    <div class="p-8 max-w-5xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-white">Billing & Plans</h1>
        <p class="text-sm text-gray-500 mt-1">
          You are on the <span class="text-purple-400 font-medium capitalize">{{ currentPlan() }}</span> plan.
          @if (currentPlan() !== 'free') {
            <button (click)="openPortal()" [disabled]="loading()" class="ml-3 text-sm text-gray-500 underline hover:text-gray-300">
              {{ loading() ? 'Opening...' : 'Manage billing →' }}
            </button>
          }
        </p>
      </div>

      <div class="grid grid-cols-3 gap-6">
        @for (plan of plans; track plan.id) {
          <div class="relative bg-gray-900 rounded-2xl p-6 flex flex-col"
            [class]="plan.featured ? 'border-2 border-purple-500' : 'border border-gray-800'">
            @if (plan.featured) {
              <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                <span class="bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most popular</span>
              </div>
            }
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{{ plan.name }}</p>
            <p class="text-3xl font-bold text-white mb-0.5">{{ plan.price }}</p>
            <p class="text-xs text-gray-600 mb-5">{{ plan.period }}</p>
            <ul class="space-y-2.5 flex-1 mb-6">
              @for (f of plan.features; track f) {
                <li class="flex gap-2 text-sm text-gray-400">
                  <span class="text-green-400">✓</span> {{ f }}
                </li>
              }
            </ul>
            @if (currentPlan() === plan.id) {
              <div class="text-center text-sm text-gray-600 border border-gray-700 rounded-xl py-2.5">Current plan</div>
            } @else if (plan.id === 'free') {
              <!-- no button for free when on pro/enterprise -->
            } @else if (plan.id === 'enterprise') {
              <a href="mailto:hello@cipherguard.io?subject=Enterprise inquiry"
                class="block text-center btn-secondary py-2.5">Contact sales</a>
            } @else {
              <button (click)="upgrade()" [disabled]="loading()"
                class="w-full btn-primary py-2.5">
                {{ loading() ? 'Redirecting...' : plan.cta }}
              </button>
            }
          </div>
        }
      </div>

      <p class="text-center text-xs text-gray-700 mt-8">
        Payments processed securely by Stripe. Cancel anytime. No setup fees.
      </p>
    </div>
  `,
})
export class BillingComponent implements OnInit {
  private auth = inject(AuthService);

  currentPlan = signal('free');
  loading     = signal(false);
  plans       = PLANS;

  ngOnInit() { this.currentPlan.set(this.auth.plan()); }

  async upgrade() {
    this.loading.set(true);
    try {
      const res = await fetch(`${environment.apiUrl}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await this.auth.client.auth.getSession()).data.session?.access_token}` },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (e) { console.error(e); }
    this.loading.set(false);
  }

  async openPortal() {
    this.loading.set(true);
    try {
      const res = await fetch(`${environment.apiUrl}/api/stripe/portal`, {
        headers: { 'Authorization': `Bearer ${(await this.auth.client.auth.getSession()).data.session?.access_token}` },
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (e) { console.error(e); }
    this.loading.set(false);
  }
}
EOF

# ── Settings ──────────────────────────────────────────
cat > src/app/features/settings/settings.component.ts << 'EOF'
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="p-8 max-w-2xl mx-auto">
      <h1 class="text-2xl font-semibold text-white mb-8">Settings</h1>
      <div class="card overflow-hidden">
        @for (row of rows(); track row.label) {
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800 last:border-0">
            <span class="text-sm text-gray-500">{{ row.label }}</span>
            <span class="text-sm font-medium text-white capitalize">{{ row.value }}</span>
          </div>
        }
      </div>
      <div class="mt-6 bg-red-500/5 border border-red-500/20 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-red-400 mb-1">Danger zone</h3>
        <p class="text-xs text-gray-600 mb-3">Permanently delete your account and all data.</p>
        <button disabled class="text-xs text-red-500 border border-red-500/30 rounded-lg px-4 py-2 opacity-50">
          Delete account (contact support)
        </button>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  private auth = inject(AuthService);

  rows() {
    const u = this.auth.dbUser();
    return [
      { label: 'Email', value: u?.email ?? '—' },
      { label: 'GitHub username', value: u?.github_username ?? '—' },
      { label: 'Plan', value: u?.plan ?? 'free' },
      { label: 'Scans this month', value: `${u?.scans_this_month ?? 0}${u?.plan === 'free' ? '/5' : ' (unlimited)'}` },
      { label: 'Member since', value: u?.created_at ? new Date(u.created_at).toLocaleDateString() : '—' },
    ];
  }
}
EOF

echo -e "${GREEN}✓ Billing + Settings${NC}"

# ══════════════════════════════════════════════════════
# EXPRESS SERVER
# ══════════════════════════════════════════════════════

cat > server/package.json << 'EOF'
{
  "name": "cipherguard-server",
  "version": "1.0.0",
  "scripts": { "start": "node index.js", "dev": "node --watch index.js" },
  "dependencies": {
    "@supabase/supabase-js": "^2.43.0",
    "@anthropic-ai/sdk": "^0.24.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "stripe": "^15.7.0"
  }
}
EOF

cat > server/index.js << 'EOF'
require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({ origin: ['http://localhost:4200', process.env.FRONTEND_URL ?? ''].filter(Boolean) }));

// Stripe webhook must get raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Auth middleware — reads Supabase JWT
const { createClient } = require('@supabase/supabase-js');
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();
  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user } } = await sb.auth.getUser(token);
    req.user = user;
    req.supabase = sb;
  } catch {}
  next();
});

app.use('/api/stripe', require('./routes/stripe'));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'CipherGuard API' }));

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`⬡ CipherGuard API → http://localhost:${PORT}`));
EOF

cat > server/routes/stripe.js << 'EOF'
const express  = require('express');
const Stripe   = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const router   = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function serviceClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// POST /api/stripe/checkout — create Stripe Checkout session
router.post('/checkout', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const sb = serviceClient();
  const { data: dbUser } = await sb.from('users').select('stripe_customer_id').eq('id', req.user.id).single();

  let customerId = dbUser?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: req.user.email, metadata: { supabase_user_id: req.user.id }
    });
    customerId = customer.id;
    await sb.from('users').update({ stripe_customer_id: customerId }).eq('id', req.user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/billing?upgraded=true`,
    cancel_url:  `${process.env.FRONTEND_URL}/billing`,
    metadata: { supabase_user_id: req.user.id, plan: 'pro' },
    allow_promotion_codes: true,
  });

  res.json({ url: session.url });
});

// GET /api/stripe/portal — open billing portal
router.get('/portal', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const sb = serviceClient();
  const { data: dbUser } = await sb.from('users').select('stripe_customer_id').eq('id', req.user.id).single();
  if (!dbUser?.stripe_customer_id) return res.status(404).json({ error: 'No billing account' });

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripe_customer_id,
    return_url: `${process.env.FRONTEND_URL}/billing`,
  });
  res.json({ url: session.url });
});

// POST /api/stripe/webhook — handle Stripe events
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const sb = serviceClient();

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    if (s.metadata?.supabase_user_id) {
      await sb.from('users').update({
        plan: s.metadata.plan ?? 'pro',
        stripe_subscription_id: s.subscription,
      }).eq('id', s.metadata.supabase_user_id);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const s = event.data.object;
    if (s.metadata?.supabase_user_id) {
      await sb.from('users').update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', s.metadata.supabase_user_id);
    }
  }

  res.json({ received: true });
});

module.exports = router;
EOF

echo -e "${GREEN}✓ Express server${NC}"

# ══════════════════════════════════════════════════════
# SUPABASE MIGRATION
# ══════════════════════════════════════════════════════

cat > supabase/migrations/001_schema.sql << 'EOF'
create extension if not exists "uuid-ossp";

create table public.users (
  id                     uuid references auth.users(id) on delete cascade primary key,
  email                  text not null unique,
  github_username        text,
  github_avatar          text,
  plan                   text not null default 'free' check (plan in ('free','pro','enterprise')),
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  scans_this_month       int not null default 0,
  scans_month_reset_at   timestamptz not null default date_trunc('month', now()),
  created_at             timestamptz not null default now()
);
alter table public.users enable row level security;
create policy "users own row" on public.users for all using (auth.uid() = id);

create table public.scans (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  repo_full_name  text,
  status          text not null default 'complete',
  total_findings  int not null default 0,
  critical_count  int not null default 0,
  high_count      int not null default 0,
  medium_count    int not null default 0,
  low_count       int not null default 0,
  risk_score      int not null default 0,
  hndl_max        int not null default 0,
  files_scanned   int not null default 0,
  triggered_by    text not null default 'manual',
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);
alter table public.scans enable row level security;
create policy "users own scans" on public.scans for all using (auth.uid() = user_id);
create index scans_user_id_idx on public.scans(user_id);

create table public.findings (
  id                  uuid primary key default uuid_generate_v4(),
  scan_id             uuid not null references public.scans(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade,
  file_path           text not null,
  line_number         int not null,
  line_text           text,
  algorithm           text not null,
  severity            text not null,
  hndl_years          int not null,
  qday_risk           text not null,
  attack_description  text not null,
  fix_description     text not null,
  diff_vulnerable     text,
  diff_fix            text,
  resolved            boolean not null default false,
  created_at          timestamptz not null default now()
);
alter table public.findings enable row level security;
create policy "users own findings" on public.findings for all using (auth.uid() = user_id);

create or replace function public.increment_scan_count(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.users
  set scans_this_month = scans_this_month + 1
  where id = p_user_id;
end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, github_username, github_avatar)
  values (new.id, new.email, new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
EOF

echo -e "${GREEN}✓ Supabase migration${NC}"

# ══════════════════════════════════════════════════════
# VERCEL CONFIG + README
# ══════════════════════════════════════════════════════

cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/cipherguard",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
EOF

cat > .env << 'EOF'
# Fill these in — used by Express server
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
FRONTEND_URL=http://localhost:4200
PORT=3001
EOF

cat > README.md << 'EOF'
# CipherGuard — Angular + Supabase + Express

## Stack
- **Frontend**: Angular 17 (standalone components, signals, lazy loading)
- **Styling**: Tailwind CSS
- **Auth + DB**: Supabase (GitHub OAuth + Postgres + RLS)
- **Backend API**: Express.js (Stripe billing, webhooks)
- **Scan engine**: TypeScript, runs in browser (zero API calls for scanning)

## Setup

### 1. Fill in environment files

**Angular** — edit `src/environments/environment.ts`:
```
supabaseUrl: 'YOUR_SUPABASE_URL'
supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY'
apiUrl: 'http://localhost:3001'  (dev) / your Railway URL (prod)
```

**Express** — edit `.env`:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

### 2. Supabase setup
- Create project at supabase.com
- SQL Editor → paste `supabase/migrations/001_schema.sql` → Run
- Authentication → Providers → GitHub → enable → paste Client ID + Secret
- GitHub OAuth callback URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`

### 3. Install + run

```bash
# Angular frontend
npm install
npm start  # → http://localhost:4200

# Express backend (new terminal)
cd server && npm install && npm run dev  # → http://localhost:3001
```

### 4. Deploy

**Angular → Vercel**
- Import GitHub repo → Vercel detects Angular via vercel.json
- No extra env vars needed (Supabase keys are in environment.prod.ts)

**Express → Railway**
- New project → Deploy from GitHub repo
- Set ROOT DIRECTORY = server
- Add env vars from .env

## File structure
```
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.config.ts          ← providers
│   │   ├── app.routes.ts          ← lazy routes
│   │   ├── core/
│   │   │   ├── guards/auth.guard.ts
│   │   │   ├── models/index.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts    ← signals-based auth
│   │   │       ├── scan.service.ts    ← VULN_DB + scanner
│   │   │       └── supabase.service.ts
│   │   ├── features/
│   │   │   ├── home/              ← landing page
│   │   │   ├── auth/login/        ← GitHub + magic link
│   │   │   ├── dashboard/         ← stats + recent scans
│   │   │   ├── scan/              ← core scanner UI
│   │   │   ├── billing/           ← Stripe plans
│   │   │   └── settings/
│   │   └── shared/layout/shell/   ← sidebar + nav
│   ├── environments/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── server/                        ← Express API
│   ├── index.js
│   └── routes/stripe.js
├── supabase/migrations/001_schema.sql
├── angular.json
├── vercel.json
└── tailwind.config.js
```
EOF

echo ""
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ CipherGuard Angular — all files created!${NC}"
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo ""
echo -e "Files created:"
find . -type f | grep -v node_modules | sort | grep -v "^\./\."
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "1. Fill in src/environments/environment.ts with your Supabase keys"
echo "2. Fill in .env with your Stripe + Supabase service role key"
echo "3. npm install"
echo "4. npm start  (Angular runs on :4200)"
echo "5. cd server && npm install && node index.js  (API runs on :3001)"

