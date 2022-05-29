const res = require("express/lib/response");
const uuid= require('uuid');


const {google} = require("googleapis");

const {OAuth2} = google.auth;

const oAuth2Client = new OAuth2(`${process.env.GOOGLE_CLIENT_ID}`, `${process.env.GOOGLE_CLIENT_SECRET}`);

console.log(process.env.GOOGLE_CLIENT_ID);

oAuth2Client.setCredentials({refresh_token: `${process.env.GOOGLE_CAL_REFRESH_TOKEN}`});

const calendar = google.calendar({version: "v3", auth: oAuth2Client});

const eventStartTime = new Date();
const eventEndTime = new Date();
eventEndTime.setHours(eventStartTime.getHours() + 1);

const makeCalendarEvent = async( date, time, location, subject, email) => {
    console.log(date);
    console.log(time);

    let startDate = new Date(`${date}`);
    let endTime = new Date(`${date}`);

    startDate.setHours(Number(time.split(":")[0]));
    endTime.setHours(startDate.getHours()+1);


    const event = {
        summary: "Tutoring",
        location: location,
        description: `STEM Tutoring with Dario for ${subject}.`,
        start:{
            dateTime: startDate,
            timeZone: "America/Denver"
        },
        end:{
            dateTime: endTime,
            timeZone: "America/Denver"
        },
        attendees: [{email: `${email}` },{self: true}, ],
        conferenceData: { createRequest: {requestId: uuid.v4()}},
        sendUpdates: "all",
        sendNotifications: true
    }
    console.log(event);
    calendar.events.insert({ calendarId: 'primary', resource: event, conferenceDataVersion: 1}, (error, response)=>{
        if(error){
            console.log(error);
            throw new Error("Something went wrong making Calendar invite");
        }
        console.log(response);
        
    })

   // calendar.freebusy.query({resource: timeMin: event}, (error, response)=>{})

}

exports.makeCalendarEvent = makeCalendarEvent;
