import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Nav/Navbar';
import Banner from './components/banner';
import ProductList from './components/ProductList';
import Cart from './components/card';
import Checkout from './components/Checkout';
import About from './components/About';
import Account from './Auth/Account';
import Admin from './Auth/AdminPanel';
import User from './Auth/UserInfo';
import ProductDetail from './components/ProductDetail';
import Footer from './Nav/Footer';
import products, { filterProducts, addToCart, removeFromCart, getBestSellingProducts } from './Data/ProductData';
import './components/ProductList.css';
import { useUserContext } from './UserContext';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const { isLogin, currentUser } = useUserContext();

  useEffect(() => {
    if (!isLogin && (location.pathname === "/cart" || location.pathname === "/checkout")) {
      navigate('/account');
    }
  }, [isLogin, location.pathname, navigate]);

  const handleSearch = (searchTerm, category) => {
    const result = filterProducts(products, searchTerm, category);
    setFilteredProducts(result); // Cập nhật danh sách sản phẩm sau khi lọc
  };

  const handleAddToCart = (product) => {
    const updatedCart = addToCart(cart, product);
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (productId) => {
    const updatedCart = removeFromCart(cart, productId);
    setCart(updatedCart);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ).filter((item) => item.quantity > 0);
    setCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <>
      <Navbar
        onSearch={handleSearch}
        category={category}
        setCategory={setCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      {location.pathname === "/" && <Banner />}
      <div className="app">
        {location.pathname === "/" && (
          <div className="best-selling">
            <h2>Sản Phẩm Bán Chạy</h2>
            <ProductList
              products={getBestSellingProducts(products).slice(0, 4)} // Hiển thị tối đa 5 sản phẩm
              addToCart={handleAddToCart}
            />
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <ProductList
                products={filteredProducts} // Tất cả sản phẩm sau khi lọc
                addToCart={handleAddToCart}
              />
            }
          />
          <Route path="/cart" element={isLogin ? <Cart cartItems={cart} removeFromCart={handleRemoveFromCart} updateQuantity={handleUpdateQuantity} /> : <Account />} />
          <Route path="/checkout" element={isLogin ? <Checkout cartItems={cart} clearCart={clearCart} /> : <Account />} />
          <Route path="/about" element={<About />} />
          <Route path="/account" element={isLogin ? (currentUser?.isAdmin ? <Admin /> : <User />) : <Account />} />
          <Route path="/admin" element={isLogin && currentUser?.isAdmin ? <Admin /> : <Account />} />
          <Route path="/product/:id" element={<ProductDetail products={products} addToCart={handleAddToCart} />} />
          
          {/* Routes cho các danh mục */}
          <Route
            path="/products/Headphone"
            element={
              <ProductList
                products={filteredProducts.filter(product => product.category === 'Headphone')}
                addToCart={handleAddToCart}
              />
            }
          />
          <Route
            path="/products/Keyboard"
            element={
              <ProductList
                products={filteredProducts.filter(product => product.category === 'Keyboard')}
                addToCart={handleAddToCart}
              />
            }
          />
        </Routes>
      </div>
      <Footer />
    </>
  );

};

export default Home;
