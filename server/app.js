const express = require("express");
const socket = require("socket.io");
const cors = require("cors");

const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const pretty = require("pretty");
const fs = require("fs");
const path = require("path");
const nodemailer = require('nodemailer');


const app = express();
  
  app.use(cors());

mongoose.connect("mongodb://0.0.0.0:27017/NITANoticeDB");

const noticeSchema = {
    title : String,
    date: String,
    pdfURL: String,
    tag: String
}

const userSchema={
    email: String,
    selectedOptions: [String]
}

const notice = mongoose.model("notice", noticeSchema);
const User = mongoose.model("user", userSchema);

const server = app.listen(8000, ()=>{console.log("Server : 8000");})

const io = socket(server);

io.on("connection", (socket)=>{
    console.log("Connection Established: "+socket.id);

    socket.on("newUser", async (newUserDetails)=>{
        const {email, selectedOptions} = newUserDetails;

        console.log(email);
        console.log(selectedOptions);

        let user = await User.findOneAndUpdate({ email }, { selectedOptions }, { upsert: true, new: true });

        console.log("User Registered Successfully");
    })
})


const noticeTitlesInDB = [];
// const noticesInDB = [];

const url = "https://www.nita.ac.in/userpanel/StudentNotification.aspx";
const basePDFURL = "https://www.nita.ac.in/userpanel/";

axios.get(url).then((response)=>{
    if(response.status === 200)
    {
        const examNoticeTitles = [];
        const examNoticeDates = [];
        const examNoticePDFURLs = [];
        
        const {data} = response;

        let $ = cheerio.load(data);

        const examNotices = $("#ContentPlaceHolder_Main_RepeaterDepartment_tr_Courses_0");

        const examTable = examNotices.find("td:not([style*='width: 10%;'], [style='width: 5%; text-align: center;'])");

        let rownum=0;

        examTable.each((rowIndex, rowElement)=>{
            if(rownum%2 === 0)
            {
                examNoticeTitles.push($(rowElement).text().trim());
                noticeTitlesInDB.push($(rowElement).text().trim());
            }

            else
            {
                examNoticeDates.push($(rowElement).text().trim());
            }

            rownum++;
        })

        let anchorElements = examNotices.find('a');

        anchorElements.each((anchorIndex, anchorElement)=>{
            const href = $(anchorElement).attr('href');

            if(href!='#' && href!=undefined)
            {
                examNoticePDFURLs.push(basePDFURL+href);
            }
        })

        // console.log(examNoticeTitles);

        let indexOfNotice = 0;

        async function findExistingEXAMNotices()
        {
            while(indexOfNotice<examNoticeTitles.length)
            {
            
                        const newNotice = new notice({
                            title: examNoticeTitles[indexOfNotice],
                            date: examNoticeDates[indexOfNotice],
                            pdfURL: examNoticePDFURLs[indexOfNotice],
                            tag: "Examination"
                        });
            
                        // newNotice.save();
                        // noticesInDB.push(newNotice);
                

                indexOfNotice++;
            }
        }

        // findExistingEXAMNotices();

        console.log("Populated NoticeTitlesInDB with Initial EXAM Data");


        /**********---UG Notices***********/
        
        const UGNoticeTitles = [];
        const UGNoticeDates = [];
        const UGNoticePDFURLs = [];
        
        // const {data:UGdata} = response;

        // $ = cheerio.load(UGdata);

        const UGNotices = $("#ContentPlaceHolder_Main_RepeaterDepartment_tr_Courses_1");

        const UGTable = UGNotices.find("td:not([style*='width: 10%;'], [style='width: 5%; text-align: center;'])");

        rownum=0;

        UGTable.each((rowIndex, rowElement)=>{
            if(rownum%2 === 0)
            {
                UGNoticeTitles.push($(rowElement).text().trim());
                noticeTitlesInDB.push($(rowElement).text().trim());
            }

            else
            {
                UGNoticeDates.push($(rowElement).text().trim());
            }

            rownum++;
        })

        anchorElements = UGNotices.find('a');

        anchorElements.each((anchorIndex, anchorElement)=>{
            const href = $(anchorElement).attr('href');

            // console.log("Href: "+href);

            if(href!='#' && href!=undefined)
            {
                UGNoticePDFURLs.push(basePDFURL+href);
            }
        })

        indexOfNotice = 0;

        async function findExistingUGNotices()
        {
            while(indexOfNotice<UGNoticeTitles.length)
            {
                await notice.findOne({title: UGNoticeTitles[indexOfNotice]}).then((foundNotice)=>{
                    if(!foundNotice)
                    {
                        const newNotice = new notice({
                            title: UGNoticeTitles[indexOfNotice],
                            date: UGNoticeDates[indexOfNotice],
                            pdfURL: UGNoticePDFURLs[indexOfNotice],
                            tag: "UG"
                        });
            
                        // newNotice.save();
                        // noticesInDB.push(newNotice);
                    }
                })

                indexOfNotice++;
            }
        }

        // findExistingUGNotices();

        console.log("Populated NoticeTitlesInDB with Initial UG Data");
        
        /**********---UG Notices End***********/


        /**********---Hostel Notices***********/

        const hostelNoticeTitles = [];
        const hostelNoticeDates = [];
        const hostelNoticePDFURLs = [];
        
        // const {data} = response;

        // let $ = cheerio.load(data);

        const hostelNotices = $("#ContentPlaceHolder_Main_RepeaterDepartment_tr_Courses_4");

        const hostelTable = hostelNotices.find("td:not([style*='width: 10%;'], [style='width: 5%; text-align: center;'])");

        rownum=0;

        hostelTable.each((rowIndex, rowElement)=>{
            if(rownum%2 === 0)
            {
                hostelNoticeTitles.push($(rowElement).text().trim());
                noticeTitlesInDB.push($(rowElement).text().trim());
            }

            else
            {
                hostelNoticeDates.push($(rowElement).text().trim());
            }

            rownum++;
        })

        anchorElements = hostelNotices.find('a');

        anchorElements.each((anchorIndex, anchorElement)=>{
            const href = $(anchorElement).attr('href');

            if(href!='#' && href!=undefined)
            {
                hostelNoticePDFURLs.push(basePDFURL+href);
            }
        })

        // console.log(examNoticeTitles);

        indexOfNotice = 0;

        async function findExistingHOSTELNotices()
        {
            while(indexOfNotice<hostelNoticeTitles.length)
            {
            
                        const newNotice = new notice({
                            title: hostelNoticeTitles[indexOfNotice],
                            date: hostelNoticeDates[indexOfNotice],
                            pdfURL: hostelNoticePDFURLs[indexOfNotice],
                            tag: "Hostel"
                        });
            
                        // newNotice.save();
                        // noticesInDB.push(newNotice);
                

                indexOfNotice++;
            }
        }

        // findExistingHOSTELNotices();

        console.log("Populated NoticeTitlesInDB with Initial HOSTEL Data");

        /**********---Hostel Notices End***********/


        /**********---Scholarship Notices***********/

        const scholarshipNoticeTitles = [];
        const scholarshipNoticeDates = [];
        const scholarshipNoticePDFURLs = [];
        
        // const {data} = response;

        // let $ = cheerio.load(data);

        const scholarshipNotices = $("#ContentPlaceHolder_Main_RepeaterDepartment_tr_Courses_5");

        const scholarshipTable = scholarshipNotices.find("td:not([style*='width: 10%;'], [style='width: 5%; text-align: center;'])");

        rownum=0;

        scholarshipTable.each((rowIndex, rowElement)=>{
            if(rownum%2 === 0)
            {
                scholarshipNoticeTitles.push($(rowElement).text().trim());
                noticeTitlesInDB.push($(rowElement).text().trim());
            }

            else
            {
                scholarshipNoticeDates.push($(rowElement).text().trim());
            }

            rownum++;
        })

        anchorElements = scholarshipNotices.find('a');

        anchorElements.each((anchorIndex, anchorElement)=>{
            const href = $(anchorElement).attr('href');

            if(href!='#' && href!=undefined)
            {
                scholarshipNoticePDFURLs.push(basePDFURL+href);
            }
        })

        // console.log(examNoticeTitles);

        indexOfNotice = 0;

        async function findExistingSCHOLARSHIPNotices()
        {
            while(indexOfNotice<scholarshipNoticeTitles.length)
            {
            
                        const newNotice = new notice({
                            title: scholarshipNoticeTitles[indexOfNotice],
                            date: scholarshipNoticeDates[indexOfNotice],
                            pdfURL: scholarshipNoticePDFURLs[indexOfNotice],
                            tag: "Scholarship"
                        });
            
                        // newNotice.save();
                        // noticesInDB.push(newNotice);
                

                indexOfNotice++;
            }
        }

        // findExistingSCHOLARSHIPNotices();

        console.log("Populated NoticeTitlesInDB with Initial SCHOLARSHIP Data");

        /**********---Scholarship Notices End***********/
    }

    else
    {
        console.log("There's an issue with NITA Website. Here's the response Staus Code: "+response.status);
    }
})
.catch((error)=>{
    console.log(error);
})









/*---------------THE GRAND VALLEY OF SEPERATION--------------------*/













/* Checking Periodically For New Notices */
    
    const interval = 3600000; 

    async function fetchDataAndMail() {
        try {

            const response = await axios.get(url);
            if (response.status === 200) {

                const freshExamNoticeTitles = [];
                const freshExamNoticeDates = [];
                const freshExamNoticePDFURLs = [];

                const uniqueExamNotices = [];
                const uniqueExamIndices = [];

                const { data } = response;
                const $ = cheerio.load(data);

                const freshExamNotices = $("#ContentPlaceHolder_Main_RepeaterDepartment_tr_Courses_0");
                const freshExamTable = freshExamNotices.find("td:not([style*='width: 10%;'], [style='width: 5%; text-align: center;'])");

                let rownum = 0;

                freshExamTable.each((rowIndex, rowElement) => {
                    if (rownum % 2 === 0) {
                        freshExamNoticeTitles.push($(rowElement).text().trim());
                    } else {
                        freshExamNoticeDates.push($(rowElement).text().trim());
                    }
                    rownum++;
                });

                let freshAnchorElements = freshExamNotices.find('a');
                freshAnchorElements.each((anchorIndex, anchorElement) => {
                    const href = $(anchorElement).attr('href');
                    if (href !== '#' && href !== undefined) {
                        freshExamNoticePDFURLs.push(basePDFURL+href);
                    }
                });

                /* Checking for Unique Notices*/

                let indx=0;

                freshExamNoticeTitles.map((title)=>{
                    if(!noticeTitlesInDB.includes(title))
                    {
                        noticeTitlesInDB.push(title);
                        uniqueExamIndices.push(indx);
                    }

                    indx++;
                })

                let uniqueIndicesIterator=0;

                while(uniqueIndicesIterator<uniqueExamIndices.length)
                {
                    let index = uniqueExamIndices[uniqueIndicesIterator];
                    const newNotice = new notice({
                        title: freshExamNoticeTitles[index],
                        date: freshExamNoticeDates[index],
                        pdfURL: freshExamNoticePDFURLs[index]
                    })

                    uniqueExamNotices.push(newNotice);
                    // newNotice.save();   
                    // noticesInDB.push(newNotice);  
                    
                    uniqueIndicesIterator++;
                }


                /*********-----UG Checking-----************/

                const freshUGNoticeTitles = [];
                const freshUGNoticeDates = [];
                const freshUGNoticePDFURLs = [];

                const uniqueUGNotices = [];
                const uniqueUGIndices = [];
                
                const freshUGNotices = $("#ContentPlaceHolder_Main_RepeaterDepartment_tr_Courses_1");
                const freshUGTable = freshUGNotices.find("td:not([style*='width: 10%;'], [style='width: 5%; text-align: center;'])");

                rownum = 0;

                freshUGTable.each((rowIndex, rowElement) => {
                    if (rownum % 2 === 0) {
                        freshUGNoticeTitles.push($(rowElement).text().trim());
                    } else {
                        freshUGNoticeDates.push($(rowElement).text().trim());
                    }
                    rownum++;
                });

                freshAnchorElements = freshUGNotices.find('a');
                freshAnchorElements.each((anchorIndex, anchorElement) => {
                    const href = $(anchorElement).attr('href');
                    if (href !== '#' && href !== undefined) {
                        freshUGNoticePDFURLs.push(basePDFURL+href);
                    }
                });

                /* Checking for Unique Notices*/

                indx=0;

                freshUGNoticeTitles.map((title)=>{
                    if(!noticeTitlesInDB.includes(title))
                    {
                        noticeTitlesInDB.push(title);
                        uniqueUGIndices.push(indx);
                    }

                    indx++;
                })

                uniqueIndicesIterator=0;

                while(uniqueIndicesIterator<uniqueUGIndices.length)
                {
                    let index = uniqueUGIndices[uniqueIndicesIterator];
                    const newNotice = new notice({
                        title: freshUGNoticeTitles[index],
                        date: freshUGNoticeDates[index],
                        pdfURL: freshUGNoticePDFURLs[index]
                    })

                    uniqueUGNotices.push(newNotice);
                    // newNotice.save();   
                    // noticesInDB.push(newNotice);  
                    
                    uniqueIndicesIterator++;
                }

                /*********-----UG Checking Ends-----************/
                
                
                /*********-----Hostel Checking-----************/

                const freshHostelNoticeTitles = [];
                const freshHostelNoticeDates = [];
                const freshHostelNoticePDFURLs = [];

                const uniqueHostelNotices = [];
                const uniqueHostelIndices = [];

                // const { data } = response;
                // const $ = cheerio.load(data);

                const freshHostelNotices = $("#ContentPlaceHolder_Main_RepeaterDepartment_tr_Courses_4");
                const freshHostelTable = freshHostelNotices.find("td:not([style*='width: 10%;'], [style='width: 5%; text-align: center;'])");

                rownum = 0;

                freshHostelTable.each((rowIndex, rowElement) => {
                    if (rownum % 2 === 0) {
                        freshHostelNoticeTitles.push($(rowElement).text().trim());
                    } else {
                        freshHostelNoticeDates.push($(rowElement).text().trim());
                    }
                    rownum++;
                });

                freshAnchorElements = freshHostelNotices.find('a');
                freshAnchorElements.each((anchorIndex, anchorElement) => {
                    const href = $(anchorElement).attr('href');
                    if (href !== '#' && href !== undefined) {
                        freshHostelNoticePDFURLs.push(basePDFURL+href);
                    }
                });

                /* Checking for Unique Notices*/

                indx=0;

                freshHostelNoticeTitles.map((title)=>{
                    if(!noticeTitlesInDB.includes(title))
                    {
                        noticeTitlesInDB.push(title);
                        uniqueHostelIndices.push(indx);
                    }

                    indx++;
                })


                uniqueIndicesIterator=0;

                while(uniqueIndicesIterator<uniqueHostelIndices.length)
                {
                    let index = uniqueHostelIndices[uniqueIndicesIterator];
                    const newNotice = new notice({
                        title: freshHostelNoticeTitles[index],
                        date: freshHostelNoticeDates[index],
                        pdfURL: freshHostelNoticePDFURLs[index]
                    })

                    uniqueHostelNotices.push(newNotice);
                    // newNotice.save();   
                    // noticesInDB.push(newNotice);  
                    
                    uniqueIndicesIterator++;
                }

                /*********-----Hostel Checking Ends-----************/


                /*********-----Scholarship Checking -----************/

                const freshScholarshipNoticeTitles = [];
                const freshScholarshipNoticeDates = [];
                const freshScholarshipNoticePDFURLs = [];

                const uniqueScholarshipNotices = [];
                const uniqueScholarshipIndices = [];

                // const { data } = response;
                // const $ = cheerio.load(data);

                const freshScholarshipNotices = $("#ContentPlaceHolder_Main_RepeaterDepartment_tr_Courses_5");
                const freshScholarshipTable = freshScholarshipNotices.find("td:not([style*='width: 10%;'], [style='width: 5%; text-align: center;'])");

                rownum = 0;

                freshScholarshipTable.each((rowIndex, rowElement) => {
                    if (rownum % 2 === 0) {
                        freshScholarshipNoticeTitles.push($(rowElement).text().trim());
                    } else {
                        freshScholarshipNoticeDates.push($(rowElement).text().trim());
                    }
                    rownum++;
                });

                freshAnchorElements = freshScholarshipNotices.find('a');
                freshAnchorElements.each((anchorIndex, anchorElement) => {
                    const href = $(anchorElement).attr('href');
                    if (href !== '#' && href !== undefined) {
                        freshScholarshipNoticePDFURLs.push(basePDFURL+href);
                    }
                });

                // console.log("Titles");
                // console.log(freshExamNoticeTitles);

                /* Checking for Unique Notices*/

                indx=0;

                freshScholarshipNoticeTitles.map((title)=>{
                    if(!noticeTitlesInDB.includes(title))
                    {
                        noticeTitlesInDB.push(title);
                        uniqueScholarshipIndices.push(indx);
                    }

                    indx++;
                })

                // console.log("Unique Scholarship Indices");
                // console.log(uniqueScholarshipIndices);

                uniqueIndicesIterator=0;

                while(uniqueIndicesIterator<uniqueScholarshipIndices.length)
                {
                    let index = uniqueScholarshipIndices[uniqueIndicesIterator];
                    const newNotice = new notice({
                        title: freshScholarshipNoticeTitles[index],
                        date: freshScholarshipNoticeDates[index],
                        pdfURL: freshScholarshipNoticePDFURLs[index]
                    })

                    uniqueScholarshipNotices.push(newNotice);
                    // newNotice.save();     
                    // noticesInDB.push(newNotice);
                    
                    uniqueIndicesIterator++;
                }

                /*********-----Scholarship Checking Ends-----************/


                // console.log("New Exam Notices");
                // console.log(uniqueExamNotices);
                // console.log("New UG Notices");
                // console.log(uniqueUGNotices);
                // console.log("New Hostel Notices");
                // console.log(uniqueHostelNotices);
                // console.log("New Scholarship Notices");
                // console.log(uniqueScholarshipNotices);




                function mailing()
                {
                    const examRecipients = [];
                    const UGRecipients = [];
                    const hostelRecipients = [];
                    const scholarshipRecipients = [];

                    User.find({}).then((foundUsers)=>{
                        foundUsers.forEach((user)=>{
                            if(user.selectedOptions.includes("examination"))
                            {
                                examRecipients.push(user.email);
                            }

                            if(user.selectedOptions.includes("ug"))
                            {
                                UGRecipients.push(user.email);
                            }

                            if(user.selectedOptions.includes("hostel"))
                            {
                                hostelRecipients.push(user.email);
                            }

                            if(user.selectedOptions.includes("scholarship"))
                            {
                                scholarshipRecipients.push(user.email);
                            }
                        })
                    })

                    const transporter = nodemailer.createTransport({
                        service: 'Gmail', 
                        auth: {
                          user: 'visaan6989@gmail.com',
                          pass: 'ahgh qdvz shix olcz',
                        },
                        tls: {
                            rejectUnauthorized: false, 
                          },
                      });

                      if(uniqueExamNotices.length!=0)
                      {
                        const sendEmailWithAttachments = async () => {
                            const attachments = [];
                        
                            for (const notice of uniqueExamNotices) {
                            try {
                                const {pdfURL:pdfLink} = notice;
                                const response = await axios.get(pdfLink, { responseType: 'stream' });
                                const pdfFileName = path.basename(pdfLink); 
                                const pdfFilePath = path.join(__dirname, pdfFileName); 
                        
                                response.data.pipe(fs.createWriteStream(pdfFilePath));
                        
                                attachments.push({
                                filename: pdfFileName,
                                path: pdfFilePath,
                                });
                            } catch (error) {
                                console.error('Error downloading PDF:', error);
                            }
                            }
                        
                            const mailOptions = {
                            from: 'visaan6989@gmail.com',
                            to: examRecipients,
                            subject: 'New Notice[s] regarding Examination',
                            text: 'Attached are multiple PDF files.',
                            attachments: attachments,
                            };
                        
                            transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error('Error sending email:', error);
                            } else {
                                console.log('Email sent:', info.response);
                        
                                for (const attachment of attachments) {
                                fs.unlinkSync(attachment.path);
                                }
                            }
                            });
                        };

                        sendEmailWithAttachments();
                      }

                      if(uniqueUGNotices.length!=0)
                      {
                        const sendEmailWithAttachments = async () => {
                            const attachments = [];
                        
                            for (const notice of uniqueUGNotices) {
                            try {
                                const {pdfURL:pdfLink} = notice;
                                const response = await axios.get(pdfLink, { responseType: 'stream' });
                                const pdfFileName = path.basename(pdfLink); // Extract the filename from the URL
                                const pdfFilePath = path.join(__dirname, pdfFileName); // Save the PDF in the current directory
                        
                                response.data.pipe(fs.createWriteStream(pdfFilePath));
                        
                                attachments.push({
                                filename: pdfFileName,
                                path: pdfFilePath,
                                });
                            } catch (error) {
                                console.error('Error downloading PDF:', error);
                            }
                            }
                        
                            const mailOptions = {
                            from: 'visaan6989@gmail.com',
                            to: UGRecipients,
                            subject: 'New Notice[s] regarding UnderGraduate Program',
                            text: 'Attached are multiple PDF files.',
                            attachments: attachments,
                            };
                        
                            transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error('Error sending email:', error);
                            } else {
                                console.log('Email sent:', info.response);
                        
                                for (const attachment of attachments) {
                                fs.unlinkSync(attachment.path);
                                }
                            }
                            });
                        };

                        sendEmailWithAttachments();
                      }

                      if(uniqueHostelNotices.length!=0)
                      {
                        const sendEmailWithAttachments = async () => {
                            const attachments = [];
                        
                            for (const notice of uniqueHostelNotices) {
                            try {
                                const {pdfURL:pdfLink} = notice;
                                const response = await axios.get(pdfLink, { responseType: 'stream' });
                                const pdfFileName = path.basename(pdfLink); // Extract the filename from the URL
                                const pdfFilePath = path.join(__dirname, pdfFileName); // Save the PDF in the current directory
                        
                                response.data.pipe(fs.createWriteStream(pdfFilePath));
                        
                                attachments.push({
                                filename: pdfFileName,
                                path: pdfFilePath,
                                });
                            } catch (error) {
                                console.error('Error downloading PDF:', error);
                            }
                            }
                        
                            const mailOptions = {
                            from: 'visaan6989@gmail.com',
                            to: hostelRecipients,
                            subject: 'New Notice[s] regarding Hostel',
                            text: 'Attached are multiple PDF files.',
                            attachments: attachments,
                            };
                        
                            transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error('Error sending email:', error);
                            } else {
                                console.log('Email sent:', info.response);
                        
                                for (const attachment of attachments) {
                                fs.unlinkSync(attachment.path);
                                }
                            }
                            });
                        };

                        sendEmailWithAttachments();
                      }

                      if(uniqueScholarshipNotices.length!=0)
                      {
                        const sendEmailWithAttachments = async () => {
                            const attachments = [];
                        
                            for (const notice of uniqueScholarshipNotices) {
                            try {
                                const {pdfURL:pdfLink} = notice;
                                const response = await axios.get(pdfLink, { responseType: 'stream' });
                                const pdfFileName = path.basename(pdfLink); // Extract the filename from the URL
                                const pdfFilePath = path.join(__dirname, pdfFileName); // Save the PDF in the current directory
                        
                                response.data.pipe(fs.createWriteStream(pdfFilePath));
                        
                                attachments.push({
                                filename: pdfFileName,
                                path: pdfFilePath,
                                });
                            } catch (error) {
                                console.error('Error downloading PDF:', error);
                            }
                            }
                        
                            const mailOptions = {
                            from: 'visaan6989@gmail.com',
                            to: scholarshipRecipients,
                            subject: 'New Notice[s] regarding Scholarship',
                            text: 'Attached are multiple PDF files.',
                            attachments: attachments,
                            };
                        
                            transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error('Error sending email:', error);
                            } else {
                                console.log('Email sent:', info.response);
                        
                                for (const attachment of attachments) {
                                fs.unlinkSync(attachment.path);
                                }
                            }
                            });
                        };

                        sendEmailWithAttachments();
                      }
                }   
                
                mailing();
                
            } else {
                console.log("There's an issue with NITA Website. Here's the response Status Code: " + response.status);
            }
        } catch (error) {
            console.log(error);
        }
    }

    setInterval(fetchDataAndMail, interval);




   