
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  customer_name?: string;
  customer_phone?: string;
  payment_method?: string;
  discount_reason?: string;
  transaction_reference?: string;
  is_multi_service?: boolean;
  created_at: string;
  updated_at: string;
};

type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;

type TransactionItem = {
  id: string;
  transaction_id: string;
  service_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
};

type TransactionItemInsert = Omit<TransactionItem, 'id' | 'created_at' | 'updated_at'>;

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

  const addTransaction = async (transaction: TransactionInsert & { items?: TransactionItemInsert[] }) => {
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
      // Check if we have a valid Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // For admin users who might not have a Supabase session but are authenticated locally
        if (user.email === 'admin@vaishnavi.com') {
          toast({
            title: "Authentication Issue",
            description: "Admin account needs to be properly authenticated with Supabase. Please sign out and sign in again.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Authentication Required",
          description: "Please sign in with Supabase authentication to add transactions.",
          variant: "destructive",
        });
        return;
      }

      const userId = session.user.id;
      console.log('Using Supabase authenticated user ID for transaction:', userId);

      // Prepare the transaction data for database storage
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
        notes: transaction.notes,
        customer_name: transaction.customer_name,
        customer_phone: transaction.customer_phone,
        payment_method: transaction.payment_method || transaction.sales_type,
        discount_reason: transaction.discount_reason,
        transaction_reference: transaction.transaction_reference,
        is_multi_service: transaction.is_multi_service || false
      };

      console.log('Storing transaction in database:', transactionData);

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // If this is a multi-service transaction, also insert the transaction items
      if (transaction.items && transaction.items.length > 0) {
        const itemsData = transaction.items.map(item => ({
          ...item,
          transaction_id: data.id
        }));

        const { error: itemsError } = await supabase
          .from('transaction_items')
          .insert(itemsData);

        if (itemsError) {
          console.error('Error inserting transaction items:', itemsError);
          // Don't throw here as the main transaction was successful
          toast({
            title: "Partial Success",
            description: "Transaction saved but some item details may be missing",
            variant: "destructive",
          });
        }
      }

      // Update local state with the new transaction from database
      setTransactions(prev => [data, ...prev]);
      
      toast({
        title: "Transaction Added Successfully",
        description: "Transaction has been saved to the database",
      });

      return data;
    } catch (error) {
      console.error('Error storing transaction in database:', error);
      
      toast({
        title: "Failed to Add Transaction",
        description: "Could not save transaction to database. Please try again.",
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
      // Delete transaction items first (will be handled by CASCADE)
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
