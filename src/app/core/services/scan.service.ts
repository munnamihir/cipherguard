import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface VulnPattern { lang:string[]; sev:string; name:string; pattern:RegExp; hndl:number; qdayRisk:string; attack:string; fix:string; diffVuln:string; diffFix:string; }
export interface ScanFinding { lineNum:number; lineText:string; filePath?:string; vuln:VulnPattern; }

export const VULN_DB: VulnPattern[] = [
  { lang:['js','auto'], sev:'CRITICAL', name:'RSA-OAEP Key Generation', pattern:/generateKey\s*\(\s*\{[^}]*name\s*:\s*['"]RSA-OAEP['"]/gi, hndl:15, qdayRisk:'HIGH', attack:"Shor's algorithm factors RSA modulus in polynomial time. RSA-OAEP keys generated today are harvestable now (HNDL attack).", fix:'Replace with ML-KEM-768 (FIPS 203) via @noble/post-quantum.', diffVuln:"const kp = await crypto.subtle.generateKey(\n  { name: 'RSA-OAEP', modulusLength: 2048, hash: 'SHA-256' },\n  true, ['encrypt', 'decrypt']);", diffFix:"import { ml_kem768 } from '@noble/post-quantum/ml-kem';\nconst { publicKey, secretKey } = ml_kem768.keygen();\n// ML-KEM-768 (FIPS 203) — 180-bit quantum security" },
  { lang:['js','auto'], sev:'CRITICAL', name:'ECDH Key Agreement', pattern:/generateKey\s*\(\s*\{[^}]*name\s*:\s*['"]ECDH['"]/gi, hndl:15, qdayRisk:'HIGH', attack:"Shor's algorithm solves ECDLP. P-256, P-384, P-521 all broken by quantum computing.", fix:'Replace with ML-KEM-768 (FIPS 203).', diffVuln:"await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey'])", diffFix:"import { ml_kem768 } from '@noble/post-quantum/ml-kem';\nconst { publicKey, secretKey } = ml_kem768.keygen();" },
  { lang:['js','auto'], sev:'HIGH', name:'ECDSA Signature', pattern:/generateKey\s*\(\s*\{[^}]*name\s*:\s*['"]ECDSA['"]/gi, hndl:15, qdayRisk:'HIGH', attack:"ECDSA signatures broken by Shor's algorithm. Long-lived documents are at risk.", fix:'Replace with ML-DSA-65 (FIPS 204).', diffVuln:"await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])", diffFix:"import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';\nconst { publicKey, secretKey } = ml_dsa65.keygen();" },
  { lang:['js','auto'], sev:'MEDIUM', name:'SHA-1 Hash', pattern:/['"]SHA-1['"]/gi, hndl:5, qdayRisk:'MEDIUM', attack:"SHA-1 classically broken (SHAttered). Grover's reduces effective security to ~40-bit quantum.", fix:'Replace with SHA-256 (128-bit quantum security).', diffVuln:"crypto.subtle.digest('SHA-1', data)", diffFix:"crypto.subtle.digest('SHA-256', data)" },
  { lang:['js','auto'], sev:'HIGH', name:'JWT RS256 / RS512', pattern:/algorithm\s*:\s*['"]RS(256|384|512)['"]/gi, hndl:10, qdayRisk:'HIGH', attack:'RS256/RS512 JWTs use RSA. A quantum computer can forge any token.', fix:'Use HS256 for short-lived tokens. ML-DSA for long-lived.', diffVuln:"jwt.sign(payload, privateKey, { algorithm: 'RS256' })", diffFix:"jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256' })" },
  { lang:['js','auto'], sev:'HIGH', name:'Node.js RSA generateKeyPair', pattern:/generateKeyPair\s*\(\s*['"]rsa['"]/gi, hndl:15, qdayRisk:'HIGH', attack:"RSA keypairs broken by Shor's. Adversaries collect encrypted traffic now to decrypt post-CRQC.", fix:'Use @noble/post-quantum ml_kem768.', diffVuln:"crypto.generateKeyPair('rsa', { modulusLength: 2048 }, callback)", diffFix:"import { ml_kem768 } from '@noble/post-quantum/ml-kem';\nconst { publicKey, secretKey } = ml_kem768.keygen();" },
  { lang:['py','auto'], sev:'CRITICAL', name:'Python RSA Key Generation', pattern:/rsa\.generate_private_key|generate_private_key\s*\(\s*public_exponent/gi, hndl:15, qdayRisk:'HIGH', attack:"Python cryptography RSA — broken by Shor's on a CRQC.", fix:'Use liboqs-python: oqs.KeyEncapsulation("ML-KEM-768").', diffVuln:"private_key = rsa.generate_private_key(\n  public_exponent=65537, key_size=2048)", diffFix:"import oqs\nkem = oqs.KeyEncapsulation('ML-KEM-768')\npublic_key = kem.generate_keypair()" },
  { lang:['py','auto'], sev:'CRITICAL', name:'Python ECDH / EC Key', pattern:/ec\.generate_private_key|EllipticCurvePrivateKey/gi, hndl:15, qdayRisk:'HIGH', attack:"ECDH/ECDSA over P-256 — all broken by quantum Shor's.", fix:'Use liboqs-python ML-KEM-768.', diffVuln:"private_key = ec.generate_private_key(ec.SECP256R1())", diffFix:"import oqs\nkem = oqs.KeyEncapsulation('ML-KEM-768')\npublic_key = kem.generate_keypair()" },
  { lang:['py','auto'], sev:'MEDIUM', name:'Python hashlib MD5', pattern:/hashlib\.md5|md5\(\)/gi, hndl:2, qdayRisk:'MEDIUM', attack:"MD5 classically broken. Grover's provides additional speedup.", fix:'Use hashlib.sha256().', diffVuln:"h = hashlib.md5(data).hexdigest()", diffFix:"h = hashlib.sha256(data).hexdigest()" },
  { lang:['py','auto'], sev:'MEDIUM', name:'Python hashlib SHA-1', pattern:/hashlib\.sha1/gi, hndl:3, qdayRisk:'MEDIUM', attack:"SHA-1 classically broken. Grover's reduces quantum security to ~40-bit.", fix:'Replace with hashlib.sha256().', diffVuln:"h = hashlib.sha1(data).hexdigest()", diffFix:"h = hashlib.sha256(data).hexdigest()" },
  { lang:['py','auto'], sev:'HIGH', name:'Python JWT RS256', pattern:/algorithm\s*=\s*['"]RS(256|384|512)/gi, hndl:10, qdayRisk:'HIGH', attack:"RSA JWT signatures quantum-vulnerable. Private key derivable by Shor's.", fix:'Use HS256 short-lived tokens or ML-DSA for high-value signing.', diffVuln:"token = jwt.encode(payload, private_key, algorithm='RS256')", diffFix:"token = jwt.encode(payload, os.environ['SECRET'], algorithm='HS256')" },
  { lang:['java','auto'], sev:'CRITICAL', name:'Java RSA KeyPairGenerator', pattern:/KeyPairGenerator\.getInstance\s*\(\s*['"]RSA['"]/gi, hndl:15, qdayRisk:'HIGH', attack:"Java RSA broken by Shor's. Any keypair generated today is future-harvestable.", fix:'Use BouncyCastle 1.78+ MLKEMKeyPairGenerator.', diffVuln:'KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");\nkpg.initialize(2048);', diffFix:'MLKEMKeyPairGenerator gen = new MLKEMKeyPairGenerator();\ngen.init(new MLKEMKeyGenerationParameters(new SecureRandom(), MLKEMParameters.ml_kem_768));' },
  { lang:['java','auto'], sev:'CRITICAL', name:'Java EC KeyPairGenerator', pattern:/KeyPairGenerator\.getInstance\s*\(\s*['"]EC['"]/gi, hndl:15, qdayRisk:'HIGH', attack:"Java EC (ECDH/ECDSA) over P-256 — zero quantum resistance.", fix:'Migrate to ML-KEM-768 or ML-DSA-65 via BouncyCastle 1.78+.', diffVuln:'KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");', diffFix:'MLDSAKeyPairGenerator gen = new MLDSAKeyPairGenerator();\ngen.init(new MLDSAKeyGenerationParameters(new SecureRandom(), MLDSAParameters.ml_dsa_65));' },
  { lang:['go','auto'], sev:'CRITICAL', name:'Go crypto/rsa GenerateKey', pattern:/rsa\.GenerateKey|rsa\.GenerateMultiPrimeKey/gi, hndl:15, qdayRisk:'HIGH', attack:"Go crypto/rsa — broken by quantum Shor's algorithm.", fix:'Use github.com/cloudflare/circl kyber768.', diffVuln:'privateKey, _ := rsa.GenerateKey(rand.Reader, 2048)', diffFix:'import "github.com/cloudflare/circl/kem/kyber/kyber768"\nscheme := kyber768.Scheme()\npk, sk, _ := scheme.GenerateKeyPair()' },
  { lang:['go','auto'], sev:'CRITICAL', name:'Go crypto/elliptic ECDH', pattern:/elliptic\.P256|elliptic\.P384|ecdh\.P256|ecdh\.P384/gi, hndl:15, qdayRisk:'HIGH', attack:"Go ECDH/ECDSA — ECDLP has no quantum resistance.", fix:'Use circl Kyber768 for key exchange.', diffVuln:'curve := elliptic.P256()\npriv, _ := ecdsa.GenerateKey(curve, rand.Reader)', diffFix:'import "github.com/cloudflare/circl/kem/kyber/kyber768"\nscheme := kyber768.Scheme()\npk, sk, _ := scheme.GenerateKeyPair()' },
  { lang:['cs','auto'], sev:'CRITICAL', name:'C# RSA.Create()', pattern:/RSA\.Create\s*\(|new RSACryptoServiceProvider|new RSACng/gi, hndl:15, qdayRisk:'HIGH', attack:".NET RSA broken by Shor's. System.Security.Cryptography wraps OpenSSL/CNG RSA.", fix:'Use .NET 9 MLKem (preview) or BouncyCastle.NET.', diffVuln:'using var rsa = RSA.Create(2048);', diffFix:'using var kem = MLKem.Create(MLKemAlgorithm.MLKem768);' },
  { lang:['cs','auto'], sev:'CRITICAL', name:'C# ECDiffieHellman', pattern:/ECDiffieHellman\.Create|ECDsa\.Create/gi, hndl:15, qdayRisk:'HIGH', attack:".NET ECDH/ECDSA broken by Shor's. All named curves affected.", fix:'Migrate to ML-KEM-768 via .NET 9 preview or BouncyCastle.NET.', diffVuln:'using var ecdh = ECDiffieHellman.Create(ECCurve.NamedCurves.nistP256);', diffFix:'var kemParams = new MLKEMKeyGenerationParameters(new SecureRandom(), MLKEMParameters.ml_kem_768);' },
  { lang:['auto','js','py','java','go','cs','rs'], sev:'CRITICAL', name:'TLS 1.0 / 1.1 Configuration', pattern:/TLSv1\.0|TLSv1\.1|SSLv3/gi, hndl:10, qdayRisk:'HIGH', attack:'TLS 1.0/1.1 with RSA key exchange — quantum-vulnerable AND classically deprecated.', fix:'Enforce TLS 1.3 minimum. Enable hybrid X25519+ML-KEM-768.', diffVuln:"ssl_protocols TLSv1 TLSv1.1;", diffFix:"ssl_protocols TLSv1.3;\n# Enable hybrid PQC when available" },
  { lang:['auto','js','py','java','go','cs','rs'], sev:'HIGH', name:'Hardcoded RSA Private Key', pattern:/-----BEGIN RSA PRIVATE KEY-----|-----BEGIN PRIVATE KEY-----/gi, hndl:15, qdayRisk:'CRITICAL', attack:'Hardcoded key in source is immediately harvestable. Quantum retroactive decryption applies.', fix:'Remove from code. Rotate the key. Use a secrets manager.', diffVuln:"const PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\\n...'", diffFix:"const privateKey = process.env.PRIVATE_KEY; // Never hardcode keys" },
];

const EXT_MAP: Record<string,string> = { '.js':'js','.ts':'js','.jsx':'js','.tsx':'js','.py':'py','.java':'java','.go':'go','.cs':'cs','.rs':'rs' };
const LANG_NAMES: Record<string,string> = { js:'JavaScript',py:'Python',java:'Java',go:'Go',cs:'C#/.NET',rs:'Rust',auto:'Unknown' };

@Injectable({ providedIn: 'root' })
export class ScanEngineService {
  private auth = inject(AuthService);

  detectLang(code: string): string {
    if (/import\s+\w+\s+from|require\s*\(|const\s+\w+\s*=|async\s+function|=>\s*\{/.test(code)) return 'js';
    if (/def\s+\w+\s*\(|import\s+\w+|print\s*\(|hashlib\.|cryptography\./.test(code)) return 'py';
    if (/public\s+class|import\s+java\.|KeyPairGenerator|MessageDigest/.test(code)) return 'java';
    if (/func\s+\w+\s*\(|package\s+main|import\s*\(|:=/.test(code)) return 'go';
    if (/using\s+System|namespace\s+\w+|public\s+static/.test(code)) return 'cs';
    if (/fn\s+\w+\s*\(|let\s+mut|use\s+\w+::|impl\s+\w+/.test(code)) return 'rs';
    return 'auto';
  }
  detectLangFromFile(name: string): string { return EXT_MAP['.' + name.split('.').pop()!.toLowerCase()] ?? 'auto'; }
  langName(l: string): string { return LANG_NAMES[l] ?? l; }

  scan(code: string, lang: string, filePath?: string): ScanFinding[] {
    const lines = code.split('\n'); const findings: ScanFinding[] = [];
    for (const vuln of VULN_DB) {
      if (!vuln.lang.includes(lang) && !vuln.lang.includes('auto')) continue;
      const re = new RegExp(vuln.pattern.source, 'gi'); let m: RegExpExecArray | null;
      while ((m = re.exec(code)) !== null) {
        const lineNum = code.substring(0, m.index).split('\n').length;
        const lineText = (lines[lineNum - 1] ?? '').trim();
        if (findings.some(f => f.lineNum === lineNum && f.vuln.name === vuln.name)) continue;
        findings.push({ lineNum, lineText, filePath, vuln: { ...vuln } });
      }
    }
    const ord: Record<string,number> = { CRITICAL:0, HIGH:1, MEDIUM:2, LOW:3 };
    return findings.sort((a, b) => (ord[a.vuln.sev]??5)-(ord[b.vuln.sev]??5) || a.lineNum-b.lineNum);
  }

  riskScore(findings: ScanFinding[]): number {
    if (!findings.length) return 0;
    const w: Record<string,number> = { CRITICAL:100, HIGH:75, MEDIUM:40, LOW:15 };
    return Math.min(100, Math.round(findings.reduce((s, f) => s + (w[f.vuln.sev]??10), 0) / findings.length));
  }
  hndlMax(findings: ScanFinding[]): number { return findings.reduce((m, f) => Math.max(m, f.vuln.hndl), 0); }

  async saveToDb(findings: ScanFinding[], lang: string): Promise<void> {
    try {
      const sb = this.auth.client;
      const { data: { user } } = await sb.auth.getUser(); if (!user) return;
      const { data: scan } = await sb.from('scans').insert({
        user_id: user.id, status: 'complete',
        total_findings: findings.length,
        critical_count: findings.filter(f => f.vuln.sev==='CRITICAL').length,
        high_count:     findings.filter(f => f.vuln.sev==='HIGH').length,
        medium_count:   findings.filter(f => f.vuln.sev==='MEDIUM').length,
        low_count:      findings.filter(f => f.vuln.sev==='LOW').length,
        risk_score: this.riskScore(findings), hndl_max: this.hndlMax(findings),
        files_scanned: 1, triggered_by: 'manual', completed_at: new Date().toISOString(),
      }).select().single();
      if (!scan || !findings.length) return;
      await sb.from('findings').insert(findings.map(f => ({
        scan_id: (scan as any).id, user_id: user.id,
        file_path: f.filePath ?? 'untitled', line_number: f.lineNum, line_text: f.lineText,
        algorithm: f.vuln.name, severity: f.vuln.sev, hndl_years: f.vuln.hndl,
        qday_risk: f.vuln.qdayRisk, attack_description: f.vuln.attack, fix_description: f.vuln.fix,
        diff_vulnerable: f.vuln.diffVuln, diff_fix: f.vuln.diffFix,
      })));
      await sb.rpc('increment_scan_count', { p_user_id: user.id });
    } catch { /* silently skip if not logged in */ }
  }

  readonly examples: Record<string, string> = {
    js: `// E-commerce payment service — Node.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate RSA keypair for API authentication
crypto.generateKeyPair('rsa', { modulusLength: 2048 }, (err, pub, priv) => {
  console.log('RSA keys generated');
});

// Sign payment JWT with RS256
function issuePaymentToken(userId, amount) {
  return jwt.sign({ userId, amount }, process.env.RSA_PRIVATE_KEY, { algorithm: 'RS256' });
}

// ECDH session key agreement
async function deriveSessionKey() {
  return crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
}

// Encrypt card data with RSA-OAEP
async function encryptCard(cardNumber, publicKey) {
  const key = await crypto.subtle.importKey('spki', publicKey,
    { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  return crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, new TextEncoder().encode(cardNumber));
}

// Hash with SHA-1 (legacy checksum)
function legacyHash(data) {
  return crypto.createHash('SHA-1').update(data).digest('hex');
}`,
    py: `# Healthcare records API — Python
from cryptography.hazmat.primitives.asymmetric import rsa, ec
from cryptography.hazmat.backends import default_backend
import hashlib, jwt, os

# Generate RSA private key for patient record signing
private_key = rsa.generate_private_key(
    public_exponent=65537, key_size=2048, backend=default_backend()
)

# EC keypair for provider authentication  
ec_key = ec.generate_private_key(ec.SECP256R1(), default_backend())

# JWT with RS256 for API auth
def create_provider_token(provider_id):
    return jwt.encode({'sub': provider_id}, private_key, algorithm='RS256')

# Legacy password hashing
def hash_pin(pin):
    return hashlib.md5(pin.encode()).hexdigest()

def verify_file_integrity(filepath):
    h = hashlib.sha1()
    with open(filepath, 'rb') as f:
        h.update(f.read())
    return h.hexdigest()`
  };
}
