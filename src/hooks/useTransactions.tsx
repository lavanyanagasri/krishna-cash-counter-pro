
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
        description: "Please log in to add transactions",
        variant: "destructive",
      });
      return;
    }

    setIsAddingTransaction(true);
    
    try {
      // Generate a proper UUID for the user_id if it's not already one
      let userId = user.id;
      if (!userId || userId === 'admin' || userId === 'user') {
        // Generate a consistent UUID based on the email
        const crypto = window.crypto || (window as any).msCrypto;
        const encoder = new TextEncoder();
        const data = encoder.encode(user.email);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Convert to UUID format (8-4-4-4-12)
        userId = [
          hashHex.substring(0, 8),
          hashHex.substring(8, 12),
          hashHex.substring(12, 16),
          hashHex.substring(16, 20),
          hashHex.substring(20, 32)
        ].join('-');
      }

      // Prepare the transaction data with proper typing and user_id
      const transactionData = {
        user_id: userId,
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

      console.log('Adding transaction with data:', transactionData);

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
      
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
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
      
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
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
