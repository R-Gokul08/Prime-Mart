import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { AddItemForm } from '@/components/AddItemForm';
import { GroceryList } from '@/components/GroceryList';
import { SmartSuggestions } from '@/components/SmartSuggestions';
import { ExpiryReminders } from '@/components/ExpiryReminders';
import { BudgetTracker } from '@/components/BudgetTracker';
import { PriceComparison } from '@/components/PriceComparison';
import { useGroceryStore } from '@/hooks/useGroceryStore';

const Index = () => {
  const {
    items,
    budget,
    stats,
    addItem,
    removeItem,
    toggleItem,
    updateQuantity,
    clearChecked,
  } = useGroceryStore();

  const handleAddSuggestion = (item: any) => {
    addItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      isHealthy: item.isHealthy,
      hasDeal: item.hasDeal,
      dealPrice: item.dealPrice,
      store: item.store,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl gradient-hero p-8 text-primary-foreground">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              Shop Smarter, Save More 🛒
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-lg">
              AI-powered grocery planning that helps you save money, reduce waste, and eat healthier.
            </p>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mb-10" />
        </section>

        {/* Stats Overview */}
        <StatsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main List */}
          <div className="lg:col-span-2 space-y-6">
            <AddItemForm onAddItem={addItem} />
            <GroceryList
              items={items}
              onToggle={toggleItem}
              onRemove={removeItem}
              onUpdateQuantity={updateQuantity}
              onClearChecked={clearChecked}
              progress={stats.progress}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <BudgetTracker budget={budget} currentSpend={stats.totalPrice} />
            <SmartSuggestions onAddItem={handleAddSuggestion} />
            <ExpiryReminders />
            <PriceComparison />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>SmartCart — Your intelligent grocery companion 🥬</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
