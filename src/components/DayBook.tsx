
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";

type SalesType = "Cash" | "PhonePe";
type XeroxType = "Black" | "White" | "Color";
type PaperSize = "A4" | "A3" | "A2" | "A1" | "A0";

const DayBook = () => {
  const { transactions, addTransaction, deleteTransaction, isAddingTransaction } = useTransactions();
  const [salesType, setSalesType] = useState<SalesType>("Cash");
  const [xeroxType, setXeroxType] = useState<XeroxType>("Black");
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");
  const [quantity, setQuantity] = useState("");
  const [estimation, setEstimation] = useState("");

  // Cost per page (in rupees) based on xerox type and paper size
  const costs = {
    Black: { A4: 2, A3: 5, A2: 10, A1: 20, A0: 40 },
    White: { A4: 1, A3: 3, A2: 7, A1: 15, A0: 30 },
    Color: { A4: 10, A3: 20, A2: 40, A1: 75, A0: 150 }
  };

  const calculateFinalCost = () => {
    const qty = parseInt(quantity) || 0;
    const cost = qty * costs[xeroxType][paperSize];
    const est = parseFloat(estimation) || 0;
    return Math.max(0, cost - est);
  };

  const handleAddTransaction = () => {
    if (!quantity || parseInt(quantity) <= 0) return;

    const qty = parseInt(quantity);
    const cost = qty * costs[xeroxType][paperSize];
    const est = parseFloat(estimation) || 0;
    const finalCost = Math.max(0, cost - est);

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format

    addTransaction({
      date: currentDate,
      time: currentTime,
      sales_type: salesType,
      xerox_type: xeroxType,
      paper_size: paperSize,
      quantity: qty,
      cost,
      estimation: est,
      final_cost: finalCost,
    });

    // Reset form
    setQuantity("");
    setEstimation("");
  };

  const todayTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date).toLocaleDateString('en-IN');
    const today = new Date().toLocaleDateString('en-IN');
    return transactionDate === today;
  });

  const todayTotal = todayTransactions.reduce((sum, t) => sum + t.final_cost, 0);
  const todayPages = todayTransactions.reduce((sum, t) => sum + t.quantity, 0);

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
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salesType">Sales Type</Label>
              <Select value={salesType} onValueChange={(value: SalesType) => setSalesType(value)}>
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
              <Select value={xeroxType} onValueChange={(value: XeroxType) => setXeroxType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Black">Black (₹{costs.Black.A4}/A4 page)</SelectItem>
                  <SelectItem value="White">White (₹{costs.White.A4}/A4 page)</SelectItem>
                  <SelectItem value="Color">Color (₹{costs.Color.A4}/A4 page)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paperSize">Paper Size</Label>
              <Select value={paperSize} onValueChange={(value: PaperSize) => setPaperSize(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (₹{costs[xeroxType].A4})</SelectItem>
                  <SelectItem value="A3">A3 (₹{costs[xeroxType].A3})</SelectItem>
                  <SelectItem value="A2">A2 (₹{costs[xeroxType].A2})</SelectItem>
                  <SelectItem value="A1">A1 (₹{costs[xeroxType].A1})</SelectItem>
                  <SelectItem value="A0">A0 (₹{costs[xeroxType].A0})</SelectItem>
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
                value={`₹${(parseInt(quantity) || 0) * costs[xeroxType][paperSize]}`}
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

            <div className="space-y-2 flex items-end">
              <Button 
                onClick={handleAddTransaction}
                className="bg-green-600 hover:bg-green-700 w-full"
                disabled={isAddingTransaction}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isAddingTransaction ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </div>
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
              <p className="text-2xl font-bold text-blue-600">{todayTransactions.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{todayTotal}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-orange-600">{todayPages}</p>
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
                    <TableHead>Paper Size</TableHead>
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
                      <TableCell>{new Date(transaction.date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>{transaction.time}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.sales_type === 'Cash' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.sales_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.xerox_type === 'Black' 
                            ? 'bg-gray-100 text-gray-800' 
                            : transaction.xerox_type === 'White'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.xerox_type}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.paper_size}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>₹{transaction.cost}</TableCell>
                      <TableCell>₹{transaction.estimation}</TableCell>
                      <TableCell className="font-semibold">₹{transaction.final_cost}</TableCell>
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
