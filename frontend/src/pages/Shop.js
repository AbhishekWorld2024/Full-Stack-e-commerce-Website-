import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const selectedCategory = searchParams.get('category') || '';
  const featured = searchParams.get('featured') === 'true';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const catResponse = await axios.get(`${API}/products/categories`);
        setCategories(catResponse.data.categories);

        // Fetch products with filters
        let url = `${API}/products?`;
        if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;
        if (featured) url += `featured=true&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;

        const prodResponse = await axios.get(url);
        setProducts(prodResponse.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, featured, search]);

  const handleCategoryChange = (value) => {
    if (value === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', value);
    }
    searchParams.delete('featured');
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = selectedCategory || featured || search;

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A1A1A] mb-4">
          Category
        </h3>
        <div className="space-y-3">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`block text-sm ${!selectedCategory ? 'text-[#1A1A1A] font-medium' : 'text-[#666666]'} hover:text-[#1A1A1A] transition-colors`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`block text-sm ${selectedCategory === cat ? 'text-[#1A1A1A] font-medium' : 'text-[#666666]'} hover:text-[#1A1A1A] transition-colors`}
              data-testid={`filter-category-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full border-[#E5E5E5] text-[#666666] hover:bg-[#F0F0F0] h-10 rounded-none text-xs uppercase tracking-widest"
          data-testid="clear-filters-btn"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" data-testid="shop-page">
      {/* Header */}
      <div className="px-6 md:px-12 lg:px-24 py-16 md:py-24 border-b border-[#E5E5E5]">
        <span className="text-xs uppercase tracking-[0.3em] text-[#666666] font-semibold mb-4 block">
          {featured ? 'Featured Collection' : selectedCategory || 'All Products'}
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-[#1A1A1A]">
          {featured ? 'New Arrivals' : selectedCategory || 'Shop All'}
        </h1>
        {search && (
          <p className="text-[#666666] mt-4">
            Search results for "{search}"
          </p>
        )}
      </div>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        {/* Mobile Filter Button */}
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <span className="text-sm text-[#666666]">
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </span>
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F0F0F0] h-10 rounded-none text-xs uppercase tracking-widest"
                data-testid="mobile-filter-btn"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-[#F9F9F9]">
              <SheetHeader>
                <SheetTitle className="text-left font-serif text-2xl">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-8">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-16">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-12">
              <span className="text-sm text-[#666666]">
                {products.length} {products.length === 1 ? 'Product' : 'Products'}
              </span>
              <Select defaultValue="newest">
                <SelectTrigger className="w-48 h-10 rounded-none border-[#E5E5E5] text-sm" data-testid="sort-select">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#F0F0F0] text-sm">
                    {selectedCategory}
                    <button onClick={() => handleCategoryChange('all')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {featured && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#F0F0F0] text-sm">
                    Featured
                    <button onClick={clearFilters}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-[#E5E5E5] mb-4" />
                    <div className="h-5 bg-[#E5E5E5] w-2/3 mb-2" />
                    <div className="h-4 bg-[#E5E5E5] w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <h3 className="font-serif text-2xl text-[#1A1A1A] mb-4">No products found</h3>
                <p className="text-[#666666] mb-8">Try adjusting your filters or browse our full collection.</p>
                <Button
                  onClick={clearFilters}
                  className="bg-[#1A1A1A] text-white hover:bg-[#333333] h-12 px-8 rounded-none uppercase tracking-widest text-xs font-semibold"
                  data-testid="browse-all-btn"
                >
                  Browse All Products
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 stagger-children">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
