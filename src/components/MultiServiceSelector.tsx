
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { Service } from "@/hooks/useServices";

type SalesType = "Cash" | "PhonePe";

type SelectedService = {
  service: Service;
  quantity: number;
  cost: number;
};

type MultiServiceSelectorProps = {
  services: Service[];
  onAddTransaction: (transaction: any) => Promise<any>;
  isLoading: boolean;
};

const MultiServiceSelector = ({ services, onAddTransaction, isLoading }: MultiServiceSelectorProps) => {
  const [salesType, setSalesType] = useState<SalesType>("Cash");
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [discount, setDiscount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.service_type]) {
      acc[service.service_type] = [];
    }
    acc[service.service_type].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

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

  const handleServiceToggle = (service: Service, checked: boolean) => {
    if (checked) {
      setSelectedServices(prev => [...prev, {
        service,
        quantity: 1,
        cost: service.price
      }]);
    } else {
      setSelectedServices(prev => prev.filter(item => item.service.id !== service.id));
    }
  };

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    setSelectedServices(prev => prev.map(item => 
      item.service.id === serviceId 
        ? { ...item, quantity, cost: item.service.price * quantity }
        : item
    ));
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(item => item.service.id !== serviceId));
  };

  const calculateTotals = () => {
    const totalCost = selectedServices.reduce((sum, item) => sum + item.cost, 0);
    const discountAmount = parseFloat(discount) || 0;
    const finalCost = Math.max(0, totalCost - discountAmount);
    const totalQuantity = selectedServices.reduce((sum, item) => sum + item.quantity, 0);
    
    return { totalCost, discountAmount, finalCost, totalQuantity };
  };

  const handleAddMultiServiceTransaction = async () => {
    if (selectedServices.length === 0) return;

    const { totalCost, discountAmount, finalCost, totalQuantity } = calculateTotals();
    
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    // Create a summary of all services
    const servicesSummary = selectedServices.map(item => 
      `${item.service.name} (${item.quantity}x)`
    ).join(', ');

    // Use the first service for compatibility with existing schema
    const primaryService = selectedServices[0].service;

    // Prepare transaction items for the new table
    const transactionItems = selectedServices.map(item => ({
      service_id: item.service.id,
      quantity: item.quantity,
      unit_cost: item.service.price,
      total_cost: item.cost
    }));

    try {
      await onAddTransaction({
        date: currentDate,
        time: currentTime,
        sales_type: salesType,
        xerox_type: 'Black', // Legacy field
        paper_size: primaryService.paper_size || 'A4',
        quantity: totalQuantity,
        cost: totalCost,
        estimation: discountAmount,
        final_cost: finalCost,
        service_id: primaryService.id,
        service_type: primaryService.service_type,
        notes: `Multi-service: ${servicesSummary}${notes ? ` | Notes: ${notes}` : ''}`,
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        payment_method: salesType,
        is_multi_service: true,
        items: transactionItems
      });

      // Reset form
      setSelectedServices([]);
      setDiscount("");
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
    } catch (error) {
      console.error('Error adding multi-service transaction:', error);
    }
  };

  const { totalCost, discountAmount, finalCost, totalQuantity } = calculateTotals();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Multi-Service Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name (Optional)</Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
            <Input
              id="customerPhone"
              placeholder="Enter phone number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salesType">Payment Method</Label>
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
        </div>

        {/* Service Selection */}
        <div className="space-y-4">
          <Label>Select Services</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded-lg p-4">
            {Object.entries(groupedServices).map(([serviceType, serviceList]) => (
              <div key={serviceType} className="space-y-2">
                <div className="font-semibold text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {getServiceTypeLabel(serviceType)}
                </div>
                {serviceList.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.some(item => item.service.id === service.id)}
                      onCheckedChange={(checked) => handleServiceToggle(service, checked as boolean)}
                    />
                    <label htmlFor={service.id} className="flex-1 text-sm cursor-pointer">
                      <div className="flex justify-between">
                        <span>{service.name}</span>
                        <span className="font-semibold">₹{service.price}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Services */}
        {selectedServices.length > 0 && (
          <div className="space-y-4">
            <Label>Selected Services</Label>
            <div className="space-y-2 border rounded-lg p-4 bg-blue-50">
              {selectedServices.map((item) => (
                <div key={item.service.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex-1">
                    <span className="font-medium">{item.service.name}</span>
                    <span className="text-sm text-gray-500 ml-2">₹{item.service.price} each</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateServiceQuantity(item.service.id, parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <span className="font-semibold min-w-16">₹{item.cost}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeService(item.service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary and Notes */}
        {selectedServices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (₹)</Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="Enter discount amount"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  min="0"
                  step="0.5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Input
                  id="notes"
                  placeholder="Enter any additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-semibold">{totalQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{totalCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-semibold">₹{discountAmount}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Final Total:</span>
                  <span className="font-bold text-green-600">₹{finalCost}</span>
                </div>
              </div>

              <Button 
                onClick={handleAddMultiServiceTransaction}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading || selectedServices.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Add Multi-Service Transaction"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiServiceSelector;
