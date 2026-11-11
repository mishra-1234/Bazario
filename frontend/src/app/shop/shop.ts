import { Component, HostListener, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';


interface Category {
  name: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
}



interface Vendor {
  id: number;
  name: string;
  category: string;
  rating: number;
  productsCount: string;
  location: string;
  verified: boolean;
  emoji: string;
}





interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  vendor: string;
  delivery: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  isNew?: boolean;
}


interface Banner {
  title: string;
  subtitle: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
}






@Component({
  selector: 'app-shop',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop  implements OnInit {


  /* ---------------- AUTH STATE ---------------- */
  isLoggedIn = false;
  userName = '';

  /* ---------------- HEADER / SCROLL STATE ---------------- */
  isScrolled = false;
  showMobileMenu = false;
  showCategoriesMenu = false;

  /* ---------------- SEARCH ---------------- */
  searchTerm = '';
  popularTags = ['📱 Electronics', '👗 Fashion', '🛒 Grocery', '🏠 Home & Living', '💄 Beauty', '🎨 Handicrafts'];

  /* ---------------- CART ---------------- */
  cartCount = 0;
  cartItems: Product[] = [];
  showToast = false;
  toastMessage = '';

  /* ---------------- LOGIN MODAL ---------------- */
  showLoginModal = false;

  /* ---------------- FILTERS ---------------- */
  showFilters = false;
  selectedCategory = 'All';
  selectedVendor = 'All';
  minPrice = 0;
  maxPrice = 5000;
  minRating = 0;
  minDiscount = 0;
  sortBy = 'popularity';

  /* ---------------- CATEGORIES ---------------- */
  categories: Category[] = [
    { name: 'Electronics', icon: '📱', colorFrom: '#7C3AED', colorTo: '#A855F7' },
    { name: 'Fashion', icon: '👗', colorFrom: '#EC4899', colorTo: '#F472B6' },
    { name: 'Grocery', icon: '🛒', colorFrom: '#10B981', colorTo: '#34D399' },
    { name: 'Home & Living', icon: '🏠', colorFrom: '#F59E0B', colorTo: '#FBBF24' },
    { name: 'Beauty', icon: '💄', colorFrom: '#F43F5E', colorTo: '#FB7185' },
    { name: 'Sports', icon: '⚽', colorFrom: '#0EA5E9', colorTo: '#38BDF8' },
    { name: 'Books', icon: '📚', colorFrom: '#8B5CF6', colorTo: '#A78BFA' },
    { name: 'Toys', icon: '🧸', colorFrom: '#FB923C', colorTo: '#FDBA74' },
    { name: 'Jewellery', icon: '💍', colorFrom: '#EAB308', colorTo: '#FDE047' },
    { name: 'Handicrafts', icon: '🎨', colorFrom: '#DC2626', colorTo: '#F87171' },
    { name: 'Mobile Accessories', icon: '🎧', colorFrom: '#6366F1', colorTo: '#818CF8' },
    { name: 'Kitchen', icon: '🍳', colorFrom: '#14B8A6', colorTo: '#2DD4BF' },
    { name: 'Footwear', icon: '👟', colorFrom: '#0891B2', colorTo: '#22D3EE' },
    { name: 'Bags', icon: '👜', colorFrom: '#BE185D', colorTo: '#EC4899' },
    { name: 'Stationery', icon: '✏️', colorFrom: '#65A30D', colorTo: '#A3E635' }
  ];

  /* ---------------- VENDORS (30+) ---------------- */
  vendors: Vendor[] = [
    { id: 1, name: 'Ravi Electronics Hub', category: 'Electronics', rating: 4.7, productsCount: '2.4K', location: 'Bhubaneswar', verified: true, emoji: '📱' },
    { id: 2, name: 'Maa Laxmi Fashion', category: 'Fashion', rating: 4.5, productsCount: '1.8K', location: 'Cuttack', verified: true, emoji: '👗' },
    { id: 3, name: 'Odisha Craft House', category: 'Handicrafts', rating: 4.8, productsCount: '900', location: 'Puri', verified: true, emoji: '🎨' },
    { id: 4, name: 'SmartTech Bazaar', category: 'Electronics', rating: 4.6, productsCount: '3.1K', location: 'Bengaluru', verified: true, emoji: '💻' },
    { id: 5, name: 'Bharat Home Store', category: 'Home & Living', rating: 4.4, productsCount: '1.2K', location: 'Delhi', verified: false, emoji: '🏠' },
    { id: 6, name: 'Shree Ganesh Traders', category: 'Grocery', rating: 4.5, productsCount: '2.0K', location: 'Ahmedabad', verified: true, emoji: '🛒' },
    { id: 7, name: 'Royal Threads', category: 'Fashion', rating: 4.6, productsCount: '1.5K', location: 'Jaipur', verified: true, emoji: '👔' },
    { id: 8, name: 'Krishna Handicrafts', category: 'Handicrafts', rating: 4.7, productsCount: '760', location: 'Puri', verified: true, emoji: '🪔' },
    { id: 9, name: 'Apna Grocery Mart', category: 'Grocery', rating: 4.3, productsCount: '1.9K', location: 'Lucknow', verified: false, emoji: '🥦' },
    { id: 10, name: 'Urban Style India', category: 'Fashion', rating: 4.5, productsCount: '2.2K', location: 'Mumbai', verified: true, emoji: '🧥' },
    { id: 11, name: 'Digital Duniya', category: 'Electronics', rating: 4.4, productsCount: '1.7K', location: 'Pune', verified: true, emoji: '🖥️' },
    { id: 12, name: 'Maa Tarini Collections', category: 'Jewellery', rating: 4.8, productsCount: '540', location: 'Bhubaneswar', verified: true, emoji: '💍' },
    { id: 13, name: 'New India Mobiles', category: 'Mobile Accessories', rating: 4.3, productsCount: '2.6K', location: 'Chennai', verified: false, emoji: '🎧' },
    { id: 14, name: 'FreshKart Foods', category: 'Grocery', rating: 4.6, productsCount: '1.4K', location: 'Hyderabad', verified: true, emoji: '🍎' },
    { id: 15, name: 'Odisha Saree Palace', category: 'Fashion', rating: 4.8, productsCount: '980', location: 'Sambalpur', verified: true, emoji: '🥻' },
    { id: 16, name: 'Smart Home Hub', category: 'Home & Living', rating: 4.5, productsCount: '1.1K', location: 'Kolkata', verified: true, emoji: '💡' },
    { id: 17, name: 'Fashion Junction', category: 'Fashion', rating: 4.4, productsCount: '2.0K', location: 'Surat', verified: false, emoji: '👚' },
    { id: 18, name: 'The Gadget Garage', category: 'Electronics', rating: 4.6, productsCount: '1.6K', location: 'Noida', verified: true, emoji: '⌚' },
    { id: 19, name: 'Desi Decor Studio', category: 'Home & Living', rating: 4.7, productsCount: '620', location: 'Jodhpur', verified: true, emoji: '🖼️' },
    { id: 20, name: 'Bharat Sports Corner', category: 'Sports', rating: 4.5, productsCount: '890', location: 'Indore', verified: true, emoji: '⚽' },
    { id: 21, name: 'Elegant Jewellery House', category: 'Jewellery', rating: 4.9, productsCount: '410', location: 'Bhubaneswar', verified: true, emoji: '💎' },
    { id: 22, name: 'Green Basket Organics', category: 'Grocery', rating: 4.6, productsCount: '1.3K', location: 'Nagpur', verified: true, emoji: '🥬' },
    { id: 23, name: 'Campus Stationery', category: 'Stationery', rating: 4.3, productsCount: '740', location: 'Patna', verified: false, emoji: '✏️' },
    { id: 24, name: 'Kids Kingdom Store', category: 'Toys', rating: 4.5, productsCount: '1.0K', location: 'Ranchi', verified: true, emoji: '🧸' },
    { id: 25, name: 'Trendy Footwear', category: 'Footwear', rating: 4.4, productsCount: '1.5K', location: 'Agra', verified: true, emoji: '👟' },
    { id: 26, name: 'Classic Book Point', category: 'Books', rating: 4.7, productsCount: '2.1K', location: 'Bhopal', verified: true, emoji: '📚' },
    { id: 27, name: 'Home Comforts', category: 'Home & Living', rating: 4.4, productsCount: '980', location: 'Vizag', verified: false, emoji: '🛋️' },
    { id: 28, name: 'Mobile Mania', category: 'Mobile Accessories', rating: 4.3, productsCount: '1.9K', location: 'Guwahati', verified: true, emoji: '📲' },
    { id: 29, name: 'Odisha Organic Mart', category: 'Grocery', rating: 4.8, productsCount: '560', location: 'Berhampur', verified: true, emoji: '🌾' },
    { id: 30, name: 'Shree Jagannath Crafts', category: 'Handicrafts', rating: 4.9, productsCount: '430', location: 'Puri', verified: true, emoji: '🕉️' },
    { id: 31, name: 'Sunrise Electronics', category: 'Electronics', rating: 4.5, productsCount: '1.4K', location: 'Rourkela', verified: true, emoji: '🔌' },
    { id: 32, name: 'Royal Kitchen Store', category: 'Kitchen', rating: 4.6, productsCount: '870', location: 'Ludhiana', verified: true, emoji: '🍳' },
    { id: 33, name: 'Modern Living Hub', category: 'Home & Living', rating: 4.4, productsCount: '1.0K', location: 'Chandigarh', verified: false, emoji: '🛏️' },
    { id: 34, name: 'Desi Fashion Point', category: 'Fashion', rating: 4.5, productsCount: '1.6K', location: 'Varanasi', verified: true, emoji: '🧵' },
    { id: 35, name: 'The Gift Gallery', category: 'Handicrafts', rating: 4.6, productsCount: '520', location: 'Cuttack', verified: true, emoji: '🎁' }
  ];

  /* ---------------- PRODUCTS (45+) ---------------- */
  products: Product[] = [
    { id: 1, name: 'Wireless Bluetooth Headphones', category: 'Electronics', price: 1299, originalPrice: 2499, rating: 4.5, reviews: 3210, vendor: 'Ravi Electronics Hub', delivery: 'Free delivery by Tomorrow', emoji: '🎧', colorFrom: '#7C3AED', colorTo: '#A855F7', isNew: true },
    { id: 2, name: "Men's Casual Shirt", category: 'Fashion', price: 699, originalPrice: 1299, rating: 4.4, reviews: 1876, vendor: 'Royal Threads', delivery: 'Free delivery by Fri', emoji: '👔', colorFrom: '#EC4899', colorTo: '#F472B6' },
    { id: 3, name: 'Handmade Odisha Sambalpuri Saree', category: 'Fashion', price: 1899, originalPrice: 3499, rating: 4.8, reviews: 542, vendor: 'Odisha Saree Palace', delivery: 'Delivery in 3-5 days', emoji: '🥻', colorFrom: '#DC2626', colorTo: '#F87171', isNew: true },
    { id: 4, name: 'Smart LED Bulb', category: 'Home & Living', price: 399, originalPrice: 799, rating: 4.3, reviews: 2210, vendor: 'Smart Home Hub', delivery: 'Free delivery by Tomorrow', emoji: '💡', colorFrom: '#F59E0B', colorTo: '#FBBF24' },
    { id: 5, name: 'Wooden Wall Decor', category: 'Home & Living', price: 899, originalPrice: 1599, rating: 4.6, reviews: 654, vendor: 'Desi Decor Studio', delivery: 'Delivery in 4-6 days', emoji: '🖼️', colorFrom: '#14B8A6', colorTo: '#2DD4BF' },
    { id: 6, name: 'Organic Rice 5kg', category: 'Grocery', price: 549, originalPrice: 699, rating: 4.7, reviews: 987, vendor: 'Odisha Organic Mart', delivery: 'Free delivery by Tomorrow', emoji: '🌾', colorFrom: '#65A30D', colorTo: '#A3E635' },
    { id: 7, name: 'Smartwatch Fitness Band', category: 'Electronics', price: 1599, originalPrice: 2999, rating: 4.4, reviews: 4102, vendor: 'The Gadget Garage', delivery: 'Free delivery by Tomorrow', emoji: '⌚', colorFrom: '#6366F1', colorTo: '#818CF8', isNew: true },
    { id: 8, name: "Women's Kurti Set", category: 'Fashion', price: 899, originalPrice: 1799, rating: 4.5, reviews: 1320, vendor: 'Fashion Junction', delivery: 'Delivery in 2-4 days', emoji: '👘', colorFrom: '#F43F5E', colorTo: '#FB7185' },
    { id: 9, name: 'Silver Plated Jhumka Earrings', category: 'Jewellery', price: 449, originalPrice: 899, rating: 4.6, reviews: 765, vendor: 'Elegant Jewellery House', delivery: 'Delivery in 3-5 days', emoji: '💎', colorFrom: '#EAB308', colorTo: '#FDE047' },
    { id: 10, name: 'Non-Stick Cookware Set', category: 'Kitchen', price: 1299, originalPrice: 2199, rating: 4.5, reviews: 890, vendor: 'Royal Kitchen Store', delivery: 'Free delivery by Fri', emoji: '🍳', colorFrom: '#14B8A6', colorTo: '#2DD4BF' },
    { id: 11, name: 'Running Shoes', category: 'Footwear', price: 1199, originalPrice: 2399, rating: 4.4, reviews: 2201, vendor: 'Trendy Footwear', delivery: 'Free delivery by Tomorrow', emoji: '👟', colorFrom: '#0891B2', colorTo: '#22D3EE' },
    { id: 12, name: 'Leather Sling Bag', category: 'Bags', price: 799, originalPrice: 1599, rating: 4.3, reviews: 431, vendor: 'The Gift Gallery', delivery: 'Delivery in 3-5 days', emoji: '👜', colorFrom: '#BE185D', colorTo: '#EC4899' },
    { id: 13, name: 'Cricket Bat - Kashmir Willow', category: 'Sports', price: 899, originalPrice: 1499, rating: 4.5, reviews: 320, vendor: 'Bharat Sports Corner', delivery: 'Delivery in 4-6 days', emoji: '🏏', colorFrom: '#0EA5E9', colorTo: '#38BDF8' },
    { id: 14, name: 'Best Seller Novel Bundle', category: 'Books', price: 599, originalPrice: 999, rating: 4.7, reviews: 1543, vendor: 'Classic Book Point', delivery: 'Free delivery by Tomorrow', emoji: '📚', colorFrom: '#8B5CF6', colorTo: '#A78BFA' },
    { id: 15, name: 'Remote Control Car Toy', category: 'Toys', price: 699, originalPrice: 1399, rating: 4.4, reviews: 876, vendor: 'Kids Kingdom Store', delivery: 'Delivery in 2-4 days', emoji: '🚗', colorFrom: '#FB923C', colorTo: '#FDBA74' },
    { id: 16, name: 'Notebook Combo Pack (5pc)', category: 'Stationery', price: 249, originalPrice: 399, rating: 4.3, reviews: 654, vendor: 'Campus Stationery', delivery: 'Free delivery by Tomorrow', emoji: '📓', colorFrom: '#65A30D', colorTo: '#A3E635' },
    { id: 17, name: 'Herbal Face Wash', category: 'Beauty', price: 249, originalPrice: 449, rating: 4.5, reviews: 1990, vendor: 'Green Basket Organics', delivery: 'Free delivery by Tomorrow', emoji: '🧴', colorFrom: '#F43F5E', colorTo: '#FB7185' },
    { id: 18, name: 'Terracotta Handicraft Vase', category: 'Handicrafts', price: 549, originalPrice: 999, rating: 4.6, reviews: 289, vendor: 'Odisha Craft House', delivery: 'Delivery in 5-7 days', emoji: '🏺', colorFrom: '#DC2626', colorTo: '#F87171' },
    { id: 19, name: 'Wireless Mouse', category: 'Electronics', price: 349, originalPrice: 699, rating: 4.3, reviews: 3300, vendor: 'Digital Duniya', delivery: 'Free delivery by Tomorrow', emoji: '🖱️', colorFrom: '#7C3AED', colorTo: '#A855F7' },
    { id: 20, name: 'Cotton Bedsheet Set', category: 'Home & Living', price: 749, originalPrice: 1499, rating: 4.4, reviews: 1120, vendor: 'Bharat Home Store', delivery: 'Delivery in 3-5 days', emoji: '🛏️', colorFrom: '#F59E0B', colorTo: '#FBBF24' },
    { id: 21, name: 'Mobile Back Cover Combo', category: 'Mobile Accessories', price: 199, originalPrice: 499, rating: 4.2, reviews: 2870, vendor: 'Mobile Mania', delivery: 'Free delivery by Tomorrow', emoji: '📲', colorFrom: '#6366F1', colorTo: '#818CF8' },
    { id: 22, name: 'Palm Leaf Painting - Odisha Art', category: 'Handicrafts', price: 1499, originalPrice: 2599, rating: 4.9, reviews: 145, vendor: 'Shree Jagannath Crafts', delivery: 'Delivery in 5-7 days', emoji: '🎨', colorFrom: '#DC2626', colorTo: '#F87171', isNew: true },
    { id: 23, name: "Men's Formal Trousers", category: 'Fashion', price: 999, originalPrice: 1899, rating: 4.3, reviews: 765, vendor: 'Urban Style India', delivery: 'Delivery in 3-5 days', emoji: '👖', colorFrom: '#EC4899', colorTo: '#F472B6' },
    { id: 24, name: 'Gold Plated Necklace Set', category: 'Jewellery', price: 1299, originalPrice: 2499, rating: 4.7, reviews: 456, vendor: 'Maa Tarini Collections', delivery: 'Delivery in 3-5 days', emoji: '📿', colorFrom: '#EAB308', colorTo: '#FDE047' },
    { id: 25, name: 'Bluetooth Party Speaker', category: 'Electronics', price: 1999, originalPrice: 3999, rating: 4.5, reviews: 1980, vendor: 'SmartTech Bazaar', delivery: 'Free delivery by Tomorrow', emoji: '🔊', colorFrom: '#7C3AED', colorTo: '#A855F7', isNew: true },
    { id: 26, name: 'Basmati Rice Premium 10kg', category: 'Grocery', price: 899, originalPrice: 1199, rating: 4.6, reviews: 1230, vendor: 'Shree Ganesh Traders', delivery: 'Free delivery by Tomorrow', emoji: '🍚', colorFrom: '#65A30D', colorTo: '#A3E635' },
    { id: 27, name: 'Kids Puzzle Learning Set', category: 'Toys', price: 349, originalPrice: 699, rating: 4.5, reviews: 543, vendor: 'Kids Kingdom Store', delivery: 'Delivery in 2-4 days', emoji: '🧩', colorFrom: '#FB923C', colorTo: '#FDBA74' },
    { id: 28, name: 'Yoga Mat Anti-Slip', category: 'Sports', price: 499, originalPrice: 999, rating: 4.4, reviews: 1102, vendor: 'Bharat Sports Corner', delivery: 'Free delivery by Fri', emoji: '🧘', colorFrom: '#0EA5E9', colorTo: '#38BDF8' },
    { id: 29, name: "Women's Handbag - Tote Style", category: 'Bags', price: 899, originalPrice: 1799, rating: 4.4, reviews: 678, vendor: 'The Gift Gallery', delivery: 'Delivery in 3-5 days', emoji: '👛', colorFrom: '#BE185D', colorTo: '#EC4899' },
    { id: 30, name: 'Sports Sneakers', category: 'Footwear', price: 1399, originalPrice: 2799, rating: 4.5, reviews: 1876, vendor: 'Trendy Footwear', delivery: 'Free delivery by Tomorrow', emoji: '👟', colorFrom: '#0891B2', colorTo: '#22D3EE' },
    { id: 31, name: 'Fantasy Fiction Book Set', category: 'Books', price: 799, originalPrice: 1299, rating: 4.6, reviews: 320, vendor: 'Classic Book Point', delivery: 'Free delivery by Tomorrow', emoji: '📖', colorFrom: '#8B5CF6', colorTo: '#A78BFA' },
    { id: 32, name: 'Kitchen Knife Set', category: 'Kitchen', price: 649, originalPrice: 1299, rating: 4.3, reviews: 543, vendor: 'Royal Kitchen Store', delivery: 'Delivery in 3-5 days', emoji: '🔪', colorFrom: '#14B8A6', colorTo: '#2DD4BF' },
    { id: 33, name: 'Gel Pens Pack (10pc)', category: 'Stationery', price: 99, originalPrice: 199, rating: 4.2, reviews: 998, vendor: 'Campus Stationery', delivery: 'Free delivery by Tomorrow', emoji: '🖊️', colorFrom: '#65A30D', colorTo: '#A3E635' },
    { id: 34, name: 'Herbal Hair Oil', category: 'Beauty', price: 199, originalPrice: 349, rating: 4.4, reviews: 2540, vendor: 'Green Basket Organics', delivery: 'Free delivery by Tomorrow', emoji: '💆', colorFrom: '#F43F5E', colorTo: '#FB7185' },
    { id: 35, name: 'Brass Diya Set - Puja Essentials', category: 'Handicrafts', price: 349, originalPrice: 599, rating: 4.7, reviews: 456, vendor: 'Krishna Handicrafts', delivery: 'Delivery in 4-6 days', emoji: '🪔', colorFrom: '#DC2626', colorTo: '#F87171' },
    { id: 36, name: 'Laptop Backpack Waterproof', category: 'Bags', price: 999, originalPrice: 1999, rating: 4.5, reviews: 1432, vendor: 'Urban Style India', delivery: 'Free delivery by Tomorrow', emoji: '🎒', colorFrom: '#BE185D', colorTo: '#EC4899' },
    { id: 37, name: '4K Smart TV Stick', category: 'Electronics', price: 2499, originalPrice: 4499, rating: 4.6, reviews: 3765, vendor: 'Sunrise Electronics', delivery: 'Free delivery by Tomorrow', emoji: '📺', colorFrom: '#7C3AED', colorTo: '#A855F7', isNew: true },
    { id: 38, name: "Women's Ethnic Palazzo Set", category: 'Fashion', price: 649, originalPrice: 1299, rating: 4.3, reviews: 567, vendor: 'Desi Fashion Point', delivery: 'Delivery in 3-5 days', emoji: '👗', colorFrom: '#EC4899', colorTo: '#F472B6' },
    { id: 39, name: 'Table Lamp - Wooden Base', category: 'Home & Living', price: 599, originalPrice: 1099, rating: 4.5, reviews: 342, vendor: 'Modern Living Hub', delivery: 'Delivery in 3-5 days', emoji: '🪔', colorFrom: '#F59E0B', colorTo: '#FBBF24' },
    { id: 40, name: 'Phone Charging Cable 3-in-1', category: 'Mobile Accessories', price: 149, originalPrice: 349, rating: 4.2, reviews: 4321, vendor: 'New India Mobiles', delivery: 'Free delivery by Tomorrow', emoji: '🔌', colorFrom: '#6366F1', colorTo: '#818CF8' },
    { id: 41, name: 'Fresh Vegetables Combo Pack', category: 'Grocery', price: 299, originalPrice: 399, rating: 4.5, reviews: 876, vendor: 'FreshKart Foods', delivery: 'Free delivery Today', emoji: '🥦', colorFrom: '#65A30D', colorTo: '#A3E635' },
    { id: 42, name: 'Building Blocks Set for Kids', category: 'Toys', price: 549, originalPrice: 999, rating: 4.6, reviews: 654, vendor: 'Kids Kingdom Store', delivery: 'Delivery in 2-4 days', emoji: '🧱', colorFrom: '#FB923C', colorTo: '#FDBA74' },
    { id: 43, name: 'Pearl Drop Earrings', category: 'Jewellery', price: 349, originalPrice: 699, rating: 4.6, reviews: 234, vendor: 'Elegant Jewellery House', delivery: 'Delivery in 3-5 days', emoji: '👂', colorFrom: '#EAB308', colorTo: '#FDE047' },
    { id: 44, name: 'Badminton Racket Set', category: 'Sports', price: 799, originalPrice: 1599, rating: 4.4, reviews: 543, vendor: 'Bharat Sports Corner', delivery: 'Free delivery by Fri', emoji: '🏸', colorFrom: '#0EA5E9', colorTo: '#38BDF8' },
    { id: 45, name: 'Handwoven Cane Basket', category: 'Handicrafts', price: 449, originalPrice: 799, rating: 4.7, reviews: 187, vendor: 'Odisha Craft House', delivery: 'Delivery in 5-7 days', emoji: '🧺', colorFrom: '#DC2626', colorTo: '#F87171' },
    { id: 46, name: 'Wireless Earbuds Pro', category: 'Electronics', price: 1799, originalPrice: 3499, rating: 4.5, reviews: 5210, vendor: 'The Gadget Garage', delivery: 'Free delivery by Tomorrow', emoji: '🎧', colorFrom: '#7C3AED', colorTo: '#A855F7', isNew: true },
    { id: 47, name: 'Ceramic Dinner Set (18pc)', category: 'Kitchen', price: 1499, originalPrice: 2699, rating: 4.5, reviews: 432, vendor: 'Royal Kitchen Store', delivery: 'Delivery in 4-6 days', emoji: '🍽️', colorFrom: '#14B8A6', colorTo: '#2DD4BF' },
    { id: 48, name: 'Kids Story Book Collection', category: 'Books', price: 449, originalPrice: 899, rating: 4.7, reviews: 654, vendor: 'Classic Book Point', delivery: 'Free delivery by Tomorrow', emoji: '📕', colorFrom: '#8B5CF6', colorTo: '#A78BFA' }
  ];

  /* ---------------- PROMO BANNERS ---------------- */
  banners: Banner[] = [
    { title: 'Big Electronics Sale', subtitle: 'Up to 70% OFF', emoji: '⚡', colorFrom: '#7C3AED', colorTo: '#4C1D95' },
    { title: 'Festive Fashion Week', subtitle: 'Starting from ₹299', emoji: '🎉', colorFrom: '#EC4899', colorTo: '#BE185D' },
    { title: 'Made in Odisha', subtitle: 'Authentic Handcrafted Products', emoji: '🎨', colorFrom: '#DC2626', colorTo: '#991B1B' },
    { title: 'Fresh Grocery Deals', subtitle: 'Save More Every Day', emoji: '🥦', colorFrom: '#16A34A', colorTo: '#166534' }
  ];

  /* ---------------- TRUST SECTION ---------------- */
  trustPoints = [
    { icon: '✅', title: 'Verified Sellers', desc: 'Every vendor checked & approved' },
    { icon: '🔒', title: 'Secure Payments', desc: '100% safe & encrypted transactions' },
    { icon: '↩️', title: 'Easy Returns', desc: 'Hassle-free 7 day return policy' },
    { icon: '🚚', title: 'Fast Delivery', desc: 'Get your orders in record time' },
    { icon: '🎧', title: 'Customer Support', desc: 'Here for you round the clock' },
    { icon: '🛍️', title: 'Thousands of Products', desc: 'From sellers across India' }
  ];

  /* ---------------- HOW IT WORKS ---------------- */
  howItWorks = [
    { icon: '🔍', title: 'Browse & Discover', desc: 'Explore thousands of products from sellers across India, no login needed.' },
    { icon: '🛒', title: 'Add to Cart', desc: 'Found something you love? Add it to your cart in one tap.' },
    { icon: '🔐', title: 'Quick Login', desc: 'Sign in only when you are ready to buy. Fast, safe and simple.' },
    { icon: '📦', title: 'Sit Back & Relax', desc: 'Your order ships straight from the seller to your doorstep.' }
  ];

  /* ---------------- MARKETPLACE JOKES 😄 ---------------- */
  jokes = [
    '🛍️ Why did the shopper bring a ladder to Bazario? To reach the highest discounts! 😄',
    '📦 My wallet said "please stop", my cart said "one more item" — Bazario problems. 😅',
    '🚚 Bazario delivery is so fast, even my doubts about buying it arrive late! 🤣',
    '💳 Add to Cart is my cardio. I do it at least 50 times a day. 🏃‍♂️🛒',
    '🎉 Why did the vendor join Bazario? Because business was "bazaar-ing" well already! 😂',
    '🛒 They say money can\'t buy happiness — clearly they never scrolled Bazario at 2 AM. 😴'
  ];

  currentJokeIndex = 0;

  /* ---------------- TESTIMONIALS ---------------- */
  testimonials = [
    { name: 'Priya Sharma', location: 'Bhubaneswar', avatar: '👩', rating: 5, text: 'Bazario has literally every vendor I need in one place. Ordered a Sambalpuri saree and it arrived beautifully packed!' },
    { name: 'Arjun Mehta', location: 'Pune', avatar: '🧑', rating: 5, text: 'Found the cheapest wireless earbuds here, way cheaper than other apps. The login-only-at-checkout thing is genius.' },
    { name: 'Sneha Patel', location: 'Ahmedabad', avatar: '👩‍🦱', rating: 4, text: 'Love browsing without being forced to sign up. Filters make it super easy to find exactly what I want.' },
    { name: 'Rohit Nair', location: 'Kochi', avatar: '🧔', rating: 5, text: 'The vendor variety is insane, 35+ sellers and counting. My go-to for gifting handicrafts now.' },
    { name: 'Ananya Das', location: 'Kolkata', avatar: '👩‍🦰', rating: 5, text: 'Fast delivery, easy returns, and that little "added to cart" toast makes me smile every time. 💜' }
  ];

  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkLoginState();
      const savedCart = localStorage.getItem('bazario_cart');
      if (savedCart) {
        try {
          this.cartItems = JSON.parse(savedCart);
          this.cartCount = this.cartItems.length;
        } catch {
          this.cartItems = [];
        }
      }
      setInterval(() => this.nextJoke(), 4500);
    }
  }

  nextJoke(): void {
    this.currentJokeIndex = (this.currentJokeIndex + 1) % this.jokes.length;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 20;
    }
  }

  checkLoginState(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const loggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('user');
    this.isLoggedIn = loggedIn === 'true';
    if (this.isLoggedIn && user) {
      try {
        const parsed = JSON.parse(user);
        this.userName = parsed.name || parsed.fullName || 'Shopper';
      } catch {
        this.userName = 'Shopper';
      }
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
    }
    this.isLoggedIn = false;
    this.userName = '';
    this.fireToast('You have been logged out 👋');
  }

  /* ---------------- SEARCH / FILTER / SORT ---------------- */
  get filteredProducts(): Product[] {
    let list = [...this.products];
    const term = this.searchTerm.trim().toLowerCase();

    if (term) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.vendor.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory !== 'All') {
      list = list.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedVendor !== 'All') {
      list = list.filter(p => p.vendor === this.selectedVendor);
    }

    list = list.filter(p => p.price >= this.minPrice && p.price <= this.maxPrice);
    list = list.filter(p => p.rating >= this.minRating);
    list = list.filter(p => this.getDiscount(p) >= this.minDiscount);

    switch (this.sortBy) {
      case 'price-low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        list.sort((a, b) => b.reviews - a.reviews);
    }

    return list;
  }

  getDiscount(p: Product): number {
    return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  }

  applyTag(tag: string): void {
    this.searchTerm = tag.replace(/^[^\w]+/, '').trim();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }

  clearFilters(): void {
    this.selectedCategory = 'All';
    this.selectedVendor = 'All';
    this.minPrice = 0;
    this.maxPrice = 5000;
    this.minRating = 0;
    this.minDiscount = 0;
    this.sortBy = 'popularity';
  }

  selectCategory(name: string): void {
    this.selectedCategory = name;
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------------- CART / LOGIN ---------------- */
  addToCart(product: Product): void {
    if (!this.isLoggedIn) {
      this.showLoginModal = true;
      return;
    }
    this.cartItems.push(product);
    this.cartCount = this.cartItems.length;
    localStorage.setItem('bazario_cart', JSON.stringify(this.cartItems));
    this.fireToast('Product added to cart ✓');
  }

  buyNow(product: Product): void {
    if (!this.isLoggedIn) {
      this.showLoginModal = true;
      return;
    }
    this.addToCart(product);
    this.router.navigate(['/customer-dashboard']);
  }

  goToLogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/login']);
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  fireToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2600);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  trackByProduct(index: number, item: Product): number {
    return item.id;
  }

  trackByVendor(index: number, item: Vendor): number {
    return item.id;
  }

  get uniqueVendorNames(): string[] {
    return ['All', ...Array.from(new Set(this.vendors.map(v => v.name)))];
  }

  get categoryNames(): string[] {
    return ['All', ...this.categories.map(c => c.name)];
  }

}
