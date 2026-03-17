/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ProfilePage from './ProfilePage';
import LoginPage from './LoginPage';
import CollectionPage from './CollectionPage';
import ServicesPage from './ServicesPage';
import AdminDashboard from './AdminDashboard';
import ItemDetailsPage from './ItemDetailsPage';
import { FirebaseProvider } from './FirebaseContext';
import { CartProvider } from './CartContext';
import { Cart } from './components/Cart';

export default function App() {
  const configuredBase = ((import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/').replace(/\/$/, '');
  const shouldUseBase =
    configuredBase !== '' &&
    configuredBase !== '/' &&
    (window.location.pathname === configuredBase || window.location.pathname.startsWith(`${configuredBase}/`));

  const basename = shouldUseBase ? configuredBase : undefined;

  return (
    <FirebaseProvider>
      <CartProvider>
        <Router basename={basename}>
          <Cart />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/admin" element={<AdminDashboard onBack={() => window.history.back()} />} />
          </Routes>
        </Router>
      </CartProvider>
    </FirebaseProvider>
  );
}
