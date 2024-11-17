import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Nav/Navbar';
import Banner from './components/banner';
import ProductList from './components/ProductList';
import Cart from './components/card';
import Checkout from './components/Checkout';
import About from './components/About';
import Account from './Auth/Account';
import Admin from './Auth/AdminInfo';
import User from './Auth/UserInfo';
import ProductDetail from './components/ProductDetail';
import Footer from './Nav/Footer';
import products, { filterProducts, addToCart, removeFromCart, getBestSellingProducts } from './Data/ProductData';
import './Home.css';
import { useUserContext } from './UserContext';

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [category, setCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(50000000); // Giá trị tối đa là 50 triệu
    const { isLogin, currentUser } = useUserContext();
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Thêm trạng thái để mở/đóng bộ lọc

    useEffect(() => {
        setBestSellingProducts(getBestSellingProducts(products)); // Lấy 4 sản phẩm bán chạy
    }, []);

    useEffect(() => {
        if (!isLogin && (location.pathname === "/cart" || location.pathname === "/checkout")) {
            navigate('/account');
        }
    }, [isLogin, location.pathname, navigate]);

    const handleSearch = (searchTerm, category) => {
        const result = filterProducts(products, searchTerm, category);
        setFilteredProducts(result);
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
        ).filter((item) => item.quantity > 0); // Remove items with quantity <= 0
        setCart(updatedCart);
    };

    const clearCart = () => {
        setCart([]); // Làm sạch giỏ hàng
    };

    const filterProductsByPrice = (min, max) => {
        return products.filter(product => product.price >= min && product.price <= max);
    };

    const handlePriceFilter = () => {
        const filtered = filterProductsByPrice(minPrice, maxPrice);
        setFilteredProducts(filtered);
    };

    // Định dạng giá trị số với dấu phân cách nghìn
    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
    };

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const nextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const prevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
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
                        <h2>Best selling products</h2>
                        <ProductList
                            products={bestSellingProducts}
                        />
                    </div>
                )}

                {/* Button to toggle filter */}
                <div
                    className="filter-toggle"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    title="Filter by Price"
                >
                    <span className="filter-icon">{isFilterOpen ? '-' : '+'}</span> {/* Dấu tròn */}
                </div>

                {/* Price filter content */}
                {isFilterOpen && (
                    <div className="price-filter">
                        <h3>Filter by Price</h3>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="175000"
                                max="50000000"
                                step="1000"
                                value={minPrice}
                                onChange={(e) => setMinPrice(Number(e.target.value))}
                                className="slider"
                            />
                            <input
                                type="range"
                                min="175000"
                                max="50000000"
                                step="1000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="slider"
                            />
                        </div>
                        <div className="slider-values">
                            <span>{`Min Price: ${formatPrice(minPrice)}`}</span>
                            <span>{`Max Price: ${formatPrice(maxPrice)}`}</span>
                        </div>
                        <button className='btn-price' onClick={handlePriceFilter}>Apply Price Filter</button>
                    </div>
                )}

                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProductList
                                products={currentProducts}
                                addToCart={handleAddToCart}
                                currentPage={currentPage}
                                nextPage={nextPage}
                                prevPage={prevPage}
                                hasNextPage={indexOfLastProduct < filteredProducts.length}
                            />
                        }
                    />
                    <Route path="/cart" element={isLogin ? <Cart cartItems={cart} removeFromCart={handleRemoveFromCart} updateQuantity={handleUpdateQuantity} /> : <Account />} />
                    <Route path="/checkout" element={isLogin ? <Checkout cartItems={cart} clearCart={clearCart} /> : <Account />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/account" element={isLogin ? (currentUser?.isAdmin ? <Admin /> : <User />) : <Account />} />
                    <Route path="/product/:id" element={<ProductDetail products={products} addToCart={handleAddToCart} />} />
                </Routes>
            </div>
            <Footer />
        </>
    );
};

export default Home;
