-- Allow authenticated users to manage brokers (insert, update, delete)
-- This replaces the restrictive policy that only allowed admins and managers

-- IMPORTANT: Execute este script no SQL Editor do Supabase Dashboard
-- Vá em: Dashboard > SQL Editor > New Query > Cole este script > Run

-- 1. Remover TODAS as políticas existentes da tabela brokers
DROP POLICY IF EXISTS "Authenticated users can view brokers" ON public.brokers;
DROP POLICY IF EXISTS "Admins and managers can manage brokers" ON public.brokers;
DROP POLICY IF EXISTS "Authenticated users can manage brokers" ON public.brokers;
DROP POLICY IF EXISTS "Authenticated users can insert brokers" ON public.brokers;
DROP POLICY IF EXISTS "Authenticated users can update brokers" ON public.brokers;
DROP POLICY IF EXISTS "Authenticated users can delete brokers" ON public.brokers;

-- 2. Criar políticas separadas para cada operação

-- Política para SELECT (visualizar)
CREATE POLICY "Authenticated users can view brokers"
  ON public.brokers FOR SELECT
  TO authenticated
  USING (true);

-- Política para INSERT (criar) - IMPORTANTE: WITH CHECK é necessário para INSERT
CREATE POLICY "Authenticated users can insert brokers"
  ON public.brokers FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE (atualizar)
CREATE POLICY "Authenticated users can update brokers"
  ON public.brokers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para DELETE (deletar)
CREATE POLICY "Authenticated users can delete brokers"
  ON public.brokers FOR DELETE
  TO authenticated
  USING (true);

