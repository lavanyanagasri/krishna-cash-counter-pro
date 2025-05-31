
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Database } from "lucide-react";

const AdminPanel = () => {
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("text");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
          <CardTitle>Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              As an admin, you can manage database columns and user accounts.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Database className="w-6 h-6" />
                <span>Manage Database</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Plus className="w-6 h-6" />
                <span>Add User Account</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
