
-- First, let's check what policies exist and create the missing ones

-- Drop existing policies if they exist and recreate them to ensure they're correct
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

-- Create the correct policies for transactions
CREATE POLICY "Users can insert their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on transaction_items if not already enabled
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for transaction_items if they exist
DROP POLICY IF EXISTS "Users can insert transaction items for their own transactions" ON public.transaction_items;
DROP POLICY IF EXISTS "Users can view transaction items for their own transactions" ON public.transaction_items;

-- Create policies for transaction_items
CREATE POLICY "Users can insert transaction items for their own transactions" 
  ON public.transaction_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = transaction_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view transaction items for their own transactions" 
  ON public.transaction_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = transaction_id AND user_id = auth.uid()
    )
  );
