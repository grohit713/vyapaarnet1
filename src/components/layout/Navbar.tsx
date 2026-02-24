import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
    const navigate = useNavigate();

    return (
        <nav style={{
            backgroundColor: 'white',
            borderBottom: '1px solid var(--neutral-gray-200)',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div className="container" style={{
                height: '4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Simple Logo Placeholder */}
                    <div style={{ color: 'var(--primary-teal)', fontWeight: 700, fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                        <ShoppingBag style={{ marginRight: '0.5rem' }} />
                        VyapaarNet
                    </div>
                </Link>

                {/* Search Bar (Desktop) */}
                <div style={{ flex: 1, maxWidth: '32rem', margin: '0 2rem', display: 'none' }} className="hidden-mobile">
                    {/* Note: hidden-mobile class needs to be defined in media queries if we want responsive hiding. 
             For now, I'll just leave it visible or add inline styles for simplicity in this prototype phase.
          */}
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-gray-400)', width: '1.25rem' }} />
                        <input
                            type="text"
                            placeholder="Search manufacturers, products..."
                            style={{
                                width: '100%',
                                padding: '0.625rem 1rem 0.625rem 2.5rem',
                                borderRadius: '9999px',
                                border: '1px solid var(--neutral-gray-300)',
                                outline: 'none',
                                backgroundColor: 'var(--neutral-gray-50)'
                            }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                    <Button onClick={() => navigate('/register')}>Get Started</Button>
                </div>
            </div>
        </nav>
    );
};
