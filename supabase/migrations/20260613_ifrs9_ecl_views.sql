create or replace function ar_days_late(due_date date)
returns integer language sql immutable as $$
  select greatest((current_date - due_date)::integer, 0)
$$;

create or replace function ar_aging_bucket(days_late integer)
returns text language sql immutable as $$
  select case
    when days_late <= 0 then 'Current'
    when days_late between 1 and 30 then '1-30'
    when days_late between 31 and 60 then '31-60'
    when days_late between 61 and 90 then '61-90'
    when days_late between 91 and 180 then '91-180'
    when days_late between 181 and 360 then '181-360'
    else '361+'
  end
$$;

create or replace function ecl_bucket(days_late integer)
returns text language sql immutable as $$
  select case
    when days_late <= 0 then 'Current'
    when days_late between 1 and 30 then '1-30'
    when days_late between 31 and 60 then '31-60'
    when days_late between 61 and 90 then '61-90'
    when days_late between 91 and 120 then '91-120'
    when days_late between 121 and 180 then '121-180'
    when days_late between 181 and 360 then '181-360'
    else '361+'
  end
$$;

create or replace function ecl_provision_rate(days_late integer)
returns numeric language sql immutable as $$
  select case
    when days_late >= 180 then 1.00
    when days_late >= 121 then 0.55
    when days_late >= 91 then 0.35
    when days_late >= 61 then 0.18
    when days_late >= 31 then 0.08
    when days_late >= 1 then 0.03
    else 0.01
  end
$$;

create or replace view ar_invoice_analytics as
select
  i.*,
  ar_days_late(i.due_date) as days_late,
  ar_aging_bucket(ar_days_late(i.due_date)) as aging_bucket,
  ecl_bucket(ar_days_late(i.due_date)) as ecl_bucket,
  ecl_provision_rate(ar_days_late(i.due_date)) as ecl_rate,
  round(i.amount_due_remaining * ecl_provision_rate(ar_days_late(i.due_date)), 2) as ecl_provision_amount,
  c.contact_email,
  c.trade_license_expiry,
  c.security_cheque_expiry,
  c.risk_rating
from ar_invoices i
join ar_customers c on c.customer_number = i.customer_number;

create or replace view ifrs7_bu_dso_reporting as
select
  business_unit,
  sum(original_amount) as gross_ar,
  sum(applied_amount) as paid_amount,
  sum(amount_due_remaining) as outstanding_amount,
  round(sum(amount_due_remaining * ar_days_late(due_date)) / nullif(sum(amount_due_remaining),0), 2) as weighted_avg_days_late,
  round(sum(amount_due_remaining) / nullif(sum(original_amount),0) * 365, 2) as dso_proxy,
  count(*) filter (where status = 'OPEN') as open_invoice_count,
  count(*) filter (where ar_days_late(due_date) > 90) as over_90_invoice_count
from ar_invoices
group by business_unit;
