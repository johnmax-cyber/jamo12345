# Supabase Database Setup Guide

Follow these steps to set up your Supabase database tables and Row Level Security (RLS) policies for **Susan's Company**.

You can execute the SQL below directly within the **SQL Editor** tab of your Supabase Dashboard.

---

## 1. Create Tables

```sql
-- 1. PRODUCTS TABLE
create table public.products (
  id bigint primary key,
  name text not null,
  description text,
  price numeric not null,
  discount_price numeric,
  category text checked (category in ('clothes', 'books')),
  image text,
  is_new boolean default false,
  on_sale boolean default false,
  original_price numeric,
  in_stock boolean default true,
  whatsapp_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ORDERS TABLE
create table public.orders (
  id bigint primary key,
  product_id bigint,
  product_name text,
  customer_name text not null,
  customer_phone text not null,
  delivery_location text not null,
  payment_method text not null,
  total_amount numeric not null,
  status text not null checked (status in ('pending', 'completed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. MESSAGES TABLE
create table public.messages (
  id bigint primary key,
  name text not null,
  phone text not null,
  interest text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 2. Row Level Security (RLS) Policies

Enable Row Level Security on each table to secure read/write operations. The administrator's authorized email is `johnmax4354@gmail.com`.

```sql
-- Enable RLS on all tables
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;

-- ==========================================
-- PRODUCTS POLICIES
-- ==========================================

-- Policy: Anyone can read products
create policy "Allow public read access to products"
on public.products for select
using (true);

-- Policy: Only johnmax4354@gmail.com can manage (insert, update, delete) products
create policy "Allow johnmax4354@gmail.com to manage products"
on public.products for all
using (
  auth.role() = 'authenticated' and 
  auth.jwt() ->> 'email' = 'johnmax4354@gmail.com'
)
with check (
  auth.role() = 'authenticated' and 
  auth.jwt() ->> 'email' = 'johnmax4354@gmail.com'
);


-- ==========================================
-- ORDERS POLICIES
-- ==========================================

-- Policy: Anyone can insert an order (so customers can check out)
create policy "Allow public to submit orders"
on public.orders for insert
with check (true);

-- Policy: Only johnmax4354@gmail.com can view, update, or delete orders
create policy "Allow johnmax4354@gmail.com to manage orders"
on public.orders for all
using (
  auth.role() = 'authenticated' and 
  auth.jwt() ->> 'email' = 'johnmax4354@gmail.com'
)
with check (
  auth.role() = 'authenticated' and 
  auth.jwt() ->> 'email' = 'johnmax4354@gmail.com'
);


-- ==========================================
-- MESSAGES POLICIES
-- ==========================================

-- Policy: Anyone can insert messages (so customers can send contact/inquiries)
create policy "Allow public to submit messages"
on public.messages for insert
with check (true);

-- Policy: Only johnmax4354@gmail.com can view, update, or delete messages
create policy "Allow johnmax4354@gmail.com to manage messages"
on public.messages for all
using (
  auth.role() = 'authenticated' and 
  auth.jwt() ->> 'email' = 'johnmax4354@gmail.com'
)
with check (
  auth.role() = 'authenticated' and 
  auth.jwt() ->> 'email' = 'johnmax4354@gmail.com'
);
```
