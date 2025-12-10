import React from 'react';

const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    margin: '8px 0',
    display: 'inline-block',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
};

const labelStyle = {
    fontWeight: 'bold',
    display: 'block',
    marginTop: '10px'
};

const InputField = ({ label, type, value, onChange, placeholder }) => {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={inputStyle}
                required
            />
        </div>
    );
};

export default InputField;