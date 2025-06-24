import React, { useState } from 'react';
import './App.css';
import { VacationCalendar } from './components/VacationCalendar';

function App() {
  const [vacationDays, setVacationDays] = useState<Set<string>>(new Set());
  const currentYear = new Date().getFullYear();

  const handleDayClick = (day: Date) => {
    const dayString = day.toISOString().split('T')[0];
    setVacationDays(prevDays => {
      const newDays = new Set(prevDays);
      if (newDays.has(dayString)) {
        newDays.delete(dayString);
      } else {
        newDays.add(dayString);
      }
      return newDays;
    });
  };

  return (
    <div className="App">
      <h1>Time Off Request - {currentYear}</h1>
      <VacationCalendar 
        year={currentYear}
        vacationDays={vacationDays}
        onDayClick={handleDayClick}
      />
    </div>
  );
}

export default App;
