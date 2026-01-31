import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate = new Date(),
  blockedDates = [], // Array of date strings that are unavailable
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const isDateBlocked = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return blockedDates.includes(dateString);
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (selectedDate < minDate || isDateBlocked(selectedDate)) return;

    if (selectingStart) {
      onStartDateChange(selectedDate);
      setSelectingStart(false);
    } else {
      if (selectedDate < startDate) {
        onStartDateChange(selectedDate);
      } else {
        onEndDateChange(selectedDate);
        setShowCalendar(false);
        setSelectingStart(true);
      }
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={`date-range-picker ${className}`}>
      <div className="input-group">
        <div className="date-input-wrapper">
          <label className="date-label">Start Date</label>
          <div 
            className="date-input"
            onClick={() => {
              setShowCalendar(true);
              setSelectingStart(true);
            }}
          >
            <Calendar size={18} />
            <input
              type="text"
              value={formatDate(startDate)}
              placeholder="Select start date"
              readOnly
            />
          </div>
        </div>

        <div className="date-input-wrapper">
          <label className="date-label">End Date</label>
          <div 
            className="date-input"
            onClick={() => {
              setShowCalendar(true);
              setSelectingStart(false);
            }}
          >
            <Calendar size={18} />
            <input
              type="text"
              value={formatDate(endDate)}
              placeholder="Select end date"
              readOnly
            />
          </div>
        </div>
      </div>

      {showCalendar && (
        <div className="calendar-modal">
          <div className="calendar-overlay" onClick={() => setShowCalendar(false)} />
          <div className="calendar-container">
            {/* Header */}
            <div className="calendar-header">
              <button onClick={previousMonth} className="month-nav">
                <ChevronLeft size={20} />
              </button>
              <h3 className="month-title">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button onClick={nextMonth} className="month-nav">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="selection-indicator">
              Selecting: <span className="highlight">{selectingStart ? 'Start Date' : 'End Date'}</span>
            </div>

            {/* Day Names */}
            <div className="day-names">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="day-name">{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Empty cells for days before month starts */}
              {[...Array(startingDayOfWeek)].map((_, i) => (
                <div key={`empty-${i}`} className="calendar-day empty" />
              ))}

              {/* Days of the month */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                date.setHours(0, 0, 0, 0);
                
                const isDisabled = date < minDate || isDateBlocked(date);
                const isSelected = (startDate && date.getTime() === startDate.getTime()) ||
                                 (endDate && date.getTime() === endDate.getTime());
                const isInRange = isDateInRange(date);
                const isToday = date.getTime() === today.getTime();

                return (
                  <div
                    key={day}
                    className={`calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => !isDisabled && handleDateClick(day)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="calendar-footer">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowCalendar(false);
                  setSelectingStart(true);
                }}
              >
                Cancel
              </button>
              <button 
                className="clear-btn"
                onClick={() => {
                  onStartDateChange(null);
                  onEndDateChange(null);
                  setSelectingStart(true);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .date-range-picker {
          width: 100%;
        }

        .input-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .date-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .date-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .date-input {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .date-input:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .date-input svg {
          color: #3b82f6;
          flex-shrink: 0;
        }

        .date-input input {
          border: none;
          background: transparent;
          color: white;
          font-size: 0.95rem;
          width: 100%;
          cursor: pointer;
        }

        .date-input input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .calendar-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .calendar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }

        .calendar-container {
          position: relative;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          max-width: 400px;
          width: 90%;
          animation: slideUp 0.3s ease;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .month-title {
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }

        .month-nav {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .month-nav:hover {
          background: rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
        }

        .selection-indicator {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
        }

        .selection-indicator .highlight {
          color: #3b82f6;
          font-weight: 700;
        }

        .day-names {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .day-name {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.5rem 0;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .calendar-day:not(.empty):not(.disabled):hover {
          background: rgba(59, 130, 246, 0.2);
          color: white;
        }

        .calendar-day.empty {
          cursor: default;
        }

        .calendar-day.disabled {
          color: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
        }

        .calendar-day.today {
          border: 2px solid #3b82f6;
        }

        .calendar-day.selected {
          background: #3b82f6;
          color: white;
          font-weight: 700;
        }

        .calendar-day.in-range:not(.selected) {
          background: rgba(59, 130, 246, 0.2);
        }

        .calendar-footer {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cancel-btn,
        .clear-btn {
          flex: 1;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .clear-btn {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .clear-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: #ef4444;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .input-group {
            grid-template-columns: 1fr;
          }

          .calendar-container {
            width: 95%;
          }
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;
