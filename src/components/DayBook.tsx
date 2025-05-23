
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  time: string;
  salesType: "Cash" | "PhonePe";
  xeroxType: "Black" | "White";
  quantity: number;
  cost: number;
  estimation: number;
  finalCost: number;
}

const DayBook = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [salesType, setSalesType] = useState<"Cash" | "PhonePe">("Cash");
  const [xeroxType, setXeroxType] = useState<"Black" | "White">("Black");
  const [quantity, setQuantity] = useState("");
  const [estimation, setEstimation] = useState("");
  const { toast } = useToast();

  // Cost per page (in rupees)
  const costs = {
    Black: 2,
    White: 1
  };

  const calculateFinalCost = () => {
    const qty = parseInt(quantity) || 0;
    const cost = qty * costs[xeroxType];
    const est = parseFloat(estimation) || 0;
    return Math.max(0, cost - est);
  };

  const addTransaction = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    const qty = parseInt(quantity);
    const cost = qty * costs[xeroxType];
    const est = parseFloat(estimation) || 0;
    const finalCost = Math.max(0, cost - est);

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN'),
      salesType,
      xeroxType,
      quantity: qty,
      cost,
      estimation: est,
      finalCost
    };

    setTransactions([newTransaction, ...transactions]);
    
    // Reset form
    setQuantity("");
    setEstimation("");
    
    toast({
      title: "Transaction Added",
      description: `Added ${qty} ${xeroxType.toLowerCase()} xerox copies`,
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast({
      title: "Transaction Deleted",
      description: "Transaction removed successfully",
    });
  };

  const todayTotal = transactions
    .filter(t => t.date === new Date().toLocaleDateString('en-IN'))
    .reduce((sum, t) => sum + t.finalCost, 0);

  return (
    <div className="space-y-6">
      {/* Add Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salesType">Sales Type</Label>
              <Select value={salesType} onValueChange={(value: "Cash" | "PhonePe") => setSalesType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="PhonePe">PhonePe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="xeroxType">Xerox Type</Label>
              <Select value={xeroxType} onValueChange={(value: "Black" | "White") => setXeroxType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Black">Black (₹2/page)</SelectItem>
                  <SelectItem value="White">White (₹1/page)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="No. of pages"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="text"
                value={`₹${(parseInt(quantity) || 0) * costs[xeroxType]}`}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimation">Estimation (₹)</Label>
              <Input
                id="estimation"
                type="number"
                placeholder="Discount/Est."
                value={estimation}
                onChange={(e) => setEstimation(e.target.value)}
                min="0"
                step="0.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalCost">Final Cost</Label>
              <Input
                id="finalCost"
                type="text"
                value={`₹${calculateFinalCost()}`}
                readOnly
                className="bg-green-50 font-semibold"
              />
            </div>
          </div>

          <Button 
            onClick={addTransaction}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600">
                {transactions.filter(t => t.date === new Date().toLocaleDateString('en-IN')).length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{todayTotal}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-orange-600">
                {transactions
                  .filter(t => t.date === new Date().toLocaleDateString('en-IN'))
                  .reduce((sum, t) => sum + t.quantity, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions recorded yet.</p>
              <p>Add your first transaction above to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Sales Type</TableHead>
                    <TableHead>Xerox Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Estimation</TableHead>
                    <TableHead>Final Cost</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.time}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.salesType === 'Cash' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.salesType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.xeroxType === 'Black' 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {transaction.xeroxType}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>₹{transaction.cost}</TableCell>
                      <TableCell>₹{transaction.estimation}</TableCell>
                      <TableCell className="font-semibold">₹{transaction.finalCost}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => deleteTransaction(transaction.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DayBook;
