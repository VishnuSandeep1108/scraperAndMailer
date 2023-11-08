# Student Notifications Scraper and mailer

This project is a web-based application developed to provide users with automated notifications about student updates at NIT Agartala. It offers real-time access to important information for students, with features for registration and customizable notifications.

## Features

- **Web Application**: Built with ReactJS, Node.js, and Express.js, ensuring a responsive and dynamic user interface.
- **Data Scraping**: Utilized Axios and Cheerio to scrape the student notifications section of the NIT Agartala website at hourly intervals.
- **User Registration**: Implemented user registration functionality, enabling users to provide their email ID and select areas of interest, including Examination, Undergraduate Program, Hostel, and Scholarships.
- **Email Notifications**: Configured an email notification system to keep users informed about new updates in their selected areas of interest.
- **Data Management**: Employed MongoDB for data storage and management, ensuring reliable data access and retrieval.
- **Key Technologies**: ReactJS, Node.js, Express.js, MongoDB, Axios, and Cheerio were used as key technologies.

## Usage

> Register for notifications at `https://mailman-useg.onrender.com/` providing mail id

> Select areas of interest, including Examination, Undergraduate Program, Hostel, and Scholarships, to receive notifications

## Installation

### Clone

- Clone this repo with url `https://github.com/VishnuSandeep1108/chattingAppOG.git`

##### Setup

> Install npm dependencies using npm install

```
$ cd server && npm install && cd client && npm install

```

> Set up a MongoDB database either locally or provision a free database with MongoDB Atlas

> In the server directory run the backend with the following command

```
node server.js
```

> In the client directory run the frontend with the following command

```
npm start
```