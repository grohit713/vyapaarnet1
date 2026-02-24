import React, { useState } from "react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { authService } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  ShoppingBasket,
  Shirt,
  Zap,
  Hammer,
  HardHat,
  Search,
  Filter,
  MapPin,
  Star,
  Truck,
  ArrowRight,
  Loader2,
  Check,
  Clock,
  Package as PackageIcon,
  CheckCircle2,
} from "lucide-react";
import { db } from "../../config/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  moq: number;
  unit: string;
  description: string;
  manufacturerId: string;
  manufacturerName: string;
  createdAt: any;
}

interface Order {
  id: string;
  productId: string;
  productName: string;
  manufacturerId: string;
  manufacturerName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  buyerId: string;
  buyerName: string;
  createdAt: any;
  deliveryDate?: any;
}

type View = "dashboard" | "manufacturers" | "orders" | "profile";

export const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [view, setView] = useState<View>("dashboard");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setView("manufacturers");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--neutral-gray-50)",
      }}
    >
      {/* Sidebar */}
      <aside
        className="sidebar-modern"
        style={{
          width: "280px",
          height: "100vh",
          position: "sticky",
          top: 0,
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "2rem 1.5rem",
            borderBottom: "1px solid var(--neutral-gray-100)",
          }}
        >
          <div
            style={{
              color: "var(--primary-teal)",
              fontWeight: 800,
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                padding: "0.5rem",
                background: "var(--primary-teal-light)",
                borderRadius: "0.5rem",
              }}
            >
              <ShoppingBag size={24} color="var(--primary-teal)" />
            </div>
            VypaarNet
          </div>
        </div>

        <nav style={{ flex: 1, padding: "2rem 1rem" }}>
          <div
            style={{
              marginBottom: "0.75rem",
              padding: "0 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--neutral-gray-400)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Menu
          </div>

          <NavButton
            active={view === "dashboard"}
            onClick={() => setView("dashboard")}
            icon={<LayoutDashboard size={20} />}
          >
            Dashboard
          </NavButton>
          <NavButton
            active={view === "manufacturers"}
            onClick={() => setView("manufacturers")}
            icon={<ShoppingBag size={20} />}
          >
            Manufacturers
          </NavButton>
          <NavButton
            active={view === "orders"}
            onClick={() => setView("orders")}
            icon={<Truck size={20} />}
          >
            Orders
          </NavButton>

          <div
            style={{
              margin: "2rem 0 0.75rem",
              padding: "0 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--neutral-gray-400)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Account
          </div>
          <NavButton
            active={view === "profile"}
            onClick={() => setView("profile")}
            icon={<Settings size={20} />}
          >
            Profile
          </NavButton>
        </nav>

        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid var(--neutral-gray-100)",
            backgroundColor: "var(--neutral-gray-50)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                backgroundColor: "white",
                border: "1px solid var(--neutral-gray-200)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "0.75rem",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--primary-teal)",
              }}
            >
              {user?.name?.charAt(0) || "U"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name || "Shopkeeper"}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--neutral-gray-500)",
                }}
              >
                Retailer Account
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={handleLogout}
          >
            <LogOut size={16} style={{ marginRight: "0.5rem" }} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: "2.5rem",
          overflowY: "auto",
          backgroundColor: "#F9FAFB",
        }}
      >
        {view === "dashboard" && (
          <DashboardHome
            onCategoryClick={handleCategoryClick}
            onViewChange={setView}
          />
        )}
        {view === "manufacturers" && (
          <ManufacturersList initialCategory={selectedCategory} />
        )}
        {view === "orders" && <OrdersList />}
        {view === "profile" && <ProfileSettings user={user} />}
      </main>
    </div>
  );
};

// --- Sub-Components ---

const NavButton = ({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      padding: "0.75rem 1rem",
      marginBottom: "0.5rem",
      border: "none",
      borderRadius: "0.5rem",
      backgroundColor: active ? "var(--primary-teal-light)" : "transparent",
      color: active ? "var(--primary-teal)" : "var(--neutral-gray-600)",
      fontWeight: active ? 600 : 500,
      cursor: "pointer",
      transition: "all 0.2s",
      textAlign: "left",
    }}
  >
    <span style={{ marginRight: "0.75rem" }}>{icon}</span>
    {children}
  </button>
);

const DashboardHome = ({
  onCategoryClick,
  onViewChange,
}: {
  onCategoryClick: (cat: string) => void;
  onViewChange: (v: View) => void;
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const user = authService.getCurrentUser();

  React.useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = onSnapshot(
      query(collection(db, 'orders'), where('buyerId', '==', user.id)),
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(ordersData);
        setLoadingMetrics(false);
      },
      (error) => {
        console.error("Error fetching orders metrics:", error);
        setLoadingMetrics(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="animate-fade-in">
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
          color: "var(--neutral-gray-900)",
        }}
      >
        Welcome to VyapaarNet
      </h1>
      <p style={{ color: "var(--neutral-gray-500)", marginBottom: "2.5rem" }}>
        Discover manufacturers and grow your business
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        <MetricCard
          label="Total Orders"
          value={loadingMetrics ? "..." : totalOrders.toString()}
          subtext={totalOrders === 0 ? "No orders yet" : `${totalOrders} order${totalOrders !== 1 ? 's' : ''}`}
        />
        <MetricCard
          label="In Progress"
          value={loadingMetrics ? "..." : pendingOrders.toString()}
          subtext={pendingOrders === 0 ? "All caught up" : `${pendingOrders} awaiting confirmation`}
        />
        <MetricCard
          label="Completed"
          value={loadingMetrics ? "..." : deliveredOrders.toString()}
          subtext={deliveredOrders === 0 ? "No deliveries yet" : `${deliveredOrders} delivered order${deliveredOrders !== 1 ? 's' : ''}`}
        />
        <MetricCard label="Saved Amount" value="₹0" subtext="Track your savings" />
      </div>

      <h2
        style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}
      >
        Browse by Category
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {[
          {
            label: "FMCG",
            icon: ShoppingBasket,
            color: "#fee2e2",
            iconColor: "#ef4444",
          },
          {
            label: "Textiles",
            icon: Shirt,
            color: "#e0f2fe",
            iconColor: "#0ea5e9",
          },
          {
            label: "Electrical",
            icon: Zap,
            color: "#fef3c7",
            iconColor: "#f59e0b",
          },
          {
            label: "Hardware",
            icon: Hammer,
            color: "#f3f4f6",
            iconColor: "#6b7280",
          },
          {
            label: "Construction",
            icon: HardHat,
            color: "#ffedd5",
            iconColor: "#f97316",
          },
        ].map((cat) => (
          <div
            key={cat.label}
            onClick={() => onCategoryClick(cat.label)}
            className="card-modern hover-scale"
            style={{
              textAlign: "center",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              border: "1px solid var(--neutral-gray-200)",
            }}
          >
            <div
              style={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "50%",
                backgroundColor: cat.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s",
              }}
            >
              <cat.icon size={24} style={{ color: cat.iconColor }} />
            </div>
            <div style={{ fontWeight: 600, color: "var(--neutral-gray-700)" }}>
              {cat.label}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
        Quick Actions
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <ActionCard
          title="Find Manufacturers"
          desc="Browse verified manufacturers in your category"
          btnText="Browse"
          onClick={() => onViewChange("manufacturers")}
        />
        <ActionCard
          title="Track Orders"
          desc="Monitor your order status in real-time"
          btnText="View Orders"
          onClick={() => onViewChange("orders")}
        />
      </div>
    </div>
  );
};

const ManufacturersList = ({
  initialCategory,
}: {
  initialCategory: string | null;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(0);
  const [orderLoading, setOrderLoading] = useState(false);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
      // Only alert if we're in a state that should have products
      if (error.code === 'permission-denied') {
        alert("Firestore Permission Denied. Please check your Security Rules in the Firebase Console.");
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = initialCategory
      ? p.category.toLowerCase() === initialCategory.toLowerCase()
      : true;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manufacturerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlaceOrder = async (product: Product) => {
    if (!orderQuantity || orderQuantity < product.moq) {
      alert(`Minimum order quantity is ${product.moq} ${product.unit}`);
      return;
    }

    setOrderLoading(true);
    try {
      const newOrder: Omit<Order, "id"> = {
        productId: product.id,
        productName: product.name,
        manufacturerId: product.manufacturerId,
        manufacturerName: product.manufacturerName,
        quantity: orderQuantity,
        unit: product.unit,
        pricePerUnit: product.price,
        totalPrice: product.price * orderQuantity,
        status: "pending",
        buyerId: user?.id || "",
        buyerName: user?.name || "Buyer",
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "orders"), newOrder);
      alert(`Order placed successfully for ${product.name}!`);
      setSelectedProduct(null);
      setOrderQuantity(0);
    } catch (error) {
      alert("Failed to place order. Please try again.");
      console.error(error);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>
        Products & Manufacturers
      </h1>

      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        {/* Filter Panel */}
        <div className="card-modern" style={{ width: "260px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              fontWeight: 600,
            }}
          >
            <Filter size={18} /> Filters
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
              }}
            >
              Location
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <input type="checkbox" /> Delhi NCR
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <input type="checkbox" /> Mumbai
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <input type="checkbox" /> Gujarat
              </label>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
              }}
            >
              MOQ
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <input type="radio" name="moq" /> &lt; 50 units
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <input type="radio" name="moq" /> 50 - 100 units
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <input type="radio" name="moq" /> 100+ units
              </label>
            </div>
          </div>

          <Button
            style={{ width: "100%" }}
            onClick={() => alert("Filters applied successfully!")}
          >
            Apply Filters
          </Button>
        </div>

        {/* List */}
        <div style={{ flex: 1 }}>
          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--neutral-gray-400)",
              }}
            />
            <input
              placeholder="Search manufacturers by name or product..."
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 3rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--neutral-gray-300)",
                fontSize: "1rem",
                outline: "none",
                backgroundColor: "white",
              }}
              defaultValue={initialCategory || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {loading && (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Loader2 className="animate-spin" />
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--neutral-gray-500)",
                }}
              >
                No products found matching your criteria.
              </div>
            )}

            {filteredProducts.map((product) => (
              <div key={product.id} className="card-modern">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h3
                        onClick={() => navigate(`/manufacturer/${product.manufacturerId}`)}
                        style={{ fontSize: "1.25rem", fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {product.manufacturerName}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          backgroundColor: "#fff7ed",
                          color: "#ea580c",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        <Star size={12} fill="#ea580c" /> 4.8
                      </div>
                    </div>

                    <div
                      style={{
                        alignItems: "flex-start",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                        {product.name}
                      </div>
                      <div
                        style={{
                          color: "var(--neutral-gray-500)",
                          fontSize: "0.875rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <MapPin size={14} /> India
                        </span>
                        <span>•</span>
                        <span>{product.category}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span
                        style={{
                          backgroundColor: "var(--neutral-gray-100)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                        }}
                      >
                        MOQ: {product.moq} {product.unit}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", minWidth: "200px" }}>
                    <div style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                      ₹{product.price}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--neutral-gray-500)",
                        marginBottom: "1rem",
                      }}
                    >
                      per {product.unit}
                    </div>
                    <Button
                      onClick={() => setSelectedProduct(product)}
                      style={{ width: "100%" }}
                    >
                      Order Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card-modern"
            style={{ width: "90%", maxWidth: "500px", padding: "2rem" }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
              }}
            >
              Place Order
            </h2>

            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--neutral-gray-500)",
                  marginBottom: "0.25rem",
                }}
              >
                Product
              </div>
              <div style={{ fontWeight: 600 }}>{selectedProduct.name}</div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--neutral-gray-500)",
                  marginBottom: "0.25rem",
                }}
              >
                Manufacturer
              </div>
              <div style={{ fontWeight: 600 }}>
                {selectedProduct.manufacturerName}
              </div>
            </div>

            <div
              style={{
                marginBottom: "1.5rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--neutral-gray-500)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Price per {selectedProduct.unit}
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                  ₹{selectedProduct.price}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--neutral-gray-500)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Min Order Qty (MOQ)
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                  {selectedProduct.moq} {selectedProduct.unit}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                }}
              >
                Quantity ({selectedProduct.unit})
              </label>
              <input
                type="number"
                min={selectedProduct.moq}
                step={1}
                value={orderQuantity}
                onChange={(e) =>
                  setOrderQuantity(parseInt(e.target.value) || 0)
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--neutral-gray-300)",
                  fontSize: "1rem",
                  outline: "none",
                }}
                placeholder={`Min ${selectedProduct.moq}`}
              />
            </div>

            {orderQuantity > 0 && (
              <div
                style={{
                  marginBottom: "2rem",
                  padding: "1rem",
                  backgroundColor: "var(--primary-teal-light)",
                  borderRadius: "0.5rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--neutral-gray-600)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Total Price
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--primary-teal)",
                  }}
                >
                  ₹{(selectedProduct.price * orderQuantity).toLocaleString()}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem" }}>
              <Button
                variant="outline"
                style={{ flex: 1 }}
                onClick={() => setSelectedProduct(null)}
              >
                Cancel
              </Button>
              <Button
                style={{ flex: 1 }}
                onClick={() => handlePlaceOrder(selectedProduct)}
                disabled={orderLoading || orderQuantity < selectedProduct.moq}
              >
                {orderLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  React.useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = onSnapshot(
      query(collection(db, 'orders'), where('buyerId', '==', user.id)),
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(ordersData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e', icon: Clock };
      case 'confirmed':
        return { bg: '#dbeafe', color: '#0c4a6e', icon: Check };
      case 'shipped':
        return { bg: '#e0e7ff', color: '#312e81', icon: Truck };
      case 'delivered':
        return { bg: '#dcfce7', color: '#166534', icon: CheckCircle2 };
      default:
        return { bg: '#f3f4f6', color: '#374151', icon: PackageIcon };
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        deliveryDate: newStatus === 'delivered' ? Timestamp.now() : null
      });
      alert(`Order marked as ${newStatus}!`);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update status");
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending Confirmation',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>My Orders</h1>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 className="animate-spin" style={{ margin: '0 auto' }} />
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="card-modern" style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-gray-500)' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>No orders yet</p>
          <p style={{ fontSize: '0.875rem' }}>Start by browsing products and placing your first order</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {orders.map(order => {
          const statusInfo = getStatusColor(order.status);
          const StatusIcon = statusInfo.icon;

          return (
            <div key={order.id} className="card-modern">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-500)' }}>
                    Placed on {formatDate(order.createdAt)}
                  </div>
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '99px',
                  backgroundColor: statusInfo.bg,
                  color: statusInfo.color,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  height: 'fit-content'
                }}>
                  <StatusIcon size={14} />
                  {getStatusLabel(order.status)}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--neutral-gray-100)', borderBottom: '1px solid var(--neutral-gray-100)', padding: '1.5rem 0', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    backgroundColor: 'var(--primary-teal-light)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-teal)',
                    fontWeight: 700
                  }}>
                    <PackageIcon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{order.productName}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-500)' }}>
                      {order.quantity} {order.unit} × ₹{order.pricePerUnit}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)', marginBottom: '0.25rem' }}>Total</div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>₹{order.totalPrice.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-600)', paddingTop: '1rem', borderTop: '1px solid var(--neutral-gray-100)' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>Manufacturer:</span> {order.manufacturerName}
                  </div>
                </div>
              </div>

              {/* Timeline / Status Progress */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', paddingTop: '0.5rem' }}>
                  {[
                    { status: 'pending', label: 'Order Placed' },
                    { status: 'confirmed', label: 'Confirmed' },
                    { status: 'shipped', label: 'Shipped' },
                    { status: 'delivered', label: 'Delivered' }
                  ].map((step, idx) => {
                    const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
                    const currentIdx = statusOrder.indexOf(order.status);
                    const isCompleted = statusOrder.indexOf(step.status) <= currentIdx;
                    const isCurrent = step.status === order.status;

                    return (
                      <div key={step.status} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? 'var(--primary-teal)' : 'var(--neutral-gray-200)',
                          border: isCurrent ? '3px solid var(--primary-teal)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isCompleted ? 'white' : 'var(--neutral-gray-500)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          zIndex: 2,
                          marginBottom: '0.5rem'
                        }}>
                          {isCompleted && <Check size={16} />}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: isCurrent ? 'var(--primary-teal)' : 'var(--neutral-gray-500)',
                          textAlign: 'center'
                        }}>
                          {step.label}
                        </div>

                        {idx < 3 && (
                          <div style={{
                            position: 'absolute',
                            top: '1.25rem',
                            left: '50%',
                            width: '100%',
                            height: '2px',
                            backgroundColor: isCompleted ? 'var(--primary-teal)' : 'var(--neutral-gray-200)',
                            transform: 'translateY(-50%)',
                            zIndex: 1
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="outline" size="sm" onClick={() => alert(`Order Details:\n\nProduct: ${order.productName}\nQuantity: ${order.quantity} ${order.unit}\nTotal: ₹${order.totalPrice}\nStatus: ${getStatusLabel(order.status)}\nManufacturer: ${order.manufacturerName}`)}>
                  View Details
                </Button>
                {order.status === 'shipped' && (
                  <Button size="sm" onClick={() => confirm("Mark this order as received?") && handleUpdateStatus(order.id, 'delivered')}>
                    Confirm Delivery
                  </Button>
                )}
                {order.status !== 'delivered' && order.status !== 'shipped' && (
                  <Button variant="outline" size="sm" onClick={() => alert(`Order tracking for ${order.id}\n\nExpected delivery in 5-7 business days`)}>
                    Track Order
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProfileSettings = ({ user }: { user: any }) => (
  <div className="animate-fade-in" style={{ maxWidth: "600px" }}>
    <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>
      Shop Profile
    </h1>
    <div className="card-modern">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: "5rem",
            height: "5rem",
            borderRadius: "50%",
            backgroundColor: "var(--secondary-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--primary-teal)",
          }}
        >
          {user?.name?.charAt(0) || "S"}
        </div>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            {user?.companyName || "My Shop"}
          </h3>
          <p style={{ color: "var(--neutral-gray-500)", fontSize: "0.875rem" }}>
            Retailer
          </p>
        </div>
      </div>

      <form className="form-grid">
        <Input label="Shop Name" defaultValue={user?.companyName} />
        <Input label="Proprietor Name" defaultValue={user?.name} />
        <Input label="GST Number (Optional)" placeholder="Enter GSTIN" />
        <Input label="Shop Address" placeholder="Full Address" />
        <div style={{ gridColumn: "1 / -1" }}>
          <Button
            type="button"
            style={{ marginTop: "0.5rem" }}
            onClick={() => alert("Profile settings saved!")}
          >
            Update Profile
          </Button>
        </div>
      </form>
    </div>
  </div>
);

const MetricCard = ({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext: string;
}) => (
  <div className="card-modern">
    <div
      style={{
        fontSize: "0.875rem",
        color: "var(--neutral-gray-500)",
        marginBottom: "0.5rem",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.25rem" }}>
      {value}
    </div>
    <div style={{ fontSize: "0.75rem", color: "var(--neutral-gray-400)" }}>
      {subtext}
    </div>
  </div>
);

const ActionCard = ({
  title,
  desc,
  onClick,
}: {
  title: string;
  desc: string;
  btnText?: string;
  onClick?: () => void;
}) => (
  <div className="quick-action-card" onClick={onClick}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "0.5rem",
      }}
    >
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "var(--primary-teal)",
        }}
      >
        {title}
      </h3>
      <ArrowRight size={20} color="var(--primary-teal)" />
    </div>
    <p
      style={{
        fontSize: "0.875rem",
        color: "var(--neutral-gray-700)",
        marginBottom: "0",
      }}
    >
      {desc}
    </p>
  </div>
);
