import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import "../components/Header.css";
import "./Franchises.css";

const Franchises = () => {
  const [franchiseData, setFranchiseData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [dueInput, setDueInput] = useState("");
  const [isEditingDue, setIsEditingDue] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const api = "https://cube-backend-service.onrender.com/api/franchise";
    fetch(api + "/getAccepted", { method: "POST" })
      .then(res => res.json())
      .then(data => setFranchiseData(data))
      .catch(err => console.error('Fetch error:', err));
  }, []);

  useEffect(() => {
    if (selectedFranchise?.phone) {
      fetch("https://cube-backend-service.onrender.com/api/orders/getFranchiseOrders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ franchiseId: selectedFranchise.phone }),
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrderData(data);
          } else {
            setOrderData([]);
          }
        })
        .catch(err => {
          console.error('Fetch franchise orders error:', err);
          setOrderData([]);
        });
    } else {
      setOrderData([]);
    }
  }, [selectedFranchise]);

  const openModal = (franchise) => {
    setSelectedFranchise(franchise);
    setDueInput(franchise.due?.toString() || "");
    setIsEditingDue(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedFranchise(null);
    setDueInput("");
    setIsEditingDue(false);
    setOrderData([]);
    setModalOpen(false);
  };

  const startEditingDue = () => {
    setDueInput(selectedFranchise.due?.toString() || "");
    setIsEditingDue(true);
  };

  const cancelEditing = () => {
    setDueInput(selectedFranchise.due?.toString() || "");
    setIsEditingDue(false);
  };

  const updateDue = async () => {
    const newDue = parseFloat(dueInput);
    if (isNaN(newDue)) {
      alert("Please enter a valid number");
      return;
    }
    try {
      const response = await fetch("https://cube-backend-service.onrender.com/api/franchise/updateDue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ franchiseId: selectedFranchise.phone, due: newDue }),
      });
      if (!response.ok) {
        alert("Failed to update due");
        return;
      }
      setFranchiseData(franchiseData.map(f => (f.phone === selectedFranchise.phone ? { ...f, due: newDue } : f)));
      setSelectedFranchise(prev => ({ ...prev, due: newDue }));
      setIsEditingDue(false);
      alert("Due updated successfully");
    } catch (error) {
      console.error(error.message);
    }
  };

  const {
    prevMonthSales,
    prevMonthOrders,
    thisMonthSales,
    thisMonthOrders
  } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    let prevSales = 0;
    let prevOrders = 0;
    let thisSales = 0;
    let thisOrders = 0;

    orderData.forEach(order => {
      const orderDateStr = order.createdAt || "";
      const orderDate = orderDateStr ? new Date(orderDateStr) : null;

      if (!orderDate) return;

      if (orderDate.getFullYear() === prevYear && orderDate.getMonth() === prevMonth) {
        prevSales += order.amount || 0;
        prevOrders += 1;
      } else if (orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth) {
        thisSales += order.amount || 0;
        thisOrders += 1;
      }
    });

    return {
      prevMonthSales: prevSales,
      prevMonthOrders: prevOrders,
      thisMonthSales: thisSales,
      thisMonthOrders: thisOrders,
    };
  }, [orderData]);

  const handleHistoryClick = () => {
    if (selectedFranchise) {
      closeModal();
      navigate('/history', { state: { franchise: selectedFranchise } });
    }
  };

  return (
    <div>
      <div className="franchise-container">
        <Header />
        <main className="franchise-main">
          <div className="franchise-content">
            <div className='franchise-head'>Franchises</div>
            <div className='franchise-data'>
              <table className="franchise-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Owner Name</th>
                    <th>Number</th>
                    <th>Location</th>
                    <th>Payment Due</th>
                    <th>View Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {franchiseData.map((f, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{f.name}</td>
                      <td>{f.phone}</td>
                      <td>{f.location}</td>
                      <td>₹ {f.due?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}</td>
                      <td>
                        <button className="view-btn" onClick={() => openModal(f)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {modalOpen && selectedFranchise && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>×</button>
            <h2 style={{ textAlign: "center", marginBottom: 16 }}>Sales</h2>
            <div className='modal-data'>
              <div><b>Previous Month Sales :</b> ₹{prevMonthSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              <div><b>Previous Month Orders :</b> {prevMonthOrders}</div>
              <div><b>This Month Sales :</b> ₹{thisMonthSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              <div><b>This Month Orders :</b> {thisMonthOrders}</div>
              <div>
                <b>Total Due Amount :</b> ₹ {selectedFranchise.due?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}</div>
              <div>
                <b>change Due :</b>{" "}
                {!isEditingDue ? (
                  <>₹ {selectedFranchise.due?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}</>
                ) : (
                  <input
                    type="number"
                    value={dueInput}
                    onChange={e => setDueInput(e.target.value)}
                    style={{ width: 150, height: 40, marginLeft: 8 }}
                    autoFocus
                  />
                )}
              </div>
            </div>
            <div className="btn-div" style={{ marginTop: 16 }}>
              <button className="btn-style1" onClick={handleHistoryClick} style={{ marginLeft: 16 }}>History</button>
              {!isEditingDue ? (
                <button className="btn-style2" onClick={startEditingDue}>Change Due</button>
              ) : (
                <>
                  <button className="btn-style2" onClick={updateDue}>Save</button>
                  <button className="btn-style2" onClick={cancelEditing} style={{ marginLeft: 8 }}>Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Franchises;
