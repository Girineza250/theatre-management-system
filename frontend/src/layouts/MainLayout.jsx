import { useState, useEffect, Fragment } from 'react';
import { Link, NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import useResponsive from '@hooks/useResponsive';
import GlobalSearch from '@components/common/GlobalSearch';
import { Menu, Transition } from '@headlessui/react';
import classNames from 'classnames';

// Icons
import { 
  HomeIcon, 
  FilmIcon, 
  TicketIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  InformationCircleIcon,
  PhoneIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const MainLayout = () => {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Handle search navigation
  const handleSearchNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false); // Close mobile menu if open
  };
  
  // Main navigation items
  const mainNavigationItems = [
    { name: 'Home', to: '/', icon: <HomeIcon className="w-4 h-4" /> },
    { name: 'Movies', to: '/movies', icon: <FilmIcon className="w-4 h-4" /> }
  ];

  // Secondary navigation items (for dropdown on desktop)
  const secondaryNavigationItems = [
    { name: 'About', to: '/about', icon: <InformationCircleIcon className="w-4 h-4" /> },
    { name: 'Contact', to: '/contact', icon: <PhoneIcon className="w-4 h-4" /> }
  ];
  
  // User navigation items (when authenticated)
  const userNavigationItems = [
    { name: 'My Bookings', to: '/bookings', icon: <TicketIcon className="w-4 h-4" /> },
    { name: 'Profile', to: '/profile', icon: <UserIcon className="w-4 h-4" /> }
  ];

  // User dropdown menu items
  const userDropdownItems = [
    ...userNavigationItems,
    { name: 'Settings', to: '/settings', icon: <Cog6ToothIcon className="w-4 h-4" /> },
    { type: 'divider' },
    { name: 'Sign out', action: handleLogout, icon: <ArrowRightOnRectangleIcon className="w-4 h-4" /> }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and main navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center space-x-2">
                  <FilmIcon className="h-8 w-8 text-primary-600" />
                  <span className="text-xl font-bold text-primary-600">THMS</span>
                </Link>
              </div>
              
              {/* Desktop Navigation - Compact */}
              <nav className="hidden md:flex items-center space-x-6">
                {/* Main navigation items */}
                {mainNavigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) => 
                      classNames(
                        'inline-flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                        isActive 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}

                {/* More dropdown for secondary items */}
                <Menu as="div" className="relative">
                  <Menu.Button className="inline-flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
                    <span>More</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </Menu.Button>
                  
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        {secondaryNavigationItems.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                to={item.to}
                                className={classNames(
                                  'flex items-center space-x-2 px-4 py-2 text-sm',
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                )}
                              >
                                {item.icon}
                                <span>{item.name}</span>
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </nav>
            </div>

            {/* Global Search - Expanded on Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <GlobalSearch
                userRole={user?.role}
                onNavigate={handleSearchNavigate}
                className="w-full"
              />
            </div>
            
            {/* User navigation */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* Admin Link */}
                  {hasRole(['ROLE_ADMIN', 'ROLE_MANAGER']) && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors duration-200"
                    >
                      Admin
                    </Link>
                  )}

                  {/* Quick Bookings Link */}
                  <Link
                    to="/bookings"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                  >
                    <TicketIcon className="w-4 h-4" />
                    <span>Bookings</span>
                  </Link>
                  
                  {/* User Menu Dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
                      <div className="h-7 w-7 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-xs">
                        {user?.firstName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="hidden lg:inline">
                        {user?.firstName || user?.username}
                      </span>
                      <ChevronDownIcon className="w-4 h-4" />
                    </Menu.Button>
                    
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1">
                          {userDropdownItems.map((item, index) => (
                            item.type === 'divider' ? (
                              <div key={`divider-${index}`} className="border-t border-gray-100 my-1" />
                            ) : (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  item.action ? (
                                    <button
                                      onClick={item.action}
                                      className={classNames(
                                        'flex items-center space-x-2 w-full px-4 py-2 text-sm text-left',
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      )}
                                    >
                                      {item.icon}
                                      <span>{item.name}</span>
                                    </button>
                                  ) : (
                                    <Link
                                      to={item.to}
                                      className={classNames(
                                        'flex items-center space-x-2 px-4 py-2 text-sm',
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      )}
                                    >
                                      {item.icon}
                                      <span>{item.name}</span>
                                    </Link>
                                  )
                                )}
                              </Menu.Item>
                            )
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                aria-expanded="false"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobile && mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            {/* Mobile Search */}
            <div className="px-4 py-3 border-b border-gray-200">
              <GlobalSearch
                userRole={user?.role}
                onNavigate={handleSearchNavigate}
                onClose={() => setMobileMenuOpen(false)}
                className="w-full"
              />
            </div>

            {/* Mobile Navigation */}
            <div className="pt-2 pb-3 space-y-1">
              {[...mainNavigationItems, ...secondaryNavigationItems].map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) => 
                    classNames(
                      'flex items-center space-x-3 pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors duration-200',
                      isActive 
                        ? 'bg-primary-50 border-primary-500 text-primary-700' 
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    )
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
            
            {isAuthenticated ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4 mb-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username}
                    </div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  {/* Admin Link for Mobile */}
                  {hasRole(['ROLE_ADMIN', 'ROLE_MANAGER']) && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-3 pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-primary-600 hover:bg-primary-50 hover:border-primary-300"
                    >
                      <Cog6ToothIcon className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  {userNavigationItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      className={({ isActive }) => 
                        classNames(
                          'flex items-center space-x-3 pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors duration-200',
                          isActive 
                            ? 'bg-primary-50 border-primary-500 text-primary-700' 
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                        )
                      }
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="space-y-1 px-4">
                  <Link
                    to="/login"
                    className="flex items-center py-3 text-base font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center py-3 text-base font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-grow bg-gray-50">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex justify-center md:justify-start space-x-6 mb-4 md:mb-0">
              <Link to="/" className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
                Home
              </Link>
              <Link to="/movies" className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
                Movies
              </Link>
              <Link to="/about" className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
                About
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
                Contact
              </Link>
            </div>
            <div className="text-center md:text-right text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Theatre Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;