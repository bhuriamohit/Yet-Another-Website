import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Home.css";
import "./Autofill.css";

function Home() {
  const { home_data } = useParams();
  const [data, setData] = useState([]);
  const [email, setEmail] = useState("");
  const [sortBy, setSortBy] = useState("id"); // Default sorting by ID
  const [sortOrder, setSortOrder] = useState("desc"); // Default sorting order
  const [searchQuery, setSearchQuery] = useState(""); // State variable for search query
  const navigate = useNavigate();

  useEffect(() => {
    const getEmail = localStorage.getItem("email");
    setEmail(getEmail);

    const getApplicationId = async () => {
      try {
        const res = await fetch(
          "http://172.30.2.244:5006/getallApplicationIdForHome",
          {
            method: "POST",
            body: JSON.stringify({ email: getEmail }),
            headers: { "Content-Type": "application/json" },
          }
        );

        const data2 = await res.json();
        console.log(data2);
        const parsedData = data2.result.map((item) => {
          item[1] = JSON.parse(item[1]);
          return item;
        });

        // Sort the data initially based on default sorting criteria
        sortData(parsedData, sortBy, sortOrder);
        console.log(parsedData)
        setData(parsedData);
      } catch (error) {
        console.error("Error fetching application data:", error);
      }
    };

    getApplicationId();
  }, [sortBy, sortOrder]);

  const sortData = (data, sortBy, sortOrder) => {
    data.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "id":
          comparison = a[0] - b[0];
          break;
        case "date":
          comparison = new Date(a[1].user.date) - new Date(b[1].user.date);
          break;
        case "amount":
          comparison = a[1].user.amountClaimed - b[1].user.amountClaimed;
          break;
        default:
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });
  };

  const handleSortChange = (selectedSortBy) => {
    // If the same criteria is selected, toggle the order
    if (selectedSortBy === sortBy) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      // If a different criteria is selected, set it as the new sorting criteria
      setSortBy(selectedSortBy);
      setSortOrder("desc"); // Reset order to ascending
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  // Filter data based on search query
  const filteredData = data.filter((row) => {
    const searchString = searchQuery.toLowerCase();

    // Check if the search query matches any of the fields (ID, amount, or date)
    return (
      row[0].toString().toLowerCase().includes(searchString) || // ID
      row[1].user.amountClaimed
        .toString()
        .toLowerCase()
        .includes(searchString) || // Amount
      row[1].user.date.toLowerCase().includes(searchString) // Date
    );
  });

  return (
    <div style={{ display: "flex" }}>
      <div
        id="sidebar1"
        className="d-flex flex-column  flex-shrink-0 p-3 text-white"
      >
        <h2 className="text_center">Menu</h2>
        <br />
        <ul className="nav nav-pills flex-column mb-auto">
          <Link
            id="link_to_other_pages"
            to="/Home"
            style={{ textDecoration: "none" }}
          >
            <li className="nav-item">
              <a href="#" className="nav-link text-white active">
                <i className="fa fa-home"></i>
                <span className="ms-2 font_size_18">Home </span>
              </a>
            </li>
          </Link>

          <Link
            id="link_to_other_pages"
            to="/Autofill"
            style={{ textDecoration: "none" }}
          >
            <li>
              <a href="#" className="nav-link text-white">
                <i className="fa fa-first-order"></i>
                <span className="ms-2 font_size_18">Auto Fill</span>
              </a>
            </li>
          </Link>

          <Link
            id="link_to_other_pages"
            to="/Home/Home_verified_applications"
            style={{ textDecoration: "none" }}
          >
            <li>
              <a className="nav-link text-white" href="#">
                <i className="fa fa-first-order"></i>
                <span className="ms-2 font_size_18">Approved applications</span>
              </a>
            </li>
          </Link>

          <li onClick={handleLogout}>
            <a href="/" className="nav-link text-white">
              <i className="fa fa-bookmark"></i>
              <span className="ms-2 font_size_18">Logout</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="top-navbar">
          <div className="btns">
            <Link to="/Home/Instructions" className="btn">
              <div className="inst-button">Instructions</div>
            </Link>
            <Link to="/Page1" className="btn">
              <div className="apply-button">Apply for Reimbursement</div>
            </Link>
          </div>

          <div className="welcome">
            <div className="welcome-icon">
              <i className="fas fa-user-circle"></i>{" "}
              {/* Add margin to move the icon */}
            </div>

            <div className="welcome-text">
              <div className="name">Mohit</div>{" "}
              {/* Replace [Dummy Name] with "Mohit" */}
              <div className="email">
                <i className="fas fa-envelope"></i> {email}{" "}
                {/* You can use envelope icon for email */}
              </div>
            </div>
          </div>
        </div>
        <hr></hr>

        <div className="last-heading">
          <h4>Home</h4>
          {/* <h6>(applications which are yet to be approved by all authority people will appear here)</h6> */}
        </div>

        <div className="search-bar">
          {/* Search input field */}
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sort-options">
          {/* Sorting options UI */}
          <label htmlFor="sortOptions">Sort by:</label>
          <select
            id="sortOptions"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="id">ID</option>
            <option value="amount">Amount Claimed</option>
            <option value="date">Date of Submission</option>
          </select>
          <button onClick={() => handleSortChange(sortBy)}>
            {sortOrder === "desc" ? "Descending" : "Ascending"}
          </button>
        </div>

        <div className="application-list">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount Claimed</th>
                <th>Date of submission</th>
                <th>Pharmacist Status</th>
                <th>Medical Officer Status</th>
                <th>Account Section Status</th>
                <th>Registrar Status</th>
                <th>Action</th> {/* Added Action column */}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index}>
                  <td>{row[0]}</td>
                  <td>{row[1].user.amountClaimed}</td>
                  <td>{row[1].user.date}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                  <td>{row[4]}</td>
                  <td>{row[5]}</td>
                  <td>
                    <button
                      onClick={() => {
                        home_data === "Home"
                          ? navigate("/ShowApplication/" + row[0])
                          : navigate("/Home/ShowApplication/" + row[0]);
                      }}
                      className="btn btn-primary"
                    >
                      View Application
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Home;
