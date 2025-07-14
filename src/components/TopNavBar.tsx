import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styles/topbar.css";
import logo from "../assets/logo.png";
import { Plus } from "lucide-react";
// import { vehicleAPI, Vehicle } from "../services/api";

const TopNavBar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // const [expiringVehicles, setExpiringVehicles] = useState<Vehicle[]>([]);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!notificationOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [notificationOpen]);

  // useEffect(() => {
  //   // Fetch vehicles and filter those with insurance expiring soon
  //   const fetchExpiringVehicles = async () => {
  //     try {
  //       const vehicles = await vehicleAPI.getAllVehicles();
  //       const today = new Date();
  //       today.setHours(0, 0, 0, 0);
  //       const soon = vehicles.filter((v) => {
  //         const endDate = v.insurance?.endDate;
  //         if (!endDate) return false;
  //         const end = new Date(endDate);
  //         end.setHours(0, 0, 0, 0);
  //         const diffDays = Math.ceil(
  //           (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  //         );
  //         return diffDays <= 5;
  //       });
  //       setExpiringVehicles(soon);
  //     } catch (err) {
  //       setExpiringVehicles([]);
  //     }
  //   };
  //   fetchExpiringVehicles();
  // }, []);

  return (
    <nav className="top-navbar">
      <div className="navItem">
        <a href=""><img src={logo} alt="Logo" /></a>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <div className={`nav-links-container${menuOpen ? ' open' : ''}`}>
          <ul className="nav-list2">
            <li className='nav-link'>
              <NavLink
                to="/"
                className={({ isActive }) => isActive ? 'active' : ''}
                style={{ fontSize: '14px', fontWeight: 400,color:'#cccccc' }}
              >
                Dashboard
              </NavLink>
            </li>
            <li className='nav-link'>
              <NavLink
                to="/insurance"
                className={({ isActive }) => isActive ? 'active' : ''}
                style={{ fontSize: '14px', fontWeight: 400,color:'#cccccc' }}
              >
                Billing
              </NavLink>
            </li>
            <li className='nav-link'>
              <NavLink
                to="/documents"
                className={({ isActive }) => isActive ? 'active' : ''}
                style={{ fontSize: '14px', fontWeight: 400,color:'#cccccc' }}
              >
                Pharmacy
              </NavLink>
            </li>
            <li className='nav-link'>
              <NavLink
                to="/documents"
                className={({ isActive }) => isActive ? 'active' : ''}
                style={{ fontSize: '14px', fontWeight: 400,color:'#cccccc' }}
              >
                Appointments
              </NavLink>
            </li>
            {/* <li className='dropdown'>
              <NavLink
                to="/documents"
                className={({ isActive }) => isActive ? 'active' : ''}
                style={{ fontSize: '14px', fontWeight: 400,color:'#cccccc' }}
              >
                More <i className="fas fa-caret-down" style={{fontSize:'12px',marginLeft:'4px'}}></i>
              </NavLink>
            </li> */}

            <li className='nav-link dropdown' style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                className="dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ fontSize: '14px', fontWeight: 400, color: '#cccccc', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {/* <a href="" className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>More</a> */}
                More 
              </button>
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <li><NavLink to="/" className="dropdown-item">Users</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Masters</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Mobile App</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Ad Module</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Procedure Appointments</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Users</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Masters</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Mobile App</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Ad Module</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Procedure Appointments</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Users</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Masters</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Mobile App</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Ad Module</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Procedure Appointments</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Users</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Masters</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Mobile App</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Ad Module</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Procedure Appointments</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Users</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Masters</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Mobile App</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Ad Module</NavLink></li>
                  <li><NavLink to="/" className="dropdown-item">Procedure Appointments</NavLink></li>
                </ul>
              )}
            </li>

          </ul>
        </div>
      </div>
      <div className={`nav-right${menuOpen ? " open" : ""}`}>
        <ul className="nav-list">
          <div className="searchBar">
            <input type="search" name="search" className='searchBarInput' placeholder="Search Patient with Name or Card No. or Mobile No." />
          </div>
          <div className="nav-buttons">
            <li className='nav-list-button'><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} style={{fontWeight:400}}>New Sale</NavLink></li>
            <li className='nav-list-button'><NavLink to="/register-vehicle" className={({ isActive }) => isActive ? 'active' : ''} style={{fontWeight:400}}> <Plus size={16} /> Add Patient</NavLink></li>
          </div>
          <div className="nav-div-main">
            <div className="nav-div">
              <a href="/vehicle-list" className="nav-link text-white" title="Vehicle List">
                <i className="fa-solid fa-magnifying-glass "></i>
              </a>
            </div>
            <div className="nav-div" style={{ position: "relative" }}>
              <a
                href="#"
                className="nav-link text-white"
                onClick={(e) => {
                  e.preventDefault();
                  setNotificationOpen((v) => !v);
                }}
              >
                <i className="fas fa-bell  mt-1"></i>
              </a>
            </div>
            <div className="nav-div">
              <a href="#" className="nav-link text-white" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                alert('Settings Disabled');
              }}>
                <i className="fas fa-cog  mt-1"></i>
              </a>
            </div>
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default TopNavBar; 