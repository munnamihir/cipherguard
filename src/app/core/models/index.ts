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
