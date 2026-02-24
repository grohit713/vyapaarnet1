import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Factory, MapPin, Globe, Phone, Mail, Package, Star, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export const ManufacturerProfile: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const [manufacturer, setManufacturer] = useState<any>(null);
 const [products, setProducts] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchManufacturerData = async () => {
   if (!id) return;
   try {
    // Fetch Manufacturer Details
    const userDoc = await getDoc(doc(db, 'users', id));
    if (userDoc.exists()) {
     setManufacturer(userDoc.data());
    }

    // Fetch Manufacturer Products
    const q = query(collection(db, 'products'), where('manufacturerId', '==', id));
    const productSnapshot = await getDocs(q);
    const productsData = productSnapshot.docs.map(doc => ({
     id: doc.id,
     ...doc.data()
    }));
    setProducts(productsData);
   } catch (error) {
    console.error("Error fetching manufacturer profile:", error);
   } finally {
    setLoading(false);
   }
  };

  fetchManufacturerData();
 }, [id]);

 if (loading) {
  return (
   <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary-teal)' }} />
   </div>
  );
 }

 if (!manufacturer) {
  return (
   <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
    <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Manufacturer Not Found</h2>
    <Button onClick={() => navigate(-1)}>Go Back</Button>
   </div>
  );
 }

 return (
  <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-gray-50)' }}>
   <Navbar />

   <main className="container" style={{ padding: '3rem 0' }}>
    <Button
     variant="ghost"
     onClick={() => navigate(-1)}
     leftIcon={<ArrowLeft size={18} />}
     style={{ marginBottom: '2rem' }}
    >
     Back to Marketplace
    </Button>

    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
     {/* Main Content */}
     <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Profile Card */}
      <Card style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
       <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'var(--primary-teal)' }} />

       <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{
         width: '120px',
         height: '120px',
         borderRadius: '1.5rem',
         background: 'var(--primary-teal-light)',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         color: 'var(--primary-teal)',
         fontSize: '3rem',
         fontWeight: 800
        }}>
         {manufacturer.companyName?.charAt(0) || manufacturer.name?.charAt(0)}
        </div>
        <div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--neutral-gray-900)' }}>
           {manufacturer.companyName || manufacturer.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', background: '#dcfce7', color: '#166534', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
           <ShieldCheck size={14} /> VERIFIED SELLER
          </div>
         </div>
         <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--neutral-gray-500)', fontSize: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} /> {manufacturer.location || 'India'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Star size={18} style={{ color: '#f59e0b' }} /> 4.8 Rating</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={18} /> {products.length} Products</span>
         </div>
        </div>
       </div>
      </Card>

      {/* Product Catalog */}
      <section>
       <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--neutral-gray-900)' }}>
        Product Catalog
       </h2>
       {products.length === 0 ? (
        <Card style={{ padding: '4rem', textAlign: 'center' }}>
         <Package size={48} style={{ margin: '0 auto', color: 'var(--neutral-gray-300)', marginBottom: '1rem' }} />
         <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--neutral-gray-500)' }}>No products listed yet.</h3>
        </Card>
       ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
         {products.map(product => (
          <Card key={product.id} className="hover-scale" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
           <div style={{ height: '180px', backgroundColor: 'var(--primary-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-teal)' }}>
            <Package size={48} />
           </div>
           <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-teal)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{product.category}</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>{product.name}</h3>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--neutral-gray-400)' }}>Price</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>₹{product.price}</div>
             </div>
             <Button size="sm" onClick={() => navigate('/login')}>Order Now</Button>
            </div>
           </div>
          </Card>
         ))}
        </div>
       )}
      </section>
     </div>

     {/* Sidebar Information */}
     <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card style={{ padding: '2rem' }}>
       <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Company Details</h3>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
         <div style={{ color: 'var(--primary-teal)' }}><Factory size={20} /></div>
         <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>Manufacturer Type</div>
          <div style={{ fontSize: '0.925rem', fontWeight: 600 }}>OEM / Direct Manufacturer</div>
         </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
         <div style={{ color: 'var(--primary-teal)' }}><Globe size={20} /></div>
         <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>Website</div>
          <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--primary-teal)' }}>www.{manufacturer.companyName?.toLowerCase().replace(/\s/g, '') || 'vypaarnet'}.com</div>
         </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
         <div style={{ color: 'var(--primary-teal)' }}><Phone size={20} /></div>
         <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>Contact</div>
          <div style={{ fontSize: '0.925rem', fontWeight: 600 }}>+91 98XXX XXXXX</div>
         </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
         <div style={{ color: 'var(--primary-teal)' }}><Mail size={20} /></div>
         <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>Email</div>
          <div style={{ fontSize: '0.925rem', fontWeight: 600 }}>{manufacturer.email}</div>
         </div>
        </div>
       </div>
       <Button style={{ width: '100%', marginTop: '2rem' }}>Inquire for Bulk Order</Button>
      </Card>

      <Card style={{ padding: '1.5rem', background: 'var(--primary-teal-light)', border: '1px solid var(--primary-teal-light)' }}>
       <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-teal)', marginBottom: '0.5rem' }}>Trust Score: 98%</h4>
       <p style={{ fontSize: '0.75rem', color: 'var(--neutral-gray-600)' }}>This manufacturer has 100% on-time delivery rate and 0 reported quality issues this month.</p>
      </Card>
     </aside>
    </div>
   </main>

   <Footer />
  </div>
 );
};
