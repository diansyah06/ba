import React from 'react';
import './Footer.css'; 

const Footer = () => {
    
    return (
        <footer className="footer-container">
            <p>&copy; {new Date().getFullYear()} Digital-BA. Semua Hak Dilindungi.</p>
        </footer>
    );
};

export default Footer;