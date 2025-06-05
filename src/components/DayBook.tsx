import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Database } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useServices, Service } from "@/hooks/useServices";
import { Textarea } from "@/components/ui/textarea";
import MultiServiceSelector from "./MultiServiceSelector";

type SalesType = "Cash" | "PhonePe";

const DayBook = () => {
  const { transactions, addTransaction, deleteTransaction, isAddingTransaction } = useTransactions();
  const { services, isLoading: servicesLoading } = useServices();
  
  const [salesType, setSalesType] = useState<SalesType>("Cash");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState("");
  const [estimation, setEstimation] = useState("");
  const [notes, setNotes] = useState("");

  const calculateFinalCost = () => {
    const qty = parseInt(quantity) || 0;
    const cost = selectedService ? qty * selectedService.price : 0;
    const est = parseFloat(estimation) || 0;
    return Math.max(0, cost - est);
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service || null);
  };

  const handleAddTransaction = async () => {
    if (!quantity || parseInt(quantity) <= 0 || !selectedService) {
      return;
    }

    const qty = parseInt(quantity);
    const cost = qty * selectedService.price;
    const est = parseFloat(estimation) || 0;
    const finalCost = Math.max(0, cost - est);

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    try {
      await addTransaction({
        date: currentDate,
        time: currentTime,
        sales_type: salesType,
        xerox_type: 'Black', // Legacy field - keeping for compatibility
        paper_size: selectedService.paper_size || 'A4',
        quantity: qty,
        cost,
        estimation: est,
        final_cost: finalCost,
        service_id: selectedService.id,
        service_type: selectedService.service_type,
        notes: notes.trim() || undefined,
      });

      // Reset form after successful database storage
      setQuantity("");
      setEstimation("");
      setNotes("");
      setSelectedService(null);
    } catch (error) {
      console.error('Error adding transaction to database:', error);
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.service_type]) {
      acc[service.service_type] = [];
    }
    acc[service.service_type].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const todayTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date).toLocaleDateString('en-IN');
    const today = new Date().toLocaleDateString('en-IN');
    return transactionDate === today;
  });

  const todayTotal = todayTransactions.reduce((sum, t) => sum + t.final_cost, 0);
  const todayPages = todayTransactions.reduce((sum, t) => sum + t.quantity, 0);

  const getServiceTypeLabel = (serviceType: string) => {
    const labels = {
      xerox: 'Xerox',
      scanning: 'Scanning',
      net_printing: 'Net Printing',
      spiral_binding: 'Spiral Binding',
      lamination: 'Lamination',
      rubber_stamps: 'Rubber Stamps'
    };
    return labels[serviceType as keyof typeof labels] || serviceType;
  };

  return (
    <div className="space-y-6">
      {/* Multi-Service Transaction */}
      <MultiServiceSelector 
        services={services}
        onAddTransaction={addTransaction}
        isLoading={isAddingTransaction}
      />

      {/* Single Service Transaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Single Service Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="service">Select Service for Customer</Label>
              <Select 
                value={selectedService?.id || ""} 
                onValueChange={handleServiceChange}
                disabled={servicesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose any service for the customer" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedServices).map(([serviceType, serviceList]) => (
                    <div key={serviceType}>
                      <div className="px-2 py-1 text-sm font-semibold text-gray-600 bg-gray-100">
                        {getServiceTypeLabel(serviceType)}
                      </div>
                      {serviceList.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{service.name}</span>
                            <span className="ml-2 font-semibold">₹{service.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                {selectedService?.service_type === 'rubber_stamps' ? 'Quantity' : 'Pages/Items'}
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="text"
                value={`₹${selectedService ? (parseInt(quantity) || 0) * selectedService.price : 0}`}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimation">Discount (₹)</Label>
              <Input
                id="estimation"
                type="number"
                placeholder="Enter discount"
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
                className="bg-blue-600 hover:bg-blue-700 w-full"
                disabled={isAddingTransaction || !selectedService || !quantity}
              >
                <Database className="w-4 h-4 mr-2" />
                {isAddingTransaction ? "Saving..." : "Add Single Service"}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="notes">Customer Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any customer-specific notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Today's Summary (From Database)
          </CardTitle>
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
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-orange-600">{todayPages}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Recent Transactions (Database Records)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found in database.</p>
              <p>Add your first transaction above to store it in the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Sales Type</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Final Cost</TableHead>
                    <TableHead>Customer Notes</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const service = services.find(s => s.id === transaction.service_id);
                    return (
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
                          <div className="text-sm">
                            <div className="font-medium">{service?.name || 'Legacy Service'}</div>
                            <div className="text-gray-500">{getServiceTypeLabel(transaction.service_type || 'xerox')}</div>
                            {service?.paper_size && (
                              <div className="text-xs text-gray-400">{service.paper_size}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>₹{transaction.cost}</TableCell>
                        <TableCell>₹{transaction.estimation}</TableCell>
                        <TableCell className="font-semibold">₹{transaction.final_cost}</TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.notes || '-'}</TableCell>
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
                    );
                  })}
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
