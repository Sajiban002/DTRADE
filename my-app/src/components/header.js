import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from 'react-router-dom';
import '../style/header-footer.css';

const Header = () => {
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const companyRef = useRef(null);
    const timeoutRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user'));
    const isLoggedIn = !!user;

    const isCompanyActive = () => {
        const path = location.pathname;
        return (
            path.startsWith('/about') ||
            path === '/api' ||
            path === '/store/merch'
        );
    };

    const handleMouseEnter = (e) => {
        e.preventDefault();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShowDropdown(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowDropdown(false);
        }, 100);
    };

    const handleDropdownMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleDropdownMouseLeave = () => {
        setShowDropdown(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        if (mobileSubmenuOpen) setMobileSubmenuOpen(false);
    };

    const toggleMobileSubmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMobileSubmenuOpen(!mobileSubmenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                companyRef.current && !companyRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
                !event.target.classList.contains('burger-menu') &&
                !event.target.parentElement?.classList.contains('burger-menu')) {
                setMobileMenuOpen(false);
                setMobileSubmenuOpen(false);
            }
        };

        const handleResize = () => {
            if (window.innerWidth > 768 && mobileMenuOpen) {
                setMobileMenuOpen(false);
                setMobileSubmenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("resize", handleResize);
        };
    }, [mobileMenuOpen, mobileSubmenuOpen]);

    return (
        <>
            <header className="header">
                <div className="header-container">
                    <div className="logo">
                        <Link to="/">DTRADE</Link>
                    </div>
                    <nav className="main-nav desktop-nav">
                        <ul>
                            <li ref={companyRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="company-menu-item">
                                <span className={`${showDropdown || isCompanyActive() ? 'active' : ''}`}>
                                    Company
                                    <span className="underline-indicator"></span>
                                </span>
                            </li>
                            <li>
                                <Link to="/news" className={location.pathname === '/news' ? 'active' : ''}>
                                    News
                                    <span className="underline-indicator"></span>
                                </Link>
                            </li>
                            <li>
                                {isLoggedIn ? (
                                    <Link to="/account" className={location.pathname === '/account' ? 'active' : ''}>
                                        Account
                                        <span className="underline-indicator"></span>
                                    </Link>
                                ) : (
                                    <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
                                        Sign in
                                        <span className="underline-indicator"></span>
                                    </Link>
                                )}
                            </li>
                        </ul>
                    </nav>
                    <div className="right-controls">
                        <div className="burger-menu-container">
                            <button className={`burger-menu ${mobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu} aria-label="Toggle menu">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                        <div className="dtrade-ai-container">
                            {/* ИЗМЕНЕНИЕ ЗДЕСЬ */}
                            <Link to="/ai" className="dtrade-ai-button">DTRADE AI</Link>
                        </div>
                    </div>
                </div>

                <div ref={dropdownRef} className={`nav-dropdown desktop-dropdown ${showDropdown ? 'active' : ''}`} onMouseEnter={handleDropdownMouseEnter} onMouseLeave={handleDropdownMouseLeave}>
                    <div className="dropdown-overlay">
                        <div className="dropdown-container">
                            <div className="dropdown-column">
                                <h3 className="dropdown-title">About</h3>
                                <ul className="dropdown-list">
                                    <li className="dropdown-item" onMouseEnter={() => setHoveredItem("who")} onMouseLeave={() => setHoveredItem(null)}>
                                        <Link to="/about#who-we-are">Who we are?<span className={`arrow-icon ${hoveredItem === "who" ? 'visible' : ''}`}>{">"}</span></Link>
                                    </li>
                                    <li className="dropdown-item" onMouseEnter={() => setHoveredItem("careers")} onMouseLeave={() => setHoveredItem(null)}>
                                        <Link to="/about#careers">Careers<span className={`arrow-icon ${hoveredItem === "careers" ? 'visible' : ''}`}>{">"}</span></Link>
                                    </li>
                                    <li className="dropdown-item" onMouseEnter={() => setHoveredItem("company")} onMouseLeave={() => setHoveredItem(null)}>
                                        <Link to="/about#company">Company<span className={`arrow-icon ${hoveredItem === "company" ? 'visible' : ''}`}>{">"}</span></Link>
                                    </li>
                                    <li className="dropdown-item" onMouseEnter={() => setHoveredItem("certificate")} onMouseLeave={() => setHoveredItem(null)}>
                                        <Link to="/about#certificate">Certificate<span className={`arrow-icon ${hoveredItem === "certificate" ? 'visible' : ''}`}>{">"}</span></Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="dropdown-column">
                                <h3 className="dropdown-title">Connect</h3>
                                <ul className="dropdown-list">
                                    <li className="dropdown-item" onMouseEnter={() => setHoveredItem("youtube")} onMouseLeave={() => setHoveredItem(null)}>
                                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube<span className={`arrow-icon ${hoveredItem === "youtube" ? 'visible' : ''}`}>{">"}</span></a>
                                    </li>
                                    <li className="dropdown-item" onMouseEnter={() => setHoveredItem("facebook")} onMouseLeave={() => setHoveredItem(null)}>
                                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook<span className={`arrow-icon ${hoveredItem === "facebook" ? 'visible' : ''}`}>{">"}</span></a>
                                    </li>
                                    <li className="dropdown-item" onMouseEnter={() => setHoveredItem("x")} onMouseLeave={() => setHoveredItem(null)}>
                                        <a href="https://x.com" target="_blank" rel="noopener noreferrer">X<span className={`arrow-icon ${hoveredItem === "x" ? 'visible' : ''}`}>{">"}</span></a>
                                    </li>
                                    <li className="dropdown-item" onMouseEnter={() => setHoveredItem("linkedin")} onMouseLeave={() => setHoveredItem(null)}>
                                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn<span className={`arrow-icon ${hoveredItem === "linkedin" ? 'visible' : ''}`}>{">"}</span></a>
                                    </li>
                                </ul>
                            </div>
                            <div className="dropdown-column">
                                <h3 className="dropdown-title">Store</h3>
                                <ul className="dropdown-list">
                                    <li className="dropdown-item" onMouseEnter={() => setHoveredItem("api")} onMouseLeave={() => setHoveredItem(null)}>
                                        <Link to="/api">API Token<span className={`arrow-icon ${hoveredItem === "api" ? 'visible' : ''}`}>{">"}</span></Link>
                                    </li>
                                    <li className="dropdown-item" onMouseEnter={() => setHoveredItem("merch")} onMouseLeave={() => setHoveredItem(null)}>
                                        <Link to="/store/merch">Merch<span className={`arrow-icon ${hoveredItem === "merch" ? 'visible' : ''}`}>{">"}</span></Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div ref={mobileMenuRef} className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <nav className="mobile-nav">
                        <ul>
                            <li className="mobile-menu-item">
                                <div className={`mobile-dropdown-trigger ${mobileSubmenuOpen ? 'active' : ''}`} onClick={toggleMobileSubmenu}>
                                    Company
                                    <span className="mobile-dropdown-icon">{mobileSubmenuOpen ? '-' : '+'}</span>
                                </div>
                                <div className={`mobile-dropdown ${mobileSubmenuOpen ? 'active' : ''}`}>
                                    <div className="mobile-dropdown-section">
                                        <h3 className="mobile-dropdown-title">About</h3>
                                        <ul className="mobile-dropdown-list">
                                            <li><Link to="/about#who-we-are" onClick={() => setMobileMenuOpen(false)}>Who we are?</Link></li>
                                            <li><Link to="/about#careers" onClick={() => setMobileMenuOpen(false)}>Careers</Link></li>
                                            <li><Link to="/about#company" onClick={() => setMobileMenuOpen(false)}>Company</Link></li>
                                            <li><Link to="/about#certificate" onClick={() => setMobileMenuOpen(false)}>Certificate</Link></li>
                                        </ul>
                                    </div>
                                    <div className="mobile-dropdown-section">
                                        <h3 className="mobile-dropdown-title">Connect</h3>
                                        <ul className="mobile-dropdown-list">
                                            <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a></li>
                                            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                                            <li><a href="https://x.com" target="_blank" rel="noopener noreferrer">X</a></li>
                                            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                                        </ul>
                                    </div>
                                    <div className="mobile-dropdown-section">
                                        <h3 className="mobile-dropdown-title">Store</h3>
                                        <ul className="mobile-dropdown-list">
                                            <li><Link to="/api" onClick={() => setMobileMenuOpen(false)}>API Token</Link></li>
                                            <li><Link to="/store/merch" onClick={() => setMobileMenuOpen(false)}>Merch</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li className="mobile-menu-item">
                                <Link to="/news" className={location.pathname === '/news' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                                    News
                                </Link>
                            </li>
                            <li className="mobile-menu-item">
                                {isLoggedIn ? (
                                    <Link to="/account" className={location.pathname === '/account' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                                        Account
                                    </Link>
                                ) : (
                                    <Link to="/login" className={location.pathname === '/login' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                                        Sign in
                                    </Link>
                                )}
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
        </>
    );
};

export default Header;