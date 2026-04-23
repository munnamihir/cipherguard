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
