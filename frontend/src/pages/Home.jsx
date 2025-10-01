import React, { useEffect, useState } from "react";
import "./Home.css";
import "../components/Header.css";
import Header from "../components/Header.jsx";

const apiView = "https://cube-backend-service.onrender.com/api/products/view";
const apiGetImage = "https://cube-backend-service.onrender.com/api/products/getImage";

const categories = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const daysInWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weeksInMonth = ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"];

const Home = () => {
  const [hoveredSalesIdx, setHoveredSalesIdx] = useState(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [topSellings, setTopSellings] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [revenueProducts, setRevenueProducts] = useState([]);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [currentMonthSales, setCurrentMonthSales] = useState(0);
  const [activeTab, setActiveTab] = useState("Monthly");
  const [tabCategories, setTabCategories] = useState(categories);

  const fetchImageUrl = async (imageId) => {
    try {
      const response = await fetch(apiGetImage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      if (!response.ok) throw new Error("Failed to fetch product image URL");
      const data = await response.json();
      return data.signedUrl;
    } catch (err) {
      return "";
    }
  };

  const aggregateSalesData = (productsArray, tab) => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    let dataPoints = [];

    if (tab === "Daily") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      dataPoints = daysInWeek.map((day, i) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        const total = productsArray.reduce((acc, p) => {
          const pDate = new Date(p.createdAt || p.updatedAt || Date.now());
          if (
            pDate.getDate() === dayDate.getDate() &&
            pDate.getMonth() === dayDate.getMonth() &&
            pDate.getFullYear() === dayDate.getFullYear()
          ) {
            return acc + (p.income || 0);
          }
          return acc;
        }, 0);
        return total;
      });
      setTabCategories(daysInWeek);
    } else if (tab === "Weekly") {
      dataPoints = weeksInMonth.map((weekLabel, i) => {
        const weekStart = new Date(thisYear, thisMonth, i * 7 + 1, 0, 0, 0, 0);
        const weekEnd = new Date(thisYear, thisMonth, (i + 1) * 7, 23, 59, 59, 999);

        const total = productsArray.reduce((acc, p) => {
          const pDate = new Date(p.createdAt || p.updatedAt || Date.now());
          if (
            pDate >= weekStart &&
            pDate <= weekEnd &&
            pDate.getFullYear() === thisYear &&
            pDate.getMonth() === thisMonth
          ) {
            return acc + (p.income || 0);
          }
          return acc;
        }, 0);
        return total;
      });
      setTabCategories(weeksInMonth);
    } else if (tab === "Monthly") {
      dataPoints = categories.map((month, i) => {
        const total = productsArray.reduce((acc, p) => {
          const pDate = new Date(p.createdAt || p.updatedAt || Date.now());
          if (pDate.getFullYear() === thisYear && pDate.getMonth() === i) {
            return acc + (p.income || 0);
          }
          return acc;
        }, 0);
        return total;
      });
      setTabCategories(categories);
    } else if (tab === "Yearly") {
      const years = [];
      for (let i = 4; i >= 0; i--) {
        years.push(thisYear - i);
      }
      dataPoints = years.map(year => {
        const total = productsArray.reduce((acc, p) => {
          const pDate = new Date(p.createdAt || p.updatedAt || Date.now());
          if (pDate.getFullYear() === year) {
            return acc + (p.income || 0);
          }
          return acc;
        }, 0);
        return total;
      });
      setTabCategories(years.map(String));
    }
    return dataPoints;
  };

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const response = await fetch(apiView, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`API response error: ${response.statusText}`);
        const data = await response.json();

        if (!data.data || typeof data.data !== "object") {
          throw new Error("Invalid data structure received from API");
        }

        const productsArray = Object.values(data.data);
        const imageIdSet = new Set(productsArray.map(p => p.image).filter(Boolean));
        const urlsMapEntries = await Promise.all(
          Array.from(imageIdSet).map(async (imageId) => [imageId, await fetchImageUrl(imageId)])
        );
        const urlsMap = Object.fromEntries(urlsMapEntries);
        setImageUrls(urlsMap);

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        let earningsSum = 0;
        let currentMonthSaleCount = 0;

        productsArray.forEach(product => {
          const createdAt = new Date(product.createdAt || product.updatedAt || Date.now());
          if (
            createdAt.getMonth() === thisMonth &&
            createdAt.getFullYear() === thisYear
          ) {
            earningsSum += product.income || 0;
            currentMonthSaleCount += product.sales || 0;
          }
        });

        const sellings = productsArray
          .sort((a, b) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 5)
          .map(p => ({
            name: p.name,
            value: p.sales || 0,
            img: urlsMap[p.image] || "",
          }));

        const rated = sellings
          .slice()
          .sort((a, b) => (b.value) - (a.value))
          .slice(0, 5)
          .map(p => ({
            name: p.name,
            type: "",
            rating: Math.floor(Math.random() * 2) + 4 + 0.0,
            price: productsArray.find(prod => prod.name === p.name)?.price || 0,
            img: p.img || "",
          }));

        const revenue = productsArray
          .sort((a, b) => (b.income || 0) - (a.income || 0))
          .slice(0, 5)
          .map(p => ({
            id: p._id || p.name,
            name: p.name,
            value: p.income || 0,
            quantity: p.quantity || 0,
            img: urlsMap[p.image] || "",
          }));

        setTopSellings(sellings);
        setTopRated(rated);
        setRevenueProducts(revenue);
        setTotalEarnings(earningsSum);
        setCurrentMonthSales(currentMonthSaleCount);

        const initialSalesData = aggregateSalesData(productsArray, 'Monthly');
        setSalesData(initialSalesData);

        setError(null);
      } catch (err) {
        setError("Failed to load product data. Please try again later.");
      }
    };
    fetchProductStats();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    fetchAndSetSales(tab);
  };

  const fetchAndSetSales = (tab) => {
    fetch(apiView, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.data || typeof data.data !== "object") throw new Error("Invalid data");
        const productsArray = Object.values(data.data);
        const updatedSalesData = aggregateSalesData(productsArray, tab);
        setSalesData(updatedSalesData);
      })
      .catch(() => {
        setError("Failed to load sales data for selected view");
      });
  };

  return (
    <div className="dashboard-bg">
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-top">
          <div className="dashboard-summary">
            <div className="dashboard-summary-block">
              <div className="dashboard-label">Total Earnings</div>
              <div className="dashboard-amount">₹ {totalEarnings}</div>
              <div className="dashboard-sales-label">Current Month Sales</div>
              <div className="dashboard-sales-amount">{currentMonthSales}</div>
            </div>
            <div className="dashboard-sales-graph">
              <div className="dashboard-sales-tabs">
                {["Daily", "Weekly", "Monthly", "Yearly"].map((tab) => (
                  <span
                    key={tab}
                    className={tab === activeTab ? "active-tab" : ""}
                    onClick={() => handleTabClick(tab)}
                    style={{ cursor: "pointer" }}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="dashboard-sales-title">View Sales</div>
              <div className="dashboard-chart">
                <svg width={30 + tabCategories.length * 52} height="150">
                  <polyline
                    fill="rgba(103,196,253,0.3)"
                    stroke="#45a9e3"
                    strokeWidth="3"
                    points={salesData.map((val, i) => `${30 + i * 52},${150 - val / 160}`).join(" ")}
                  />
                  {salesData.map((val, i) => (
                    <circle
                      key={`dot-${i}`}
                      cx={30 + i * 52}
                      cy={150 - val / 160}
                      r="8"
                      fill="transparent"
                      onMouseEnter={() => setHoveredSalesIdx(i)}
                      onMouseLeave={() => setHoveredSalesIdx(null)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                  {salesData.map((val, i) => (
                    hoveredSalesIdx === i && (
                      <text
                        key={`label-${i}`}
                        x={30 + i * 52}
                        y={150 - val / 160 - 10}
                        fontSize="14"
                        fontWeight="bold"
                        fill="#000"
                        textAnchor="middle"
                      >
                        ₹ {val}
                      </text>
                    )
                  ))}
                  {tabCategories.map((cat, i) => (
                    <text key={cat} x={30 + i * 52} y="148" fontSize="12" textAnchor="middle">
                      {cat}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-bottom">
          <div className="dashboard-bottom-left">
            <div className="dashboard-section-title">Top Sellings This Month</div>
            {error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="dashboard-bar-chart" style={{ position: "relative", height: "180px" }}>
                <svg width={40 + topSellings.length * 80} height="180">
                  {topSellings.map((item, i) => (
                    <g
                      key={item.name}
                      onMouseEnter={() => setHoveredBarIdx(i)}
                      onMouseLeave={() => setHoveredBarIdx(null)}
                      style={{ cursor: "pointer" }}
                    >
                      <rect
                        x={30 + i * 80}
                        y={150 - item.value / 2}
                        width="45"
                        height={item.value / 2}
                        fill={hoveredBarIdx === i ? "#1976d2ff" : "#2197f6"}
                        opacity={hoveredBarIdx === i ? 0.9 : 1}
                      />
                      <text
                        x={55 + i * 80}
                        y="170"
                        fontSize="12"
                        textAnchor="middle"
                        style={{ fontWeight: "bold" }}
                      >
                        {item.name}
                      </text>
                      {hoveredBarIdx === i && (
                        <text
                          x={50 + i * 80}
                          y={150 - item.value / 2 - 10}
                          fontSize="14"
                          fontWeight="bold"
                          fill="#000"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {item.value}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </div>

          <div className="dashboard-bottom-right">
            <div className="TopRatedItems">
              <div className="dashboard-section-title">Top Rated Items</div>
              {error ? (
                <div className="error-message">{error}</div>
              ) : (
                <ul className="top-rated-list">
                  {topRated.map((item, index) => (
                    <li className="top-rated-item" key={item.name + index}>
                      <div className="top-rated-details">
                        <div className="top-rated-div">
                          <img
                            src={item.img}
                            alt={`${item.name} product`}
                            className="top-rated-img"
                          />
                          <div className="top-rated-name">{item.name}</div>
                        </div>
                        <div>
                          <div className="top-rated-price">{item.price}</div>
                          <div className="top-rated-rating">{item.rating.toFixed(1)}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="Revenue">
              <div className="dashboard-section-title">Revenue by Product</div>
              {error ? (
                <div className="error-message">{error}</div>
              ) : (
                <ul className="revenue-list">
                  {revenueProducts.map((item) => (
                    <li className="revenue-item" key={item.id}>
                      <div className="revenue-name">{item.name}<br />({item.quantity})</div>
                      <div className="revenue-bar-bg">
                        <div
                          className="revenue-bar"
                          style={{ width: `${(item.value / (revenueProducts[0]?.value || 1)) * 100}%` }}
                          aria-label={`${item.name} revenue bar`}
                        />
                      </div>
                      <div className="revenue-value">{item.value}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
