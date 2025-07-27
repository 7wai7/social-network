import reactLogo from '/react.svg'
import viteLogo from '/vite.svg'
import React, { type JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './LeftNavBar.css'
import { useUser } from '../contexts/UserContext';

function LeftNavBar(): JSX.Element {
    const { user } = useUser();
    const location = useLocation();

    return (
        <>
            <div className="left-nav-bar">
                <div className="content">
                    <Link to="/">
                        <button className="logo-btn nav-btn">
                            <img src={viteLogo} className="logo" alt="Vite logo" style={{ marginRight: "20px" }} />
                            <img src={reactLogo} className="logo react logo-spin" alt="React logo" />
                        </button>
                    </Link>
                    <Link to="/">
                        <button className={`home-btn nav-btn ${location.pathname === '/' ? 'active' : ''}`}>
                            <div className="svg-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true">
                                    <path d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913h6.638c.511 0 .929-.41.929-.913v-7.075h3.008v7.075c0 .502.418.913.929.913h6.639c.51 0 .928-.41.928-.913V7.904c0-.301-.158-.584-.408-.758zM20 20l-4.5.01.011-7.097c0-.502-.418-.913-.928-.913H9.44c-.511 0-.929.41-.929.913L8.5 20H4V8.773l8.011-5.342L20 8.764z">
                                    </path>
                                </svg>
                            </div>
                            <span className='nav-btn-title'>Home</span>
                        </button>
                    </Link>
                    <Link to="/notifications">
                        <button className={`notifications-btn nav-btn ${location.pathname === '/notifications' ? 'active' : ''}`}>
                            <div className="svg-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true">
                                    <path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z">
                                    </path>
                                </svg>
                            </div>
                            <span className='nav-btn-title'>Notifications</span>
                        </button>
                    </Link>
                    <Link to="/messages">
                        <button className={`messages-btn nav-btn ${location.pathname === '/messages' ? 'active' : ''}`}>
                            <div className="svg-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true">
                                    <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z">
                                    </path>
                                </svg>
                            </div>
                            <span className='nav-btn-title'>Messages</span>
                        </button>
                    </Link>
                    <Link to={`/profile/${user?.login}`}>
                        <button className={`profile-btn nav-btn ${location.pathname.startsWith('/profile') ? 'active' : ''}`}>
                            <div className="svg-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true">
                                    <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z">
                                    </path>
                                </svg>
                            </div>
                            <span className='nav-btn-title'>Profile</span>
                        </button>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default React.memo(LeftNavBar);