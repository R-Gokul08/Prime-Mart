import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { AddItemForm } from '@/components/AddItemForm';
import { GroceryList } from '@/components/GroceryList';
import { SmartSuggestions } from '@/components/SmartSuggestions';
import { ExpiryReminders } from '@/components/ExpiryReminders';
import { BudgetTracker } from '@/components/BudgetTracker';
import { PriceComparison } from '@/components/PriceComparison';
import { UserProfile } from '@/components/UserProfile';
import { InventoryTracker } from '@/components/InventoryTracker';
import { CheckoutModal } from '@/components/CheckoutModal';
import { QuickAddProduct } from '@/components/QuickAddProduct';
import { PurchaseHistoryCard } from '@/components/PurchaseHistory';
import { OrderTrackingBadge, OrderTracking } from '@/components/OrderTracking';
import { OnlineProducts } from '@/components/OnlineProducts';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { AIAssistant } from '@/components/AIAssistant';
import { GoogleLens } from '@/components/GoogleLens';
import { useGroceryStore } from '@/hooks/useGroceryStore';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useInventory } from '@/hooks/useInventory';
import { useOrders } from '@/hooks/useOrders';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Order } from '@/types/grocery';
import { Scan, LogIn, LogOut } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

// AI Suggestion type
interface AISuggestion {
  name: string;
  category: string;
  price: number;
  reason: string;
  type: 'history' | 'healthy' | 'deal' | 'budget';
  store?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [showLens, setShowLens] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion[]>([]);
  const { isOnline } = useOfflineStatus();

  const {
    items,
    budget,
    stats,
    addItem,
    removeItem,
    toggleItem,
    updateQuantity,
    clearChecked,
    getCheckedItems,
    checkDuplicate,
    updateBudget,
  } = useGroceryStore();

  // Callback for AI suggestions
  const handleAISuggestions = useCallback((suggestions: AISuggestion[]) => {
    setAISuggestions(suggestions);
  }, []);

  const {
    profile,
    updateProfile,
    toggleFavoriteStore,
    toggleFavoriteBrand,
  } = useUserProfile();

  // Auth state listener - sync with profile
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // Sync user profile with auth data when signed in
      if (session?.user) {
        setTimeout(() => {
          updateProfile({
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
          });
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      // Initial sync
      if (session?.user) {
        updateProfile({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [updateProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const {
    inventory,
    lowStockAlerts,
    purchaseHistory,
    checkDuplicate: checkInventoryDuplicate,
    recordPurchase,
    useFromInventory,
    updateMinStock,
    removeFromInventory,
  } = useInventory();

  const {
    createOrder,
    getActiveOrder,
  } = useOrders();

  const activeOrder = getActiveOrder();

  const handleAddSuggestion = (item: any) => {
    addItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity || 1,
      unit: item.unit || 'pcs',
      price: item.price,
      isHealthy: item.isHealthy || false,
      hasDeal: item.hasDeal,
      dealPrice: item.dealPrice,
      store: item.store,
    });
  };

  const handleCompletePurchase = (order: Order) => {
    // Record purchases before clearing
    const checkedItems = getCheckedItems();
    checkedItems.forEach(item => {
      recordPurchase(item);
    });
    
    if (checkedItems.length > 0) {
      toast.success(`Order #${order.id.slice(0, 8).toUpperCase()} confirmed! ${checkedItems.length} items added to inventory.`);
    }
    
    clearChecked();
    setShowCheckout(false);
  };

  const handleOpenCheckout = () => {
    const checkedItems = getCheckedItems();
    if (checkedItems.length === 0) {
      toast.error('Please select items to purchase');
      return;
    }
    setShowCheckout(true);
  };

  const handleAddLowStockToList = (item: any) => {
    addItem({
      name: item.name,
      category: item.category,
      quantity: item.minStock - item.currentStock,
      unit: item.unit,
      price: 0,
      isHealthy: false,
      hasDeal: false,
      store: profile.favoriteStores[0] || 'BigBasket',
    });
    toast.success(`${item.name} added to shopping list!`);
  };

  const notificationCount = lowStockAlerts.length + (activeOrder ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        notificationCount={notificationCount} 
        isOnline={isOnline}
        onUserClick={() => setShowProfile(true)}
        onNotificationClick={() => setShowNotifications(true)}
      />

      {/* Notifications Panel */}
      <NotificationsPanel
        open={showNotifications}
        onOpenChange={setShowNotifications}
        activeOrder={activeOrder}
        lowStockAlerts={lowStockAlerts}
      />
      
      {/* User Profile Sheet */}
      <Sheet open={showProfile} onOpenChange={setShowProfile}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <div className="py-4 space-y-6">
            <UserProfile
              profile={profile}
              onUpdateProfile={updateProfile}
              onToggleFavoriteStore={toggleFavoriteStore}
              onToggleFavoriteBrand={toggleFavoriteBrand}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      <main className="container py-6 space-y-6">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm text-center">
            📴 You're offline. Your data is saved locally and will sync when you're back online.
          </div>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl gradient-hero p-8 text-primary-foreground">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold">
                Shop Smarter, Save More 🛒
              </h1>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-80 hidden sm:inline">
                    {user.email}
                  </span>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => navigate('/auth')}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
            <p className="text-primary-foreground/80 text-lg max-w-lg">
              AI-powered grocery planning that helps you save money, reduce waste, and eat healthier.
            </p>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowLens(true)}
                className="gap-2"
              >
                <Scan className="h-4 w-4" />
                Scan Product
              </Button>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute right-20 bottom-0 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl -mb-10" />
        </section>

        {/* Stats Overview */}
        <StatsCards stats={stats} />

        {/* Quick Add Products */}
        <QuickAddProduct products={[]} onAdd={addItem} />

        {/* Online Store Products - Centered */}
        <OnlineProducts onAddItem={handleAddSuggestion} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main List */}
          <div className="lg:col-span-2 space-y-6">
            <AddItemForm 
              onAddItem={addItem} 
              checkDuplicate={checkDuplicate}
              checkInventoryDuplicate={checkInventoryDuplicate}
            />
            <GroceryList
              items={items}
              onToggle={toggleItem}
              onRemove={removeItem}
              onUpdateQuantity={updateQuantity}
              onClearChecked={handleOpenCheckout}
              progress={stats.progress}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <Tabs defaultValue="budget" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="inventory">
                  Inventory
                  {lowStockAlerts.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                      {lowStockAlerts.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="budget" className="mt-4">
                <BudgetTracker budget={budget} currentSpend={stats.totalPrice} onUpdateBudget={updateBudget} />
              </TabsContent>
              <TabsContent value="inventory" className="mt-4">
                <InventoryTracker
                  inventory={inventory}
                  lowStockAlerts={lowStockAlerts}
                  onUseItem={useFromInventory}
                  onUpdateMinStock={updateMinStock}
                  onRemoveItem={removeFromInventory}
                  onAddToShoppingList={handleAddLowStockToList}
                />
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <PurchaseHistoryCard purchases={purchaseHistory} />
              </TabsContent>
            </Tabs>
            
            {/* Active Order Tracking */}
            {activeOrder && (
              <OrderTrackingBadge 
                order={activeOrder} 
                onClick={() => setShowOrderTracking(true)} 
              />
            )}
            
            {/* Price Comparison - Above Smart Suggestions */}
            <PriceComparison />
            <SmartSuggestions onAddItem={handleAddSuggestion} aiSuggestions={aiSuggestions} />
            <AIAssistant groceryItems={items} onSuggestionsUpdate={handleAISuggestions} />
            <ExpiryReminders items={items} />
          </div>
        </div>

        {/* Google Lens Scanner */}
        <GoogleLens 
          open={showLens} 
          onOpenChange={setShowLens}
          onAddItem={(item) => addItem({
            ...item,
            quantity: 1,
            unit: 'pcs',
            isHealthy: false,
            hasDeal: false,
            store: 'BigBasket',
          })}
        />

        {/* Checkout Modal */}
        <CheckoutModal
          open={showCheckout}
          onOpenChange={setShowCheckout}
          items={items}
          onCompletePurchase={handleCompletePurchase}
          onCreateOrder={createOrder}
          budget={budget}
        />

        {/* Order Tracking Dialog */}
        {activeOrder && (
          <Dialog open={showOrderTracking} onOpenChange={setShowOrderTracking}>
            <DialogContent className="sm:max-w-lg p-0">
              <OrderTracking 
                order={activeOrder} 
                onClose={() => setShowOrderTracking(false)} 
              />
            </DialogContent>
          </Dialog>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>Prime Mart — Your intelligent grocery companion 🥬</p>
          <p className="text-xs mt-1 opacity-70">
            {isOnline ? '✅ Connected' : '📴 Offline Mode'} • Data saved locally
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
