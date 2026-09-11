import { Shield, QrCode, Wallet, History, Users } from "lucide-react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./home.css";

// Counter Component
export function Counter({ end, duration = 2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60); // 60 frames per sec
    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(counter);
      } else {
        setCount(Math.ceil(start));
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [end, duration]);

  return <span>{count}</span>;
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className="navbar navbar-expand-lg navbar-light shadow-sm sticky-top bg-white">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="navbar-brand fw-bold text-primary"
          >
            🍽️ College Food Cart
          </motion.h1>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
              <li className="nav-item"><a className="nav-link" href="#features">Features</a></li>
              <li className="nav-item"><a className="nav-link" href="#how">How It Works</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            </ul>
            <div className="d-flex">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="btn btn-dark me-2" onClick={() => navigate("/login")}>
                Login
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" onClick={() => navigate("/register")}>
                Register
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero d-flex align-items-center justify-content-center text-center">
        <div className="hero-overlay"></div>
        <div className="container position-relative">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            className="hero-title display-4 fw-bold text-white"
          >
            Cashless & Seamless Food Payments
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9 }}
            className="hero-subtitle lead text-light"
          >
            Pay for your canteen meals securely using QR-based wallets.  
            No cash, no queues, just convenience.
          </motion.p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about py-5">
        <div className="container text-center">
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="fw-bold mb-4"
          >
            About the System
          </motion.h3>
          <p className="text-muted mb-5">
            The <b>College Food Card System</b> is designed to make canteen
            payments digital, fast, and secure. Every student is issued a
            unique <b>QR code</b> linked to their wallet, ensuring safe,
            cashless transactions.
          </p>
          <div className="row g-4">
            <motion.div className="col-md-4">
              <div className="about-card blue-card">
                <Users size={40} />
                <h4>Student Friendly</h4>
                <p>Quick login, simple recharges, and instant payments.</p>
              </div>
            </motion.div>
            <motion.div className="col-md-4">
              <div className="about-card green-card">
                <Shield size={40} />
                <h4>Highly Secure</h4>
                <p>Each wallet is encrypted & QR codes are unique.</p>
              </div>
            </motion.div>
            <motion.div className="col-md-4">
              <div className="about-card orange-card">
                <History size={40} />
                <h4>Transparent Records</h4>
                <p>Every payment is logged for clarity.</p>
              </div>
            </motion.div>
          </div>

          {/* Counter Section */}
          <div className="row text-center g-4 my-4">
            <div className="col-md-4">
              <div className="stat-card">
                <h2><Counter end={1200} />+</h2>
                <p>Students Registered</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <h2><Counter end={3500} />+</h2>
                <p>Payments Processed</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <h2><Counter end={7500} />+</h2>
                <p>Transactions Completed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features py-5 bg-light">
        <div className="container text-center">
          <h3 className="fw-bold mb-5">Core Features</h3>
          <div className="row g-4">
            {[
              { icon: <QrCode size={40} />, title: "QR Code Payments", desc: "Pay seamlessly with unique student QR codes." },
              { icon: <Wallet size={40} />, title: "Wallet Management", desc: "Easily recharge and check your wallet balance." },
              { icon: <History size={40} />, title: "Transaction History", desc: "Track your food purchases anytime." },
              { icon: <Shield size={40} />, title: "Admin Control", desc: "Monitor, manage users, and ensure secure transactions." }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="col-md-6 col-lg-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="feature-card h-100">
                  {feature.icon}
                  <h4 className="mt-3">{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="how py-5">
        <div className="container text-center">
          <h3 className="fw-bold mb-5">How It Works</h3>
          <div className="row g-4">
            <motion.div className="col-md-4">
              <div className="how-step">
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Step 1" />
                <h4>1. Register</h4>
                <p>Create your account and get a unique QR code.</p>
              </div>
            </motion.div>
            <motion.div className="col-md-4">
              <div className="how-step">
                <img src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png" alt="Step 2" />
                <h4>2. Recharge Wallet</h4>
                <p>Add funds to your digital wallet easily online.</p>
              </div>
            </motion.div>
            <motion.div className="col-md-4">
              <div className="how-step">
                <img src="https://cdn-icons-png.flaticon.com/512/891/891462.png" alt="Step 3" />
                <h4>3. Pay with QR</h4>
                <p>Scan your QR code & enjoy food hassle-free!</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer text-center">
        <p>© {new Date().getFullYear()} College Food Card System</p>
        <p>Contact: foodcard@college.edu | Helpline: +91-9876543210</p>
        <div className="footer-icons">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Facebook" />
          <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" />
          <img src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png" alt="Instagram" />
        </div>
      </footer>
    </div>
  );
}
