import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import "./Items.css";

function useItemsData(api) {
  const [items, setItems] = useState({});
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(api + '/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error('Failed to fetch items');
      const json = await response.json();
      setItems(json.data || {});
    } catch (err) {
      setError(err.message);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, error, refetch: fetchData };
}

const Items = () => {
  const api  = "https://cube-backend-service.onrender.com/api/products";
  const { items, error, refetch } = useItemsData(api);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen1, setModalOpen1] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [name, setName] = useState('');
  const [modifiedPrice, setModifiedPrice] = useState('');

  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [variants, setVariants] = useState([{ quantity: '', price: '' }]);

  const openModal = (id) => {
    setSelectedId(id);
    setName(items[id].name);
    setModifiedPrice(items[id].price);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedId(null);
    setModalOpen(false);
    setName('');
    setModifiedPrice('');
  };

  const openModal1 = () => {
    setModalOpen1(true);
  };

  const closeModal1 = () => {
    setModalOpen1(false);
    setProductName('');
    setProductImage(null);
    setVariants([{ quantity: '', price: '' }]);
  };

  const handleProductNameChange = (e) => {
    setProductName(e.target.value);
  };

  const handleProductImageChange = (file) => {
    setProductImage(file);
  };

  const handleVariantChange = (index, key, value) => {
    const newVariants = [...variants];
    newVariants[index][key] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { quantity: '', price: '' }]);
  };

const handleAddItem = async () => {
  if (!productName || !productImage) {
    alert("Please fill product name and select an image");
    return;
  }
  for (let i = 0; i < variants.length; i++) {
    if (!variants[i].quantity || !variants[i].price) {
      alert("Please fill quantity and price for all variants");
      return;
    }
  }

  const formData = new FormData();
  formData.append("name", productName);
  formData.append("image", productImage);
  formData.append("variants", JSON.stringify(variants));

  const entries = {};
  for (let pair of formData.entries()) {
    entries[pair[0]] = pair[1];
  }
  console.log(entries);

  try {
    const response = await fetch(api + '/add', {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData.error);
      throw new Error(errorData.error || "Failed to add product");
    }
    closeModal1();
    // refetch();
  } catch (err) {
    console.log(err);
    alert(`Error: ${err.message}`);
  }
};


  const handleModifyProduct = async () => {
    if (!name || !modifiedPrice) {
      alert("Please fill all fields");
      return;
    }
    try {
      const response = await fetch(api + '/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedId,
          name,
          price: modifiedPrice
        })
      });
      if (!response.ok) throw new Error('Failed to update product');
      alert("Product updated successfully");
      closeModal();
      refetch();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  return (
    <div>
      <div className="item-container">
        <Header />
        <main className="item-main">
          <div className="item-content">
            <div className='item-head'>Items</div>
            {error && <div style={{ color: 'red', paddingLeft: '50px' }}>Error: {error}</div>}
            {!error && (
              <div className='item-data'>
                <table className="item-table">
                  <thead>
                    <tr>
                      <th>Item Id</th>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Sales This Month</th>
                      <th>Income</th>
                      <th>Price</th>
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(items).map((id, i) => (
                      <tr key={id}>
                        <td>{i + 1}</td>
                        <td>{items[id].name}</td>
                        <td>{items[id].quantity}</td>
                        <td>₹ {items[id].sales}</td>
                        <td>₹ {items[id].income}</td>
                        <td>₹ {items[id].price}</td>
                        <td>
                          <button className="items-view-btn" onClick={() => openModal(id)}>Change</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className='new-item'>
              <button className='new-item-btn' onClick={openModal1}>Add Item</button>
            </div>
          </div>
        </main>
      </div>


      {modalOpen && selectedId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>×</button>
            <h2 style={{ textAlign: "center", marginBottom: 16 }}>Details Change</h2>
            <div className='modal-data'>
              <div><b>Do you want to change the Name of the {items[selectedId].name}?</b></div>
              <div>
                <b>Enter New Name : </b>
                <input
                  type='text'
                  className='item-input'
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <b>Enter New Price : </b>
                <input
                  type='number'
                  className='item-input'
                  value={modifiedPrice}
                  onChange={e => setModifiedPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="btn-div">
              <button className="btn-style" onClick={handleModifyProduct}>Change</button>
            </div>
          </div>
        </div>
      )}


      {modalOpen1 && (
        <div className="modal-overlay">
          <div className="modal1-content">
            <button className="close-btn" onClick={closeModal1}>×</button>
            <h2 style={{ textAlign: "center", marginBottom: 16 }}>Add New Product</h2>
            <div className="two-col-grid">
              <div className="grid-col">
                <label>Image</label>
                <input
                  type="file"
                  onChange={e => handleProductImageChange(e.target.files[0])}
                  className="item-input1"
                />
                {variants.map((variant, idx) => (
                  <div key={idx}>
                    <label>Quantity</label><br />
                    <input
                      type='text'
                      placeholder="Ex : 50 gm"
                      className="item-input1"
                      value={variant.quantity}
                      onChange={e => handleVariantChange(idx, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="grid-col">
                <label>Product Name</label>
                <input
                  type='text'
                  placeholder='Ex : Curd'
                  className="item-input1"
                  value={productName}
                  onChange={handleProductNameChange}
                  required
                />
                {variants.map((variant, idx) => (
                  <div key={idx}>
                    <label>Price</label><br />
                    <input
                      type='number'
                      placeholder="Ex : 50"
                      className="item-input1"
                      value={variant.price}
                      onChange={e => handleVariantChange(idx, 'price', e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="btns-row">
              <button
                type="button"
                className="add-variant-btn btn-style"
                onClick={addVariant}
              >
                Add Variant
              </button>
              <button
                type="button"
                className="done-btn btn-style"
                onClick={handleAddItem}
                style={{ background: "#15c654" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;




// import React, { useState, useEffect, useCallback } from 'react';
// import Header from '../components/Header';
// import "./Items.css";

// function useItemsData(api) {
//   const [items, setItems] = useState({});
//   const [error, setError] = useState(null);

//   const fetchData = useCallback(async () => {
//     setError(null);
//     try {
//       const response = await fetch(api + '/view', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({})
//       });
//       if (!response.ok) throw new Error('Failed to fetch items');
//       const json = await response.json();
//       setItems(json.data || {});
//     } catch (err) {
//       setError(err.message);
//     }
//   }, [api]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return { items, error, refetch: fetchData };
// }

// const Items = () => {
//   const api = "https://cube-backend-service.onrender.com/api/products";
//   const { items, error, refetch } = useItemsData(api);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalOpen1, setModalOpen1] = useState(false);
//   const [selectedId, setSelectedId] = useState(null);
//   const [itemName, setItemName] = useState('');
//   const [price, setPrice] = useState('');
//   const [image, setImage] = useState(null);
//   const [name, setName] = useState('');
//   const [modifiedPrice, setModifiedPrice] = useState('');

//   const openModal = (id) => {
//     setSelectedId(id);
//     setName(items[id].name);
//     setModifiedPrice(items[id].price);
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setSelectedId(null);
//     setModalOpen(false);
//     setName('');
//     setModifiedPrice('');
//   };

//   const openModal1 = () => setModalOpen1(true);
//   const closeModal1 = () => {
//     setModalOpen1(false);
//     setItemName('');
//     setPrice('');
//     setImage(null);
//   };

//   const handleAddItem = async () => {
//     if (!itemName || !price || !image) {
//       alert("Please fill all fields and select an image");
//       return;
//     }
//     const formData = new FormData();
//     formData.append("name", itemName);
//     formData.append("price", price);
//     formData.append("image", image);
//     try {
//       const response = await fetch(api + '/add', {
//         method: "POST",
//         body: formData,
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to add product");
//       }
//       alert("Product Added Successfully");
//       closeModal1();
//       refetch();
//     } catch (err) {
//       alert(`Error: ${err.message}`);
//     }
//   };

//   const handleModifyProduct = async () => {
//     if (!name || !modifiedPrice) {
//       alert("Please fill all fields");
//       return;
//     }
//     try {
//       const response = await fetch(api + '/modify', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           productId: selectedId,
//           name,
//           price: modifiedPrice
//         })
//       });
//       if (!response.ok) throw new Error('Failed to update product');
//       alert("Product updated successfully");
//       closeModal();
//       refetch();
//     } catch (err) {
//       alert(`Error: ${err.message}`);
//     }
//   };

//   return (
//     <div>
//       <div className="item-container">
//         <Header />
//         <main className="item-main">
//           <div className="item-content">
//             <div className='item-head'>Items</div>
//             {error && <div style={{ color: 'red', paddingLeft: '50px' }}>Error: {error}</div>}
//             {!error && (
//               <div className='item-data'>
//                 <table className="item-table">
//                   <thead>
//                     <tr>
//                       <th>Item Id</th>
//                       <th>Item Name</th>
//                       <th>Sales This Month</th>
//                       <th>Income</th>
//                       <th>Price</th>
//                       <th>Edit</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {Object.keys(items).map((id, i) => (
//                       <tr key={id}>
//                         <td>{i + 1}</td>
//                         <td>{items[id].name}</td>
//                         <td>{items[id].sales}</td>
//                         <td>{items[id].income}</td>
//                         <td>{items[id].price}</td>
//                         <td>
//                           <button className="items-view-btn" onClick={() => openModal(id)}>Change</button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//             <div className='new-item'>
//               <button className='new-item-btn' onClick={openModal1}>Add Item</button>
//             </div>
//           </div>
//         </main>
//       </div>
//       {modalOpen && selectedId && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <button className="close-btn" onClick={closeModal}>×</button>
//             <h2 style={{ textAlign: "center", marginBottom: 16 }}>Details Change</h2>
//             <div className='modal-data'>
//               <div><b>Do you want to change the Name of the {items[selectedId].name}?</b></div>
//               <div>
//                 <b>Enter New Name : </b>
//                 <input
//                   type='text'
//                   className='item-input'
//                   value={name}
//                   onChange={e => setName(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <b>Enter New Price : </b>
//                 <input
//                   type='number'
//                   className='item-input'
//                   value={modifiedPrice}
//                   onChange={e => setModifiedPrice(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className="btn-div">
//               <button className="btn-style" onClick={handleModifyProduct}>Change</button>
//             </div>
//           </div>
//         </div>
//       )}
//       {modalOpen1 && (
//         <div className="modal-overlay">
//           <div className="modal1-content">
//             <button className="close-btn" onClick={closeModal1}>×</button>
//             <h2 style={{ textAlign: "center", marginBottom: 16 }}>Add New Item</h2>
//             <div className='modal1-data'>
//               <div><b>Do you want to add new item to the existing list?</b></div>
//               <div className='model1-div'>
//                 <b>Enter Name of the Item: </b>
//                 <input
//                   type='text'
//                   placeholder='Ex : Curd'
//                   className='item-input1'
//                   value={itemName}
//                   onChange={e => setItemName(e.target.value)}
//                 />
//               </div>
//               <div className='model1-div'>
//                 <b>Enter Price of the Item: </b>
//                 <input
//                   type='number'
//                   placeholder='Ex : 100'
//                   className='item-input1'
//                   value={price}
//                   onChange={e => setPrice(e.target.value)}
//                 />
//               </div>
//               <div className='model1-div'>
//                 <b>Select Image: </b>
//                 <input
//                   type='file'
//                   onChange={e => setImage(e.target.files[0])}
//                   accept="image/*"
//                 />
//               </div>
//             </div>
//             <div className="btn-div">
//               <button className="btn-style" onClick={handleAddItem}>Add Item</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Items;
