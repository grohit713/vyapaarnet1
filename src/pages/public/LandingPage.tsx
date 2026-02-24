import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ShieldCheck, TrendingUp, Users, Truck, Package, ArrowRight, Loader2 } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1 }}>
                {/* ================= HERO SECTION ================= */}
                <section
                    style={{
                        padding: '6rem 0',
                        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.95) 40%, rgba(255, 255, 255, 0.7)), url('/images/warehouse-bg.jpg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div className="container">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4rem'
                            }}
                        >
                            {/* Left Content */}
                            <div style={{ flex: 1 }}>
                                <h1
                                    style={{
                                        fontSize: '3.5rem',
                                        fontWeight: 800,
                                        lineHeight: '1.2',
                                        color: 'var(--neutral-gray-900)',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    Connect Directly.
                                    <br />
                                    <span style={{ color: 'var(--primary-teal)' }}>
                                        Trade Directly.
                                    </span>
                                </h1>

                                <p
                                    style={{
                                        fontSize: '1.25rem',
                                        color: 'var(--neutral-gray-600)',
                                        marginBottom: '2rem',
                                        maxWidth: '600px'
                                    }}
                                >
                                    India's premier B2B marketplace connecting shopkeepers with
                                    manufacturers. Eliminate middlemen, reduce costs, and grow
                                    your business.
                                </p>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Button size="lg" onClick={() => navigate('/register')}>
                                        Get Started
                                    </Button>
                                    <Button size="lg" variant="outline">
                                        Learn More
                                    </Button>
                                </div>
                            </div>

                            {/* Right Image / Placeholder */}
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                <div className="float-animation" style={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    background: 'white',
                                    borderRadius: '1rem',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                    overflow: 'hidden',
                                    border: '1px solid var(--neutral-gray-200)'
                                }}>
                                    {/* Fake Browser Header */}
                                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--neutral-gray-100)', display: 'flex', gap: '0.5rem', background: 'var(--neutral-gray-50)' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                                    </div>
                                    {/* App Preview Image */}
                                    <img
                                        src="/images/app-preview.png"
                                        alt="VyapaarNet Dashboard Preview"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= SOCIAL PROOF ================= */}
                <section style={{ borderBottom: '1px solid var(--neutral-gray-200)', background: 'var(--neutral-gray-50)', padding: '1.5rem 0' }}>
                    <div className="container" style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--neutral-gray-500)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Trusted by 500+ Businesses across India
                        </p>
                    </div>
                </section>

                {/* ================= FEATURES SECTION ================= */}
                <section style={{ padding: '5rem 0', background: '#fff' }}>
                    <div className="container">
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '2rem'
                            }}
                        >
                            <FeatureCard
                                icon={<Users />}
                                title="Direct Buyers"
                                description="Connect directly with verified shopkeepers."
                            />
                            <FeatureCard
                                icon={<Truck />}
                                title="Fast Logistics"
                                description="Efficient delivery across India."
                            />
                            <FeatureCard
                                icon={<TrendingUp />}
                                title="Grow Faster"
                                description="Increase margins by cutting middlemen."
                            />
                            <FeatureCard
                                icon={<ShieldCheck />}
                                title="Secure Trading"
                                description="Verified users and secure payments."
                            />
                        </div>
                    </div>
                </section>

                {/* ================= FEATURED PRODUCTS ================= */}
                <FeaturedProductsSection />
            </main>

            <Footer />
        </div>
    );
};

/* ================= FEATURE CARD ================= */

const FeatureCard = ({
    icon,
    title,
    description
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) => (
    <Card className="feature-card">
        <div
            style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-teal-light)',
                color: 'var(--primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
            }}
        >
            {React.cloneElement(icon as any, { size: 24 })}
        </div>
        <h3
            style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '0.75rem'
            }}
        >
            {title}
        </h3>
        <p style={{ color: 'var(--neutral-gray-600)', lineHeight: '1.6' }}>
            {description}
        </p>
    </Card>
);

const FeaturedProductsSection = () => {
    const [products, setProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(collection(db, 'products'), limit(4));
                const snapshot = await getDocs(q);
                const productsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching featured products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <section style={{ padding: '5rem 0', backgroundColor: 'var(--neutral-gray-50)' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--neutral-gray-900)', marginBottom: '1rem' }}>Featured Products</h2>
                        <p style={{ color: 'var(--neutral-gray-600)', fontSize: '1.1rem', maxWidth: '600px' }}>Discover high-quality goods directly from reliable manufacturers across the country.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/login')} rightIcon={<ArrowRight size={18} />}>Explore Marketplace</Button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-teal)', margin: '0 auto' }} />
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed var(--neutral-gray-300)' }}>
                        <Package size={48} style={{ margin: '0 auto', color: 'var(--neutral-gray-300)', marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--neutral-gray-600)' }}>New products arriving soon!</h3>
                        <p style={{ color: 'var(--neutral-gray-400)' }}>Our manufacturers are currently updating their catalogs.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {products.map((product) => (
                            <Card key={product.id} className="hover-scale" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '200px', backgroundColor: 'var(--primary-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-teal)' }}>
                                    <Package size={64} />
                                </div>
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-teal)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{product.category}</div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{product.name}</h3>
                                    <p
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/manufacturer/${product.manufacturerId}`);
                                        }}
                                        style={{ fontSize: '0.875rem', color: 'var(--neutral-gray-500)', marginBottom: '1.5rem', flex: 1, cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        By {product.manufacturerName}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--neutral-gray-100)' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-400)' }}>Est. Price</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--neutral-gray-900)' }}>₹{product.price}</div>
                                        </div>
                                        <Button size="sm" onClick={() => navigate('/login')}>View Details</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
