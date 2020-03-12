import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormLabel,
  Link,
  TextField,
  Popover,
  IconButton
} from "@material-ui/core";
import ReactPhoneInput from 'react-phone-input-mui';
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import InfoIcon from "@material-ui/icons/Info";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import momentTz from "moment-timezone";
import moment from "moment";
import 'react-phone-input-mui/dist/style.css'

import "./App.css";

const api =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://disney-reminders-backend.herokuapp.com";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#0093c4" }
  },
  typography: {
    fontFamily: ["Alata", "Helvetica", "sans-serif"].join(",")
  }
});

const DAYS_TO_DINING = 180;
const DAYS_TO_FASTPASS = 30;
const DAYS_TO_FASTPASS_ON_PROPERTY = 60;

const getDate = ({ date, numOfDays }) => {
  return moment(date)
    .subtract(numOfDays, "d")
    .format();
};

function handleSubmit({
  e,
  email,
  phone,
  setIsLoading,
  diningDate,
  fastPassDate,
  setValidationMessage
}) {
  e.preventDefault();

  setIsLoading(true);

  const user = {
    email,
    diningDate,
    fastPassDate,
    localTime: getTime(diningDate),
    localDiningDate: getFormattedDate(diningDate),
    localFastPassDate: getFormattedDate(fastPassDate),
    phone: phone.replace(/[^0-9]/g, ''),
  };

  axios.post(`${api}/api/submitEmail`, { user }).then(res => {
    setIsLoading(false);
    setValidationMessage(res.data);
  });
}

function handleDateChange({
  value,
  setSelectedDate,
  daysToFastPass,
  setDiningDate,
  setFastPassDate
}) {
  if (String(new Date(value)) === "Invalid Date") {
    return;
  }

  // we get the date (value) from the datepicker
  // we convert the date to UTC time
  const date = momentTz(value)
    .utc()
    .hours(12)
    .minutes(0)
    .seconds(0)
    .format();

  // use the above to set the new datepicker date
  setSelectedDate(date);

  // create the diningDate and fastPassDate that we pass to the server
  // this subtracts X # of days from the datepicker date
  setDiningDate(getDate({ date, numOfDays: DAYS_TO_DINING }));
  setFastPassDate(getDate({ date, numOfDays: daysToFastPass }));
}

function getTime(date) {
  return "7:00am EST";
}

function getFormattedDate(date) {
  return momentTz(date)
    .local()
    .format("L");
}

function getDateInfo({ date, type }) {
  const href =
    type === "dining"
      ? "https://disneyworld.disney.go.com/dining"
      : "https://disneyworld.disney.go.com/fastpass-plus/select-party/";
  if (moment().format() > date) {
    return (
      <>
        You can{" "}
        <Link target="_blank" color="secondary" href={href}>
          make these reservations today!
        </Link>
      </>
    );
  }
  return (
    <strong>
      {getFormattedDate(date)} at {getTime(date)}
    </strong>
  );
}

function isValidEmail(email) {
  return email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
}

// disable the button is there is no email or there is no selected date
function getButtonDisabled({ isLoading, email, selectedDate }) {
return isLoading || !isValidEmail(email) || !selectedDate;
}

function App() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [diningDate, setDiningDate] = useState("");
  const [fastPassDate, setFastPassDate] = useState("");
  const [isDisneyProperty, setIsDisneyProperty] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const daysToFastPass = isDisneyProperty
    ? DAYS_TO_FASTPASS_ON_PROPERTY
    : DAYS_TO_FASTPASS;
  const successTitle = phone ? 'Thank you! We\'ve sent you a confirmation email and text.' : 'Thank you! We\'ve sent you a confirmation email.'

  return (
    <ThemeProvider theme={theme}>
      <Box
        className="App"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <CssBaseline />
        <Box
          className="App-inner"
          display="flex"
          flexDirection="column"
          alignItems="center"
          p={4}
          m={4}
        >
          {validationMessage === "Success!" ? (
            <>
              <h1 className="App-title">
                {successTitle}
              </h1>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                onClick={() => {
                  setValidationMessage("");
                }}
              >
                Add another Email
              </Button>
            </>
          ) : (
            <>
              <h1 className="App-title">
                Get reminders to book your Dining and FastPass Reservations!
              </h1>
              <form
                onSubmit={e =>
                  handleSubmit({
                    e,
                    email,
                    phone,
                    setIsLoading,
                    diningDate,
                    fastPassDate,
                    setValidationMessage,
                    daysToFastPass
                  })
                }
              >
                <Box mt={1} mb={1}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker
                      helperText={
                        validationMessage &&
                        validationMessage.toLowerCase().includes("date") &&
                        validationMessage
                      }
                      error={
                        Boolean(validationMessage) &&
                        validationMessage.toLowerCase().includes("date")
                      }
                      label="Day of Arrival"
                      value={selectedDate || null}
                      fullWidth
                      variant="filled"
                      color="primary"
                      format="MM/dd/yyyy"
                      required
                      onChange={value =>
                        handleDateChange({
                          value,
                          setSelectedDate,
                          daysToFastPass,
                          setDiningDate,
                          setFastPassDate
                        })
                      }
                    />
                  </MuiPickersUtilsProvider>
                </Box>
                <Box mt={2} mb={2}>
                  <TextField
                    helperText={
                      validationMessage &&
                      validationMessage.toLowerCase().includes("email") &&
                      validationMessage
                    }
                    error={
                      Boolean(validationMessage) &&
                      validationMessage.toLowerCase().includes("email")
                    }
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    onChange={e => setEmail(e.target.value)}
                  />
                </Box>
                <Box mt={2} mb={2}>
                  <ReactPhoneInput
                    value={phone}
                    component={TextField}
                    inputExtraProps={{
                      helperText: validationMessage &&
                        validationMessage.toLowerCase().includes("phone") &&
                        validationMessage,
                      error: Boolean(validationMessage) &&
                      validationMessage.toLowerCase().includes("phone"),
                      label: 'Receive a Text (Optional)'
                    }}
                    onChange={value => setPhone(value)}
                  />
                </Box>
                <Box display="flex" alignItems="center" mt={2} mb={2}>
                  <Checkbox
                    id="isDisneyProperty"
                    type="checkbox"
                    checked={isDisneyProperty}
                    onChange={e => setIsDisneyProperty(!isDisneyProperty)}
                  />
                  <FormLabel htmlFor="isDisneyProperty" size="small">
                    I am staying on Disney property
                  </FormLabel>
                  <IconButton
                    onClick={e => {
                      setAnchorEl(e.currentTarget);
                    }}
                    aria-label="See more info on Disney Properties"
                  >
                    <InfoIcon />
                  </IconButton>
                  <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => {
                      setAnchorEl(null);
                    }}
                  >
                    <Box m={2}>
                      See list of official{" "}
                      <Link
                        target="_blank"
                        href="https://disneyworld.disney.go.com/faq/resorts/resort-hotel-list/"
                      >
                        Walt Disney World Resorts
                      </Link>
                    </Box>
                  </Popover>
                </Box>
                <Box display="flex" justifyContent="center" mt={1} mb={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={getButtonDisabled({
                      isLoading,
                      email,
                      selectedDate
                    })}
                  >
                    {isLoading ? "Sending..." : "Remind Me!"}
                    {isLoading && (
                      <span className="App-loadingIcon">
                        <Box ml={1} component="span">
                          <CircularProgress size={14} color="secondary" />
                        </Box>
                      </span>
                    )}
                  </Button>
                </Box>
              </form>
              <Box className="App-resultLine" mt={4} mb={2}>
                ADR Reservations ({DAYS_TO_DINING} Days out):{" "}
                {diningDate &&
                  getDateInfo({ date: diningDate, type: "dining" })}
              </Box>
              <div className="App-resultLine">
                FP+ Reservations ({daysToFastPass} Days out):{" "}
                {fastPassDate &&
                  getDateInfo({ date: fastPassDate, type: "fastPass" })}
              </div>
              <Box component="small" mt={4}>
                Sponsored by: <Link href="https://waitupgame.com">Wait Up!</Link>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
