import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { 
  Container, Row, Col, Card, Button, Table, 
  Modal, Form, Alert, Badge, Nav, Tabs, Tab,
  InputGroup, Spinner
} from "react-bootstrap";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import './AdminDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboard() {
  const { adminId } = useParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  // Form states
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "student" });
  const [menuForm, setMenuForm] = useState({ name: "", price: "", category: "breakfast", imageUrl: "" });
  const [walletForm, setWalletForm] = useState({ amount: "", operation: "add" });

  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
    fetchOrders();
    fetchMenuItems();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/orders?limit=50");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/menu");
      const data = await res.json();
      if (res.ok) {
        setMenuItems(data);
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
    }
  };

  // User Management
  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userForm, password: "default123" }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("User added successfully!");
        setShowUserModal(false);
        setUserForm({ name: "", email: "", role: "student" });
        fetchUsers();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("User updated successfully!");
        setShowUserModal(false);
        fetchUsers();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("User deleted successfully!");
        fetchUsers();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const handleWalletUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}/wallet`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walletForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Wallet ${walletForm.operation === 'add' ? 'credited' : 'debited'} successfully!`);
        setShowWalletModal(false);
        setWalletForm({ amount: "", operation: "add" });
        fetchUsers();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to update wallet");
    } finally {
      setLoading(false);
    }
  };

  // Menu Management
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Menu item added successfully!");
        setShowMenuModal(false);
        setMenuForm({ name: "", price: "", category: "breakfast", imageUrl: "" });
        fetchMenuItems();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/menu/${selectedMenuItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Menu item updated successfully!");
        setShowMenuModal(false);
        fetchMenuItems();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to update menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/menu/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Menu item deleted successfully!");
        fetchMenuItems();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to delete menu item");
    }
  };

  // Modal handlers
  const openUserModal = (user = null) => {
    setSelectedUser(user);
    if (user) {
      setUserForm({ name: user.name, email: user.email, role: user.role });
    } else {
      setUserForm({ name: "", email: "", role: "student" });
    }
    setShowUserModal(true);
  };

  const openMenuModal = (item = null) => {
    setSelectedMenuItem(item);
    if (item) {
      setMenuForm({ 
        name: item.name, 
        price: item.price, 
        category: item.category, 
        imageUrl: item.imageUrl 
      });
    } else {
      setMenuForm({ name: "", price: "", category: "breakfast", imageUrl: "" });
    }
    setShowMenuModal(true);
  };

  const openWalletModal = (user) => {
    setSelectedUser(user);
    setWalletForm({ amount: "", operation: "add" });
    setShowWalletModal(true);
  };

  // Chart data preparation
  const orderTypeData = stats.orderTypeBreakdown ? [
    { name: 'Breakfast', value: stats.orderTypeBreakdown.breakfast },
    { name: 'Lunch', value: stats.orderTypeBreakdown.lunch },
    { name: 'Dinner', value: stats.orderTypeBreakdown.dinner }
  ] : [];

  const revenueData = [
    { name: 'Today', revenue: stats.stats?.todayRevenue || 0 },
    { name: 'Weekly', revenue: stats.stats?.weeklyRevenue || 0 },
    { name: 'Total', revenue: stats.stats?.totalRevenue || 0 }
  ];

  const handleLogout = () => {
  // Clear authentication data (if any stored)
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");

    // Redirect to login page
    navigate("/");
};

  return (
    <Container fluid className="admin-dashboard">
      {/* Header */}
      <Row className="admin-header py-3 mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">🍽️ FoodCard Admin Dashboard</h2>
              <p className="text-muted mb-0">Welcome, Admin! Manage your food ordering system</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <Button variant="outline-danger" onClick={handleLogout}>
                🚪 Logout
              </Button>
            </div>
          </div>

        </Col>
      </Row>

      {message && <Alert variant="success" onClose={() => setMessage("")} dismissible>{message}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

      {/* Navigation Tabs */}
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="dashboard" title="📊 Dashboard">
          <DashboardTab 
            stats={stats.stats} 
            orderTypeData={orderTypeData}
            revenueData={revenueData}
            orders={orders}
          />
        </Tab>
        <Tab eventKey="users" title="👥 Users">
          <UsersTab 
            users={users}
            loading={loading}
            onEditUser={openUserModal}
            onDeleteUser={handleDeleteUser}
            onWalletUpdate={openWalletModal}
            onAddUser={() => openUserModal()}
          />
        </Tab>
        <Tab eventKey="orders" title="📋 Orders">
          <OrdersTab orders={orders} />
        </Tab>
        <Tab eventKey="menu" title="🍕 Menu">
          <MenuTab 
            menuItems={menuItems}
            onEditItem={openMenuModal}
            onDeleteItem={handleDeleteMenuItem}
            onAddItem={() => openMenuModal()}
          />
        </Tab>
      </Tabs>

      {/* User Modal */}
      <UserModal
        show={showUserModal}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
        onHide={() => setShowUserModal(false)}
        user={selectedUser}
        form={userForm}
        setForm={setUserForm}
        onSubmit={selectedUser ? handleUpdateUser : handleAddUser}
        loading={loading}
      />

      {/* Menu Modal */}
      <MenuModal
        show={showMenuModal}
        onHide={() => setShowMenuModal(false)}
        item={selectedMenuItem}
        form={menuForm}
        setForm={setMenuForm}
        onSubmit={selectedMenuItem ? handleUpdateMenuItem : handleAddMenuItem}
        loading={loading}
      />

      {/* Wallet Modal */}
      <WalletModal
        show={showWalletModal}
        onHide={() => setShowWalletModal(false)}
        user={selectedUser}
        form={walletForm}
        setForm={setWalletForm}
        onSubmit={handleWalletUpdate}
        loading={loading}
      />
    </Container>
  );
}

// Dashboard Tab Component
const DashboardTab = ({ stats, orderTypeData, revenueData, orders }) => (
  <div className="dashboard-tab">
    {/* Stats Cards */}
    <Row className="g-4 mb-4">
      <Col md={3}>
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Total Students</h6>
                <h2 className="text-primary">{stats?.totalStudents || 0}</h2>
              </div>
              <div className="stat-icon">👥</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Today's Orders</h6>
                <h2 className="text-success">{stats?.todayOrders || 0}</h2>
              </div>
              <div className="stat-icon">📦</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Today's Revenue</h6>
                <h2 className="text-warning">₹{stats?.todayRevenue || 0}</h2>
              </div>
              <div className="stat-icon">💰</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="stat-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Menu Items</h6>
                <h2 className="text-info">{stats?.totalMenuItems || 0}</h2>
              </div>
              <div className="stat-icon">🍕</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {/* Charts */}
    <Row className="g-4">
      <Col md={6}>
        <Card className="chart-card">
          <Card.Header>
            <h5 className="mb-0">Order Distribution</h5>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="chart-card">
          <Card.Header>
            <h5 className="mb-0">Revenue Overview</h5>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    {/* Recent Orders */}
    <Row className="mt-4">
      <Col>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Recent Orders</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Student</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6)}</td>
                    <td>{order.studentId?.name}</td>
                    <td>
                      <Badge bg={
                        order.orderType === 'breakfast' ? 'warning' :
                        order.orderType === 'lunch' ? 'info' : 'secondary'
                      }>
                        {order.orderType}
                      </Badge>
                    </td>
                    <td>₹{order.totalAmount}</td>
                    <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </div>
);

// Users Tab Component
const UsersTab = ({ users, loading, onEditUser, onDeleteUser, onWalletUpdate, onAddUser }) => (
  <Card>
    <Card.Header className="d-flex justify-content-between align-items-center">
      <h5 className="mb-0">Student Management</h5>
      <Button variant="primary" onClick={onAddUser}>
        + Add Student
      </Button>
    </Card.Header>
    <Card.Body>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Wallet Balance</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <Badge bg={user.walletBalance > 0 ? "success" : "secondary"}>
                    ₹{user.walletBalance}
                  </Badge>
                </td>
                <td>
                  <Badge bg={user.role === "admin" ? "danger" : "primary"}>
                    {user.role}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => onEditUser(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2"
                    onClick={() => onWalletUpdate(user)}
                  >
                    Wallet
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDeleteUser(user._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card.Body>
  </Card>
);

// Orders Tab Component
const OrdersTab = ({ orders }) => (
  <Card>
    <Card.Header>
      <h5 className="mb-0">All Orders</h5>
    </Card.Header>
    <Card.Body>
      <Table responsive striped hover>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Student</th>
            <th>Type</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Date & Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id.slice(-6)}</td>
              <td>{order.studentId?.name}</td>
              <td>
                <Badge bg={
                  order.orderType === 'breakfast' ? 'warning' :
                  order.orderType === 'lunch' ? 'info' : 'secondary'
                }>
                  {order.orderType}
                </Badge>
              </td>
              <td>
                {order.items.map((item, index) => (
                  <span key={index} className="d-block">
                    {item.name} {item.quantity > 1 && `(${item.quantity})`}
                  </span>
                ))}
              </td>
              <td>₹{order.totalAmount}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>
                <Badge bg="success">{order.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

// Menu Tab Component
const MenuTab = ({ menuItems, onEditItem, onDeleteItem, onAddItem }) => (
  <div>
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Menu Management</h5>
        <Button variant="primary" onClick={onAddItem}>
          + Add Menu Item
        </Button>
      </Card.Header>
    </Card>

    <Row>
      {menuItems.map((item) => (
        <Col md={4} key={item._id} className="mb-4">
          <Card className="menu-item-card h-100">
            <Card.Img variant="top" src={item.imageUrl} className="menu-item-image" />
            <Card.Body>
              <Card.Title>{item.name}</Card.Title>
              <Card.Text>
                <strong>Price:</strong> ₹{item.price}<br/>
                <strong>Category:</strong> 
                <Badge bg={
                  item.category === 'breakfast' ? 'warning' :
                  item.category === 'lunch' ? 'info' : 'secondary'
                } className="ms-2">
                  {item.category}
                </Badge>
              </Card.Text>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onEditItem(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDeleteItem(item._id)}
                >
                  Delete
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </div>
);

// Modal Components
const UserModal = ({ show, onHide, user, form, setForm, onSubmit, loading }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>{user ? "Edit User" : "Add New User"}</Modal.Title>
    </Modal.Header>
    <Form onSubmit={onSubmit}>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : user ? "Update User" : "Add User"}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);

const MenuModal = ({ show, onHide, item, form, setForm, onSubmit, loading }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>{item ? "Edit Menu Item" : "Add Menu Item"}</Modal.Title>
    </Modal.Header>
    <Form onSubmit={onSubmit}>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Item Name</Form.Label>
          <Form.Control
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Price (₹)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Image URL</Form.Label>
          <Form.Control
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            required
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : item ? "Update Item" : "Add Item"}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);

const WalletModal = ({ show, onHide, user, form, setForm, onSubmit, loading }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Manage Wallet - {user?.name}</Modal.Title>
    </Modal.Header>
    <Form onSubmit={onSubmit}>
      <Modal.Body>
        <p>Current Balance: <strong>₹{user?.walletBalance}</strong></p>
        <Form.Group className="mb-3">
          <Form.Label>Operation</Form.Label>
          <Form.Select
            value={form.operation}
            onChange={(e) => setForm({ ...form, operation: e.target.value })}
          >
            <option value="add">Add Money</option>
            <option value="subtract">Deduct Money</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Amount (₹)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button 
          variant={form.operation === "add" ? "success" : "warning"} 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Processing..." : form.operation === "add" ? "Add Money" : "Deduct Money"}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);