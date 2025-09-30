import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './History.css';
import { useLocation } from 'react-router-dom';

const History = () => {
  const location = useLocation();
  const { franchise } = location.state || {};
  const franchiseData = franchise || {};

  const [orderItems, setOrderItems] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderList, setSelectedOrderList] = useState(null);

  useEffect(() => {
    if (franchiseData.phone) {
      fetch("https://cube-backend-service.onrender.com/api/orders/getFranchiseOrders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ franchiseId: franchiseData.phone }),
      })
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrderData(data);
          } else if (data && data.message) {
            console.warn(data.message);
            setOrderData([]);
          } else {
            setOrderData([]);
          }
        })
        .catch(err => {
          console.error('Fetch orders error:', err);
          setOrderData([]);
        });
    }
  }, [franchiseData.phone]);

  const fetchOrderItems = async (itemsId) => {
    try {
      const response = await fetch('https://cube-backend-service.onrender.com/api/orders/getItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemsId }),
      });
      if (!response.ok) return;
      const itemsData = await response.json() || [];
      setOrderItems(itemsData);
    } catch (error) {
      console.error(error.message);
      setOrderItems([]);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      const response = await fetch("https://cube-backend-service.onrender.com/api/orders/delivered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        alert("Failed to mark order as delivered");
        return;
      }
      setDeliveredOrders(prev => new Set(prev).add(orderId));
      alert("Order marked as delivered");
    } catch (error) {
      console.error("Error marking order as delivered:", error.message);
    }
  };

  const openModal = (order) => {
    setSelectedOrderList(order);
    fetchOrderItems(order.itemsId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrderList(null);
    setOrderItems([]);
    setModalOpen(false);
  };

  return (
    <>
      <Header />
      <div className="history-bg">
        <div className="history-details-box">
          <div className="history-details-row">
            <div className="history-details-col">
              <div><b>FranchesID</b> <span>:</span> <span className="history-value">{franchiseData.phone || 'N/A'}</span></div>
              <div><b>OwnName</b> <span>:</span> <span className="history-value">{franchiseData.name || 'N/A'}</span></div>
              <div><b>Joined Date</b> <span>:</span> <span className="history-value">{franchiseData.createdAt?.slice(0, 10) || "N/A"}</span></div>
              <div><b>Location</b> <span>:</span> <span className="history-value">{franchiseData.location || 'N/A'}</span></div>
            </div>
            <div className="history-details-col">
              <div><b>Due</b> <span>:</span> <span className="history-value">{franchiseData.due || '₹ 0.00'}</span></div>
              <div>
                <b>Total Orders (Lifetime)</b> <span>:</span>
                <span className="history-value">{franchiseData.totalOrders || 0}</span>
              </div>
              <div>
                <b>Total Sales (Lifetime)</b> <span>:</span>
                <span className="history-value">{franchiseData.totalEarnings || '₹ 0.00'}</span>
              </div>
            </div>
          </div>

          <div className="history-table-title">History</div>
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Franchise ID</th>
                  <th>Owner Name</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Amount</th>
                  <th>Order List</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {!Array.isArray(orderData) || orderData.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>No orders found</td></tr>
                ) : (
                  orderData.map((order, idx) => {
                    const isDelivered = deliveredOrders.has(order.id) || order.delivered;
                    return (
                      <tr key={idx}>
                        <td>{order.franchiseId || franchiseData.phone || 'N/A'}</td>
                        <td>{franchiseData.name || 'N/A'}</td>
                        <td>{order.createdAt?.slice(0, 10) || 'N/A'}</td>
                        <td>{order.location || 'N/A'}</td>
                        <td>{order.amount !== undefined ? `₹${order.amount}` : '₹0.00'}</td>
                        <td>
                          <button className="order-list-btn" onClick={() => openModal(order)}>View Order List</button>
                        </td>
                        <td>
                          <button
                            className="delivered-btn"
                            onClick={() => handleMarkAsDelivered(order.id)}
                            disabled={isDelivered}
                          >
                            {isDelivered ? "Delivered" : "Mark as Delivered"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && selectedOrderList && (
        <div className="orders-modal-overlay" onClick={closeModal}>
          <div className="orders-modal-content" onClick={e => e.stopPropagation()}>
            <button className="orders-close-btn" onClick={closeModal}>×</button>
            <h2 style={{ textAlign: "center", marginBottom: 16 }}>Order List</h2>
            <table className="orders-modal-table">
              <tbody>
                {orderItems.length > 0 ? (
                  orderItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="orders-modal-item">{item.name} ({item.productQuantity})</td>
                      <td className="orders-modal-colon">x</td>
                      <td className="orders-modal-qty">{item.itemQuantity}Pcs</td>
                      <td className="orders-modal-colon">:</td>
                      <td className="orders-modal-price">Rs.{item.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td>Loading items...</td></tr>
                )}
                <tr>
                  <td className="orders-modal-total-label" colSpan={3}>Total Amount</td>
                  <td className="orders-modal-colon">:</td>
                  <td className="orders-modal-total-val">Rs.{selectedOrderList.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default History;
