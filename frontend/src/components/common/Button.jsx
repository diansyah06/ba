import React from 'react';

const Button = ({ children, onClick, type = 'button', isLoading = false, disabled = false, style = {} }) => {
    
    // Style dasar
    const baseStyle = {
        width: '100%',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '14px 20px',
        margin: '10px 0',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled || isLoading ? 0.7 : 1, // Redupkan jika disabled/loading
        pointerEvents: disabled || isLoading ? 'none' : 'auto', // Matikan klik
        ...style // Allow override style
    };

    return (
        <button 
            type={type} 
            onClick={onClick} 
            style={baseStyle}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                // Animasi Loading Sederhana (CSS Spinner)
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg className="spinner" viewBox="0 0 50 50" style={{width: '20px', height: '20px', animation: 'spin 1s linear infinite'}}>
                        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5"></circle>
                    </svg>
                    Memproses...
                </span>
            ) : (
                children
            )}
            
            {/* Style untuk animasi spin */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </button>
    );
};

export default Button;