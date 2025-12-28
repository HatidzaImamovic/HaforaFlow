import { useNavigate } from "react-router-dom"; 
import DateTime from "../components/DateTime";
import "../App.css";

export default function MainView() {
  const navigate = useNavigate(); // ← add this

  const handleClick = (type) => {
    if (type === "Restaurant") {
      navigate("/cafe"); // ← go to CafeView
    } else if (type === "Market") {
      navigate("/market"); // ← another page if you want
    } else if (type === "Kitchen") {
      navigate("/kitchen");
    }
    else if (type === "Manager") {
      navigate("/manager");
    }
  };

  return (
    <div className="pageWrap">
      <DateTime/>

      <div id="mainCard">
        <h1>Welcome!</h1>
        <div className="cardContainer">
          <div className="card" onClick={() => handleClick("Restaurant")}>
            <img src="..\restaurant.png" alt="Restaurant" />
            <h2>Restaurant</h2>
          </div>
          <div className="card" onClick={() => handleClick("Market")}>
            <img src="..\grocery-cart.png" alt="Supermarket" />
            <h2>Supermarket</h2>
          </div>
          <div className="card" onClick={() => handleClick("Kitchen")}>
            <img src="..\chef.png" alt="Kitchen" />
            <h2>Kitchen</h2>
          </div>
          <div className="card" onClick={() => handleClick("Manager")}>
            <img src="..\accountant.png" alt="Manager" />
            <h2>Manager</h2>
          </div>
        </div>
      </div>

      <footer className="footer">
        &copy; {new Date().getFullYear()} HaforaFlow
      </footer>
    </div>
  );
}
