import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { authService } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Package, TrendingUp, Settings, Factory, Plus, Search, Edit, Trash2, CheckCircle, Loader2, Globe } from 'lucide-react';
import { ExportEligibilityChecker } from './ExportEligibilityChecker';
import { db } from '../../config/firebase';
import { collection, addDoc, onSnapshot, query, where, Timestamp, updateDoc, doc } from 'firebase/firestore';

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
    status: "pending" | "confirmed" | "shipped" | "delivered" | "declined";
    buyerId: string;
    buyerName: string;
    createdAt: any;
}

// ... existing code ...
type View = 'dashboard' | 'products' | 'orders' | 'profile' | 'add-product' | 'export-eligibility';

const OrdersList = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    React.useEffect(() => {
        if (!user?.id) return;

        const q = query(collection(db, 'orders'), where('manufacturerId', '==', user.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            // Sort by createdAt descending (newest first)
            setOrders(ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
            if (error.code === 'permission-denied') {
                alert("Firestore Permission Denied for 'orders'. Please check your security rules.");
            }
        });

        return () => unsubscribe();
    }, [user?.id]);

    const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus
            });
            // Optional: Add a toast notification here
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Failed to update order status");
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Orders & Inquiries</h1>

            <Card style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: 'var(--neutral-gray-50)', color: 'var(--neutral-gray-600)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Product</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Buyer</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Qty / Price</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Total</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-gray-500)' }}>No orders found yet.</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid var(--neutral-gray-100)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 500 }}>{order.productName || 'Unknown Product'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)' }}>ID: {order.productId?.substring(0, 8)}...</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 500 }}>{order.buyerName || 'Unknown Buyer'}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {order.quantity} {order.unit} x ₹{order.pricePerUnit}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>
                                            ₹{order.totalPrice}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            {order.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        style={{ color: 'var(--danger-red)', borderColor: 'var(--danger-red)' }}
                                                        onClick={() => handleUpdateStatus(order.id, 'declined')}
                                                    >
                                                        Decline
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                                    >
                                                        Accept
                                                    </Button>
                                                </div>
                                            )}
                                            {order.status === 'confirmed' && (
                                                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, 'shipped')}>
                                                    Mark Shipped
                                                </Button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, 'delivered')}>
                                                    Mark Delivered
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    let styles = { bg: '#f3f4f6', color: '#4b5563' };

    switch (status) {
        case 'pending': styles = { bg: '#fff7ed', color: '#c2410c' }; break;
        case 'confirmed': styles = { bg: '#dcfce7', color: '#15803d' }; break;
        case 'shipped': styles = { bg: '#e0f2fe', color: '#0369a1' }; break;
        case 'delivered': styles = { bg: '#f0fdf4', color: '#166534' }; break;
        case 'declined': styles = { bg: '#fef2f2', color: '#b91c1c' }; break;
    }

    return (
        <span style={{
            padding: '0.25rem 0.625rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: styles.bg,
            color: styles.color,
            textTransform: 'capitalize'
        }}>
            {status}
        </span>
    );
};

export const SellerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [view, setView] = useState<View>('dashboard');

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--neutral-gray-50)' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', backgroundColor: 'white', borderRight: '1px solid var(--neutral-gray-200)', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--neutral-gray-100)' }}>
                    <div style={{ color: 'var(--primary-teal)', fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--primary-teal-light)', borderRadius: '0.5rem' }}>
                            <Factory size={24} color="var(--primary-teal)" />
                        </div>
                        VyapaarNet
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)', marginTop: '0.5rem', paddingLeft: '3.5rem' }}>Manufacturer Portal</div>
                </div>

                <nav style={{ flex: 1, padding: '2rem 1rem' }}>
                    <div style={{ marginBottom: '0.75rem', padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Main Menu</div>

                    <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={20} />}>Overview</NavButton>
                    <NavButton active={view === 'products' || view === 'add-product'} onClick={() => setView('products')} icon={<Package size={20} />}>Products</NavButton>
                    <NavButton active={view === 'orders'} onClick={() => setView('orders')} icon={<TrendingUp size={20} />}>Orders & Inquiries</NavButton>
                    <NavButton active={view === 'export-eligibility'} onClick={() => setView('export-eligibility')} icon={<Globe size={20} />}>AI Trade Intelligence</NavButton>

                    <div style={{ margin: '2rem 0 0.75rem', padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</div>
                    <NavButton active={view === 'profile'} onClick={() => setView('profile')} icon={<Settings size={20} />}>Company Profile</NavButton>
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--neutral-gray-100)', backgroundColor: 'var(--neutral-gray-50)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'white', border: '1px solid var(--neutral-gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem', fontSize: '1rem', fontWeight: 700, color: 'var(--primary-teal)' }}>
                            {user?.name?.charAt(0) || 'M'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name || "Manufacturer"}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)' }}>Verified Seller</div>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
                        <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                {view === 'dashboard' && (
                    <DashboardHome onViewChange={setView} />
                )}
                {view === 'products' && (
                    <ProductsList onViewChange={setView} />
                )}
                {view === 'add-product' && (
                    <AddProductForm onViewChange={setView} />
                )}
                {view === 'orders' && (
                    <OrdersList />
                )}
                {view === 'profile' && (
                    <ProfileSettings user={user} />
                )}
                {view === 'export-eligibility' && (
                    <ExportEligibilityChecker />
                )}
            </main>
        </div>
    );
}

// --- Sub-Components ---

const NavButton = ({ active, onClick, icon, children }: { active: boolean, onClick: () => void, icon: React.ReactNode, children: React.ReactNode }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '0.75rem 1rem',
            marginBottom: '0.5rem',
            border: 'none',
            borderRadius: '0.5rem',
            backgroundColor: active ? 'var(--primary-teal-light)' : 'transparent',
            color: active ? 'var(--primary-teal)' : 'var(--neutral-gray-600)',
            fontWeight: active ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left'
        }}
    >
        <span style={{ marginRight: '0.75rem' }}>{icon}</span>
        {children}
    </button>
);

const DashboardHome = ({ onViewChange }: { onViewChange: (view: View) => void }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    React.useEffect(() => {
        if (!user?.id) return;

        // Fetch Products
        const qProducts = query(collection(db, 'products'), where('manufacturerId', '==', user.id));
        const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productsData);
        });

        // Fetch Orders
        const qOrders = query(collection(db, 'orders'), where('manufacturerId', '==', user.id));
        const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(ordersData);
            setLoading(false);
        });

        return () => {
            unsubscribeProducts();
            unsubscribeOrders();
        };
    }, [user?.id]);

    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--neutral-gray-900)' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--neutral-gray-500)', marginBottom: '2.5rem' }}>Welcome back! Here's what's happening with your business today.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <MetricCard
                    label="Total Products"
                    value={loading ? "..." : products.length.toString()}
                    subtext={products.length === 0 ? "Add your first product" : `Actively listed products`}
                    icon={<Package />}
                />
                <MetricCard
                    label="New Inquiries"
                    value={loading ? "..." : pendingOrders.toString()}
                    subtext={pendingOrders === 0 ? "No pending response" : `${pendingOrders} awaiting action`}
                    icon={<TrendingUp />}
                />
                <MetricCard
                    label="Total Revenue"
                    value={loading ? "..." : `₹${totalRevenue.toLocaleString()}`}
                    subtext="Cumulative order value"
                    icon={<div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹</div>}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <Card style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Your Products</h3>
                        <Button variant="ghost" size="sm" onClick={() => onViewChange('products')}>View All</Button>
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--neutral-gray-500)' }}>
                            <div style={{ marginBottom: '1rem', opacity: 0.5 }}><Package size={48} style={{ margin: '0 auto' }} /></div>
                            <p>You haven't added any products yet.</p>
                            <Button variant="outline" size="sm" onClick={() => onViewChange('add-product')} style={{ marginTop: '1rem' }}>Add Product</Button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {products.slice(0, 5).map(product => (
                                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--neutral-gray-100)', borderRadius: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'var(--primary-teal-light)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-teal)' }}>
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{product.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-500)' }}>{product.category} • {product.moq} {product.unit} MOQ</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--primary-teal)' }}>₹{product.price}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f0fdfa', border: '1px dashed var(--primary-teal)' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--primary-teal)' }}><Plus size={48} style={{ margin: '0 auto' }} /></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Grow Your Business</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-600)', marginBottom: '1.5rem' }}>Manufacturers with 10+ products get 3x more inquiries from retailers.</p>
                    <Button onClick={() => onViewChange('add-product')} style={{ width: '100%' }}>Add New Product</Button>
                </Card>
            </div>
        </div>
    );
};

const ProductsList = ({ onViewChange }: { onViewChange: (view: View) => void }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    React.useEffect(() => {
        if (!user?.id) return;

        const q = query(collection(db, 'products'), where('manufacturerId', '==', user.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setLoading(false);
            alert("Could not load products. Please check if your Firestore Database is created and active.");
        });

        return () => unsubscribe();
    }, [user?.id]);

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Product Management</h1>
                    <p style={{ color: 'var(--neutral-gray-500)' }}>Manage your inventory and pricing</p>
                </div>
                <Button onClick={() => onViewChange('add-product')} leftIcon={<Plus size={20} />}>Add Product</Button>
            </div>

            <Card style={{ padding: '0', overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--neutral-gray-100)', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-gray-400)' }} />
                        <input
                            placeholder="Search products..."
                            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '0.375rem', border: '1px solid var(--neutral-gray-300)', outline: 'none' }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: 'var(--neutral-gray-50)', color: 'var(--neutral-gray-600)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Product Name</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Category</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Price / Unit</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>MOQ</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-gray-500)' }}>No products found. Add your first product!</td></tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid var(--neutral-gray-100)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{product.name}</td>
                                        <td style={{ padding: '1rem', color: 'var(--neutral-gray-500)' }}>{product.category}</td>
                                        <td style={{ padding: '1rem' }}>₹{product.price} / {product.unit}</td>
                                        <td style={{ padding: '1rem' }}>{product.moq} {product.unit}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 500, backgroundColor: '#dcfce7', color: '#166534' }}>Active</span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button style={{ padding: '0.5rem', color: 'var(--neutral-gray-500)', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => alert('Edit functionality coming soon')}><Edit size={16} /></button>
                                            <button style={{ padding: '0.5rem', color: 'var(--danger-red)', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => confirm('Are you sure?') && alert('Simulated delete')}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const AddProductForm = ({ onViewChange }: { onViewChange: (view: View) => void }) => {
    const [loading, setLoading] = useState(false);
    const user = authService.getCurrentUser();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            await addDoc(collection(db, 'products'), {
                name: formData.get('name'),
                category: formData.get('category'),
                description: formData.get('description'),
                price: Number(formData.get('price')),
                moq: Number(formData.get('moq')),
                unit: formData.get('unit'),
                manufacturerId: user?.id,
                manufacturerName: user?.companyName || user?.name || 'Unknown Manufacturer',
                createdAt: Timestamp.now(),
                isActive: true
            });
            alert('Product added successfully!');
            onViewChange('products');
        } catch (error) {
            console.error(error);
            alert('Error adding product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Button variant="ghost" size="sm" onClick={() => onViewChange('products')} style={{ marginBottom: '1.5rem', paddingLeft: 0 }}>
                &larr; Back to Products
            </Button>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Add New Product</h1>

            <Card>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input name="name" label="Product Name" placeholder="e.g. Premium Cotton Shirt" required />
                        <Input name="category" label="Category" placeholder="Select category" required />
                    </div>

                    <Input name="description" label="Description" placeholder="Describe your product..." required />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <Input name="price" label="Price per Unit (₹)" type="number" placeholder="0.00" required />
                        <Input name="moq" label="Minimum Order Qty (MOQ)" type="number" placeholder="e.g. 50" required />
                        <Input name="unit" label="Unit Type" placeholder="e.g. Pieces, Kg" required />
                    </div>

                    <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--neutral-gray-100)', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button type="button" variant="ghost" onClick={() => onViewChange('products')}>Cancel</Button>
                        <Button type="submit" isLoading={loading}>Save Product</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};



const ProfileSettings = ({ user }: { user: any }) => (
    <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Company Profile</h1>
        <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'var(--primary-teal)' }}>
                    {user?.name?.charAt(0) || 'C'}
                </div>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.companyName || 'My Company'}</h3>
                    <p style={{ color: 'var(--success-green)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle size={14} /> GST Verified
                    </p>
                </div>
            </div>

            <form>
                <Input label="Company Name" defaultValue={user?.companyName} />
                <Input label="Contact Person" defaultValue={user?.name} />
                <Input label="GST Number" placeholder="Enter GSTIN" />
                <Input label="Registered Address" placeholder="Company Address" />
                <Button type="button" style={{ marginTop: '1rem' }} onClick={() => alert('Company profile updated!')}>Update Profile</Button>
            </form>
        </Card>
    </div>
);

const MetricCard = ({ label, value, subtext, icon }: { label: string, value: string, subtext: string, icon: React.ReactNode }) => (
    <Card style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-500)', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '1.875rem', fontWeight: 700 }}>{value}</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-teal-light)', borderRadius: '0.5rem', color: 'var(--primary-teal)' }}>
                {icon}
            </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--success-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {subtext}
        </div>
    </Card>
);
