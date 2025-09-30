import React, { useState, useEffect } from "react";

const OrderStatus = ({ orders }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderList, setSelectedOrderList] = useState(null);
  const [franchises, setFranchises] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [dueInput, setDueInput] = useState("");
  const [isEditingDue, setIsEditingDue] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState(new Set());

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const response = await fetch(
          "https://cube-backend-service.onrender.com/api/franchise/getAccepted",
          { method: "POST" }
        );
        if (!response.ok) throw new Error("Failed to fetch franchises");
        const data = await response.json();
        setFranchises(data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchFranchises();
  }, []);

  const fetchOrderItems = async (itemsId) => {
    try {
      const response = await fetch('https://cube-backend-service.onrender.com/api/orders/getItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemsId }),
      });
      if (!response.ok) return;
      const itemsData = await response.json();
      setOrderItems(itemsData);
    } catch (error) {
      console.error(error.message);
    }
  };

  const getFranchiseById = (id) =>
    franchises.find((f) => f.phone === id) || {};

  const openModal = (order) => {
    setSelectedOrderList(order);
    fetchOrderItems(order.itemsId);
    setDueInput("");
    setIsEditingDue(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrderList(null);
    setOrderItems([]);
    setDueInput("");
    setIsEditingDue(false);
    setModalOpen(false);
  };

  const startEditingDue = () => {
    setDueInput(
      getFranchiseById(selectedOrderList.franchiseId).due?.toString() || ""
    );
    setIsEditingDue(true);
  };

  const cancelEditing = () => {
    setDueInput("");
    setIsEditingDue(false);
  };

  const updateDue = async () => {
    const franchiseId = getFranchiseById(selectedOrderList.franchiseId);
    const newDue = parseFloat(dueInput);
    if (isNaN(newDue)) {
      alert("Please enter a valid number");
      return;
    }
    try {
      const response = await fetch("https://cube-backend-service.onrender.com/api/franchise/updateDue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ franchiseId: franchiseId.phone, due: newDue }),
      });
      if (!response.ok) {
        alert("Failed to update due");
        return;
      }
      setFranchises(franchises.map(f => f.phone === franchiseId.phone ? { ...f, due: newDue } : f));
      setIsEditingDue(false);
      setDueInput("");
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      const response = await fetch("https://cube-backend-service.onrender.com/api/orders/delivered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({orderId }),
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

  return (
    <div className="orders-status-table-wrap">
      <table className="orders-status-table">
        <thead>
          <tr>
            <th>S. No</th>
            <th>Franchise Name</th>
            <th>Date</th>
            <th>Location</th>
            <th>Due</th>
            <th>Order List</th>
            <th>Order Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => {
            const franchise = getFranchiseById(order.franchiseId);
            const isDelivered = deliveredOrders.has(order._id) || order.delivered;
            return (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{franchise.name || "N/A"}</td>
                <td>{order.createdAt?.slice(0, 10) || ""}</td>
                <td>{franchise.location || order.location}</td>
                <td>
                  ₹{" "}
                  {franchise.due?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}
                </td>
                <td>
                  <button className="orders-view-btn" onClick={() => openModal(order)}>
                    View Order List
                  </button>
                </td>
                <td>
                  <button
                    className="orders-view-btn"
                    onClick={() => handleMarkAsDelivered(order.id)}
                    disabled={isDelivered}
                  >
                    {isDelivered ? "Delivered" : "Mark as Delivered"}</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    {!isEditingDue ? (
                      <button className="orders-view-btn" onClick={startEditingDue}>
                        Change Due
                      </button>
                    ) : (
                      <>
                        <input
                          type="number"
                          value={dueInput}
                          onChange={e => setDueInput(e.target.value)}
                          placeholder="Enter new due"
                          style={{ width: 250, height:40, marginRight: 10 }}
                        /> <br />
                        <br />
                        <button className="orders-view-btn" onClick={updateDue}>
                          Save
                        </button>&nbsp;&nbsp;
                        <button className="orders-view-btn" onClick={cancelEditing}>
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatus;
