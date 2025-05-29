
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, FileText, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DayBook from "./DayBook";
import Reports from "./Reports";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("daybook");
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Vaishnavi Jumbo Zerox</h1>
              <p className="text-blue-100 text-sm">Powered by Sri Murali Krishna Computers - Cash Register</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-blue-600 border-white hover:bg-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="daybook" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Day Book
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daybook">
            <DayBook />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
