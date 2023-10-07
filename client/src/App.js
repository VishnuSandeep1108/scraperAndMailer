import React, { useState } from "react";
import io from "socket.io-client";

import "./App.css";

const socket = io.connect("http://localhost:8000",{ transports : ['websocket'] });

function App() {

  const [email, updateEmail] = useState("");

  function handleClick()
  {
    const selectedOptions = Array.from(document.querySelectorAll('input[name="selectedOptions"]:checked')).map(checkbox => checkbox.value);

    socket.emit("newUser", {email, selectedOptions});
  }

  return (
    <div className="App">
      <div className="left">
        <h1>NITA Mail Man</h1>
        <p>As I would like to call it...! Feel free to call it as U wish</p>

        <h3>Key functions: </h3>
        <ul>
          <li>Scrapes the "Student Notification" section of <a href="https://nita.ac.in"  target="_blank">NIT Agartala Website </a>every hour</li>
          <li>Mail the new notifications, if any, according to the Preferences you set while registering</li>
        </ul>

        <h3>Why Should I Use This?</h3>
        <ul>
          <li>Helps you in notifying if any notification is published in the NITA website</li>
          <li>Allows you to keep updated about the notices without depending on some xyz group that may or may not notify you regarding the notices</li>
        </ul>

        <h3>How To Use It?</h3>
        <ul>
          <li>Enter the mail id you want to receive the mails at</li>
          <li>Select the areas of your interest</li>
          <li>Click on "Notify Me!"</li>
          <li><h4>Updating Preferences: </h4></li>
          <li>If you ever want to update your Preferences just enter your mail and select your new preferences as if you are registering for the first time</li>
        </ul>

        <br />

        <h5>Disclaimer:<br /><p>Your Emails are used only for communicating notices, NO SPAM PROMISE!!</p></h5>
      </div>
      <div className="right">
          <h2>Mail Man Registration</h2>

          <input type="email" className="mailInput" onChange={(e)=>{updateEmail(e.target.value)}} placeholder="Enter your email"></input><br /><br />
          <h4>Please Select Your Preference[s]</h4><br />
          <input className="optionInput" type="checkbox" id="option1" name="selectedOptions" value="examination" /> <span className="option">Examination</span><br />
          <input className="optionInput" type="checkbox" id="option2" name="selectedOptions" value="ug" /> <span className="option">UnderGraduate Program</span><br />
          <input className="optionInput" type="checkbox" id="option3" name="selectedOptions" value="hostel" /> <span className="option">Hostel</span><br />
          <input className="optionInput" type="checkbox" id="option4" name="selectedOptions" value="scholarship" /> <span className="option">Scholarship</span><br /><br />

          <button onClick={handleClick}>Notify Me!</button>
      </div>
          
    </div>
  );
}

export default App;
