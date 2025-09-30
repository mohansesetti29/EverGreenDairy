import React, { useState, useEffect } from "react";

function OrderList({ order }) {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorItems, setErrorItems] = useState(null);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveError, setReceiveError] = useState(null);
  const [received, setReceived] = useState(false);

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch('https://cube-backend-service.onrender.com/api/orders/getItems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemsId: order.itemsId }),
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const data = await response.json();
        setItems(data || []);
      } catch (error) {
        setErrorItems(error.message);
      } finally {
        setLoadingItems(false);
      }
    }
    if (order.itemsId) {
      fetchItems();
    } else {
      setLoadingItems(false);
      setItems([]);
    }
  }, [order.itemsId]);

  const handleReceiveClick = async () => {
    setReceiveLoading(true);
    setReceiveError(null);
    try {
      const response = await fetch('https://cube-backend-service.onrender.com/api/orders/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }
      setReceived(true);
    } catch (error) {
      setReceiveError(error.message);
    } finally {
      setReceiveLoading(false);
    }
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <div>
          <strong>Order</strong>
          <div className="order-meta">
            Franchise ID - {order.franchiseId} &nbsp; | &nbsp;Location - {order.location}
          </div>
        </div>
        <div className="order-date">{order.createdAt}</div>
      </div>

      {loadingItems && <div>Loading items...</div>}
      {errorItems && <div>Error loading items: {errorItems}</div>}

      {!loadingItems && !errorItems && (
        <table className="order-table">
          <thead>
            <tr>
              <th className="item-name">Item</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="3">No items found for this order.</td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx}>
                  <td className="item-name">{item.name} ({item.productQuantity})</td>
                  <td>{item.itemQuantity} Pcs</td>
                  <td>₹ {item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="order-total-row">
              <td colSpan={2}><strong>Total Price</strong></td>
              <td><strong>₹ {order.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </tfoot>
        </table>
      )}

      {receiveError && <div style={{color: "red"}}>Error: {receiveError}</div>}

      <button 
        className="receive-btn" 
        onClick={handleReceiveClick} 
        disabled={receiveLoading || received}
      >
        {received ? "Order Received" : (receiveLoading ? "Receiving..." : "Receive Order")}
      </button>
    </div>
  );
}

export default OrderList;
