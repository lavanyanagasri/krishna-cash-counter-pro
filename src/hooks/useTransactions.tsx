
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

type Transaction = {
  id: string;
  date: string;
  time: string;
  sales_type: string;
  xerox_type: string;
  paper_size: string;
  quantity: number;
  cost: number;
  estimation: number;
  final_cost: number;
  service_id?: string;
  service_type?: 'xerox' | 'scanning' | 'net_printing' | 'spiral_binding' | 'lamination' | 'rubber_stamps';
  notes?: string;
  created_at: string;
  updated_at: string;
};

type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;

export const useTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);

  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions from database",
        variant: "destructive",
      });
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [user]);

  const addTransaction = async (transaction: TransactionInsert) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add transactions to database",
        variant: "destructive",
      });
      return;
    }

    setIsAddingTransaction(true);
    
    try {
      // Use the authenticated user's ID directly from Supabase Auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error('No authenticated user found');
      }

      // Prepare the transaction data for database storage
      const transactionData = {
        user_id: authUser.id, // Use the actual Supabase Auth user ID
        date: transaction.date,
        time: transaction.time,
        sales_type: transaction.sales_type as 'Cash' | 'PhonePe',
        xerox_type: transaction.xerox_type as 'Black' | 'White' | 'Color',
        paper_size: transaction.paper_size as 'A4' | 'A3' | 'A2' | 'A1' | 'A0',
        quantity: transaction.quantity,
        cost: transaction.cost,
        estimation: transaction.estimation,
        final_cost: transaction.final_cost,
        service_id: transaction.service_id,
        service_type: transaction.service_type,
        notes: transaction.notes
      };

      console.log('Storing transaction in database:', transactionData);

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      // Update local state with the new transaction from database
      setTransactions(prev => [data, ...prev]);
      
      toast({
        title: "Transaction Saved",
        description: "Transaction successfully stored in database",
      });

      return data;
    } catch (error) {
      console.error('Error storing transaction in database:', error);
      
      toast({
        title: "Database Error",
        description: "Failed to save transaction to database. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    setIsDeletingTransaction(true);
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state after successful database deletion
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Transaction Deleted",
        description: "Transaction removed from database",
      });
    } catch (error) {
      console.error('Error deleting transaction from database:', error);
      
      toast({
        title: "Database Error",
        description: "Failed to delete transaction from database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingTransaction(false);
    }
  };

  return {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    isAddingTransaction,
    isDeletingTransaction,
    fetchTransactions,
  };
};
