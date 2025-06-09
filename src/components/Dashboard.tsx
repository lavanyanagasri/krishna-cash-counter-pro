import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, FileText, BarChart3, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useAdmin } from "@/hooks/useAdmin";
import DayBook from "./DayBook";
import Reports from "./Reports";
import Profile from "./Profile";
import AdminPanel from "./AdminPanel";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("daybook");
  const [showProfile, setShowProfile] = useState(false);
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useAdmin();

  const handleLogout = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Vaishnavi Jumbo Zerox</h1>
              <p className="text-blue-100 text-sm">
                Powered by Sri Murali Krishna Computers - Cash Register
                {isAdmin && <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-xs">ADMIN</span>}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Profile Avatar */}
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 hover:bg-blue-700 p-2 rounded-lg transition-colors"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {isAdmin ? 'Admin' : (profile?.first_name || user?.email?.split('@')[0] || 'User')}
                </span>
              </button>
              
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {showProfile ? (
          <div className="mb-4">
            <Button 
              onClick={() => setShowProfile(false)}
              variant="outline"
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <Profile />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} mb-6`}>
              <TabsTrigger value="daybook" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Day Book
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Reports
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="daybook">
              <DayBook />
            </TabsContent>

            <TabsContent value="reports">
              <Reports />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin">
                <AdminPanel />
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
