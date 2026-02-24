import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer style={{ backgroundColor: 'var(--neutral-gray-900)', color: 'white', padding: '4rem 0' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'white' }}>VyapaarNet</h3>
                        <p style={{ color: 'var(--neutral-gray-300)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                            India's premier B2B marketplace connecting shopkeepers with manufacturers directly.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Platform</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--neutral-gray-300)', fontSize: '0.875rem', lineHeight: '2' }}>
                            <li>Browse Manufacturers</li>
                            <li>Sell on VyapaarNet</li>
                            <li>Pricing</li>
                            <li>Success Stories</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Support</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--neutral-gray-300)', fontSize: '0.875rem', lineHeight: '2' }}>
                            <li>Help Center</li>
                            <li>Safety Guidelines</li>
                            <li>Terms of Service</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Contact</h4>
                        <p style={{ color: 'var(--neutral-gray-300)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            support@vyapaarnet.com
                        </p>
                        <p style={{ color: 'var(--neutral-gray-300)', fontSize: '0.875rem' }}>
                            +91 1800-123-4567
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--neutral-gray-800)', textAlign: 'center', color: 'var(--neutral-gray-500)', fontSize: '0.875rem' }}>
                    © {new Date().getFullYear()} VyapaarNet. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
