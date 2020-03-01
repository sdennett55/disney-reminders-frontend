import React, { useState } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';

const DAYS_TO_DINING = 60;
const DAYS_TO_FASTPASS = 30;

const getDate = ({date, numOfDays}) => {
  var tempDate = new Date(date);
  return new Date(tempDate.setDate(tempDate.getDate() - numOfDays)).toISOString().split('T')[0]; 
}

function handleSubmit({ e, email, date, setValidationMessage, daysToFastPass }) {
  e.preventDefault();

  const diningDate = getDate({date, numOfDays: DAYS_TO_DINING});
  const fastPassDate = getDate({date, numOfDays: daysToFastPass});

  const user = {
    email,
    diningDate,
    fastPassDate,
  };

  axios.post('/api/submitEmail', { user }).then(res => {
    setValidationMessage(res.data);
  });
}

function App() {
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [isDisneyProperty, setIsDisneyProperty] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const daysToFastPass = isDisneyProperty ? DAYS_TO_DINING : DAYS_TO_FASTPASS;
  const color = validationMessage === 'Success!' ? 'green' : 'red';

  return (
    <>
      <form onSubmit={e => handleSubmit({ e, email, date, setValidationMessage, daysToFastPass })}>
        <label htmlFor="email">
          Email
      </label>
        <input id="email" type="email" required onChange={e => setEmail(e.target.value)} />
        <label htmlFor="email">
          Day of Arrival at Walt Disney World
      </label>
        <input id="date" type="date" required onChange={e => setDate(e.target.value)} />
        <label htmlFor="isDisneyProperty">
          I am staying on Disney property
      </label>
        <input id="isDisneyProperty" type="checkbox" checked={isDisneyProperty} onChange={e => setIsDisneyProperty(!isDisneyProperty)} />
        <button>Submit</button>
        {validationMessage && <p style={{color}}>{validationMessage}</p>}
      </form>
      <div style={{marginTop: '2em'}}>
        Dining Reservations (60 Days out)
      </div>
      <div>
        FastPass+ Reservations ({daysToFastPass} Days out)
      </div>
    </>
  );
}

export default App;
