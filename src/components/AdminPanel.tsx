import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Database, Users, UserPlus, Settings, Wrench } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServices, Service } from "@/hooks/useServices";

const AdminPanel = () => {
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("text");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Service management state
  const { services, addService, updateService } = useServices();
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceType, setNewServiceType] = useState<Service['service_type']>("xerox");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServicePaperSize, setNewServicePaperSize] = useState("");
  const [newServiceColorType, setNewServiceColorType] = useState<'black_white' | 'color'>('black_white');
  const [newServiceOrientation, setNewServiceOrientation] = useState<'single_side' | 'both_sides'>('single_side');

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This would typically make an API call to add a new column
      // For now, we'll just show a success message
      toast({
        title: "Column Added Successfully",
        description: `Added new ${newColumnType} column: ${newColumnName}`,
      });
      
      setNewColumnName("");
      setNewColumnType("text");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add column",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Store new user in localStorage for this simple implementation
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const newUser = {
        email: newUserEmail,
        password: newUserPassword,
        createdAt: new Date().toISOString()
      };
      
      // Check if user already exists
      if (existingUsers.find((user: any) => user.email === newUserEmail)) {
        toast({
          title: "User Already Exists",
          description: "A user with this email already exists",
          variant: "destructive",
        });
        return;
      }
      
      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
      
      toast({
        title: "User Added Successfully",
        description: `User account created for: ${newUserEmail}`,
      });
      
      setNewUserEmail("");
      setNewUserPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'> = {
        service_type: newServiceType,
        name: newServiceName,
        price: parseFloat(newServicePrice),
        paper_size: newServicePaperSize || undefined,
        color_type: ['xerox', 'net_printing'].includes(newServiceType) ? newServiceColorType : undefined,
        paper_orientation: ['xerox'].includes(newServiceType) ? newServiceOrientation : undefined,
      };

      await addService(serviceData);
      
      // Reset form
      setNewServiceName("");
      setNewServicePrice("");
      setNewServicePaperSize("");
      setNewServiceType("xerox");
      setNewServiceColorType('black_white');
      setNewServiceOrientation('single_side');
    } catch (error) {
      // Error handled in useServices hook
    } finally {
      setLoading(false);
    }
  };

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddColumn} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="column-name">Column Name</Label>
                <Input
                  id="column-name"
                  type="text"
                  placeholder="Enter column name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="column-type">Column Type</Label>
                <select
                  id="column-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="integer">Integer</option>
                  <option value="numeric">Numeric</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                  <option value="timestamp">Timestamp</option>
                </select>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Adding Column..." : "Add Column"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Account Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">User Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Password</Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="Enter password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? "Adding User..." : "Add User Account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Service Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddService} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-type">Service Type</Label>
                <Select value={newServiceType} onValueChange={(value: Service['service_type']) => setNewServiceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xerox">Xerox</SelectItem>
                    <SelectItem value="scanning">Scanning</SelectItem>
                    <SelectItem value="net_printing">Net Printing</SelectItem>
                    <SelectItem value="spiral_binding">Spiral Binding</SelectItem>
                    <SelectItem value="lamination">Lamination</SelectItem>
                    <SelectItem value="rubber_stamps">Rubber Stamps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  type="text"
                  placeholder="Enter service name"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-price">Price (₹)</Label>
                <Input
                  id="service-price"
                  type="number"
                  placeholder="Enter price"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  min="0"
                  step="0.5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-paper-size">Paper Size (Optional)</Label>
                <Input
                  id="service-paper-size"
                  type="text"
                  placeholder="e.g., A4, A3, Legal"
                  value={newServicePaperSize}
                  onChange={(e) => setNewServicePaperSize(e.target.value)}
                />
              </div>
              {['xerox', 'net_printing'].includes(newServiceType) && (
                <div className="space-y-2">
                  <Label htmlFor="service-color">Color Type</Label>
                  <Select value={newServiceColorType} onValueChange={(value: 'black_white' | 'color') => setNewServiceColorType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black_white">Black & White</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {newServiceType === 'xerox' && (
              <div className="space-y-2">
                <Label htmlFor="service-orientation">Paper Orientation</Label>
                <Select value={newServiceOrientation} onValueChange={(value: 'single_side' | 'both_sides') => setNewServiceOrientation(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_side">Single Side</SelectItem>
                    <SelectItem value="both_sides">Both Sides</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || !newServiceName || !newServicePrice}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Adding Service..." : "Add Service"}
            </Button>
          </form>

          {/* Services Table */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Current Services</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Paper Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Orientation</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {getServiceTypeLabel(service.service_type)}
                        </span>
                      </TableCell>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.paper_size || '-'}</TableCell>
                      <TableCell>
                        {service.color_type ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            service.color_type === 'color' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.color_type === 'color' ? 'Color' : 'B&W'}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {service.paper_orientation ? (
                          service.paper_orientation === 'both_sides' ? 'Both Sides' : 'Single Side'
                        ) : '-'}
                      </TableCell>
                      <TableCell className="font-semibold">₹{service.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              As an admin, you can manage database columns, user accounts, and services.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Database className="w-6 h-6" />
                <span>Manage Database</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Users className="w-6 h-6" />
                <span>Manage Users</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Wrench className="w-6 h-6" />
                <span>Manage Services</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
