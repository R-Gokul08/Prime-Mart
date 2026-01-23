import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Store, Tag, Heart, X, Plus } from 'lucide-react';
import { UserProfile as UserProfileType } from '@/types/grocery';
import { stores } from '@/data/mockData';

interface UserProfileProps {
  profile: UserProfileType;
  onUpdateProfile: (updates: Partial<UserProfileType>) => void;
  onToggleFavoriteStore: (store: string) => void;
  onToggleFavoriteBrand: (brand: string) => void;
}

const popularBrands = ['Organic Valley', 'Whole Foods', 'Nature\'s Own', 'Horizon', 'Kirkland', 'Great Value'];

export function UserProfile({
  profile,
  onUpdateProfile,
  onToggleFavoriteStore,
  onToggleFavoriteBrand,
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBrand, setNewBrand] = useState('');

  const handleAddBrand = () => {
    if (newBrand.trim()) {
      onToggleFavoriteBrand(newBrand.trim());
      setNewBrand('');
    }
  };

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
        {/* Name & Email */}
        <div className="space-y-2">
          {isEditing ? (
            <>
              <Input
                placeholder="Your name"
                value={profile.name}
                onChange={(e) => onUpdateProfile({ name: e.target.value })}
                className="text-sm"
              />
              <Input
                type="email"
                placeholder="Your email"
                value={profile.email}
                onChange={(e) => onUpdateProfile({ email: e.target.value })}
                className="text-sm"
              />
              <Button size="sm" onClick={() => setIsEditing(false)}>
                Save
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{profile.name || 'Set your name'}</p>
                <p className="text-sm text-muted-foreground">{profile.email || 'Set your email'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          )}
        </div>

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
              .slice(0, 4)
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
