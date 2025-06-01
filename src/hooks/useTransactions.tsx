
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
      // Fallback to localStorage for compatibility
      const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
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
    if (!user) return;

    setIsAddingTransaction(true);
    
    try {
      // Prepare the transaction data with proper typing and user_id
      const transactionData = {
        user_id: user.id || 'anonymous',
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

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      setTransactions(prev => [data, ...prev]);
      
      toast({
        title: "Transaction Added",
        description: "Transaction recorded successfully",
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      
      // Fallback to localStorage
      const newTransaction: Transaction = {
        ...transaction,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const savedTransactions = localStorage.getItem('transactions');
      const existingTransactions = savedTransactions ? JSON.parse(savedTransactions) : [];
      const updatedTransactions = [newTransaction, ...existingTransactions];
      
      setTransactions(updatedTransactions);
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      toast({
        title: "Transaction Added (Local)",
        description: "Transaction saved locally",
      });
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

      setTransactions(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Transaction Deleted",
        description: "Transaction removed successfully",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      
      // Fallback to localStorage
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      toast({
        title: "Transaction Deleted (Local)",
        description: "Transaction removed locally",
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
