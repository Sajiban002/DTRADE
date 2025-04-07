import React from 'react';
import '../style/SearchBar.css';

const SearchBar = ({ placeholder, onChange, value }) => {
    return (
        <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="search-icon">
                <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 19L14.65 14.65" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {value && (
                <button
                    className="clear-search"
                    onClick={() => onChange({ target: { value: '' } })}
                >
                    ×
                </button>
            )}
        </div>
    );
};

export default SearchBar;