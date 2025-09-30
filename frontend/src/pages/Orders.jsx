import React, { useState, useEffect } from "react";
import "./Orders.css";
import OrderList from "../components/OrderList";
import OrderStatus from "../components/OrderStatus";
import Header from "../components/Header";
import "../components/Header.css";

function useCompletedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('https://cube-backend-service.onrender.com/api/orders/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        const completedOrders = (data || []).filter(order => order.completed === false);
        setOrders(completedOrders);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return { orders, loading, error };
}

const Orders = () => {
  const [view, setView] = useState("list");
  const { orders, loading, error } = useCompletedOrders();

  return (
    <div>
      <div className="orders-bg">
        <Header />
        <div className="orders-content">
          <div className="orders-sidebar">
            <button
              className={view === "list" ? "orders-tab active" : "orders-tab"}
              onClick={() => setView("list")}
            >
              Order List
            </button>
            <button
              className={view === "status" ? "orders-tab active" : "orders-tab"}
              onClick={() => setView("status")}
            >
              Order Status
            </button>
          </div>
          <div className="orders-main">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div>Error: {error.message}</div>
            ) : view === "list" ? (
              orders.map((order, idx) => <OrderList key={idx} order={order} />)
            ) : (
              <OrderStatus orders={orders} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
