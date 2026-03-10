import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Store, Tag, Heart, X, Plus, LogOut, Mail, Shield } from 'lucide-react';
import { UserProfile as UserProfileType } from '@/types/grocery';
import { stores } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfileProps {
  profile: UserProfileType;
  onUpdateProfile: (updates: Partial<UserProfileType>) => void;
  onToggleFavoriteStore: (store: string) => void;
  onToggleFavoriteBrand: (brand: string) => void;
}

const popularBrands = [
  'Amul', 'Tata', 'Fortune', 'Aashirvaad', 'MTR', 'Haldirams', 
  'Britannia', 'Parle', 'Nestle', 'Dabur', 'Patanjali', 'ITC',
];

export function UserProfile({
  profile,
  onUpdateProfile,
  onToggleFavoriteStore,
  onToggleFavoriteBrand,
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAddBrand = () => {
    if (newBrand.trim()) {
      onToggleFavoriteBrand(newBrand.trim());
      setNewBrand('');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = profile.name || user?.user_metadata?.full_name || 'Guest User';
  const displayEmail = profile.email || user?.email || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          My Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar & Info */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
          <Avatar className="h-16 w-16">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  placeholder="Your name"
                  value={profile.name}
                  onChange={(e) => onUpdateProfile({ name: e.target.value })}
                  className="text-sm h-9"
                />
                <Input
                  type="email"
                  placeholder="Your email"
                  value={profile.email}
                  onChange={(e) => onUpdateProfile({ email: e.target.value })}
                  className="text-sm h-9"
                  disabled={!!user}
                />
                <Button size="sm" onClick={() => setIsEditing(false)}>Save</Button>
              </div>
            ) : (
              <>
                <p className="font-bold text-lg truncate">{displayName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {displayEmail || 'No email set'}
                </p>
                {user && (
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-success" />
                    <span className="text-xs text-success">Verified Account</span>
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="mt-1 h-7 px-2 text-xs">
                  Edit Profile
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Sign Out */}
        {user && (
          <Button 
            variant="outline" 
            className="w-full gap-2 text-destructive hover:text-destructive" 
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}

        {/* Favorite Stores */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Store className="h-4 w-4 text-muted-foreground" />
            Favorite Stores
          </div>
          <div className="flex flex-wrap gap-2">
            {stores.map((store) => (
              <Badge
                key={store.id}
                variant={profile.favoriteStores.includes(store.name) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => onToggleFavoriteStore(store.name)}
              >
                {profile.favoriteStores.includes(store.name) && (
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                )}
                {store.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Favorite Brands */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Favorite Brands
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.favoriteBrands.map((brand) => (
              <Badge key={brand} variant="secondary" className="gap-1">
                {brand}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => onToggleFavoriteBrand(brand)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {popularBrands
              .filter(b => !profile.favoriteBrands.includes(b))
              .slice(0, 6)
              .map((brand) => (
                <Badge
                  key={brand}
                  variant="outline"
                  className="cursor-pointer text-xs opacity-60 hover:opacity-100"
                  onClick={() => onToggleFavoriteBrand(brand)}
                >
                  <Plus className="h-2 w-2 mr-1" />
                  {brand}
                </Badge>
              ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add custom brand..."
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
              className="text-sm h-8"
            />
            <Button size="sm" variant="outline" onClick={handleAddBrand} className="h-8">
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
