# **Barber Appointment Management System - Product Requirements Document (PRD)**

**1. Project Overview**

This document defines the requirements for a digital appointment management platform to be developed for barber shops. The main goal of the project is to automate the customer appointment process, providing convenience for customers and increasing operational efficiency for salon owners (barbers) and their staff.

**2. Target Audience**

- **Customer:** End users who prefer to book appointments online.
- **Barber (Salon Owner):** Business owner who wants to manage workflow through a digital calendar, reducing appointment books and phone traffic.
- **Employee:** Staff whose appointment calendar is managed by the salon owner. (Will not have their own user login in the MVP).

**3. Scope and Features (MVP)**

**3.1. Basic System and Appointment Logic**

- **User Management:** Simple registration and login system for customers with email/password or phone number.
- **Working Hours:** **09:30 - 21:30**.
- **Appointment Duration:** Fixed **45 minutes** for all services.
- **Closed Day:** **Sundays** are completely closed for appointments.
- **Appointment Period:** Customers can book appointments for the next **7 days** from the current date.

**3.2. Customer Role Features**

- **Registration/Login:** Secure registration and login to the system.
- **Appointment Booking Flow:**
  1. **Day Selection:** Choose a day from a calendar showing only the next 7 days available for appointments.
  2. **Staff Selection:** Choose the person to book an appointment with (Barber / Employee).
  3. **Time Selection:** Select one of the available 45-minute appointment slots for the chosen staff member on that day.
  4. **Confirmation:** View and confirm the appointment summary (date, time, staff). (No need to re-enter information as they are registered).
- **My Appointments Screen:**
  - List future and past appointments.
  - **Appointment Cancellation:** Button to cancel future appointments **up to 2 hours before the appointment time**. This button becomes inactive when less than 2 hours remain.

**3.3. Barber (Salon Owner) Role Features**

- **Admin Panel:** A dedicated management panel accessible through secure login.
- **Calendar Management:**
  - **Views:** View appointments in **Daily, Weekly, and Monthly** formats (similar to Google Calendar) on a visual calendar.
  - **Filtering:** View only own appointments, only employee appointments, or both in the calendar.
  - **Appointment Details:** View customer name and phone number when clicking on an appointment in the calendar.
- **Manual Appointment Management:**
  - **Create Appointments for Customers:** Ability to manually add appointments for customers not registered in the system or calling by phone. During this process, **entering only the customer's name and phone number is sufficient**, no system account creation is required.
  - **Appointment Cancellation:** Ability to cancel existing appointments (with or without specifying a reason).
- **Time Blocking (Manual Management):**
  - **Block Specific Hours:** Ability to close specific time periods during the day (e.g., "doctor appointment", "lunch break") for appointments for themselves or employees.
  - **Close Entire Days:** Ability to **manually close** one or more days completely for appointments for themselves or employees due to illness, vacation, public holidays, etc.

**3.4. Notifications (Low-Cost Solution for MVP)**

- **Basic Approach:** SMS or paid WhatsApp API integrations that would create costs will be avoided in the MVP phase.
- **In-App Confirmation:** When customers create or cancel appointments, clear confirmation messages are displayed on screen ("Your appointment has been created", "Your appointment has been successfully canceled").
- **Future Potential (WhatsApp):** The barber can be encouraged to use their existing "Business WhatsApp" account to send manual or semi-automatic reminders one day before appointments. Full automation will be considered in the next phase of the project. This helps reduce "no-show" rates at zero technical cost in the MVP.

**4. Out of Scope (To Be Considered After MVP)**

- Automatic SMS/Email/WhatsApp notifications and reminders.
- Online payment integration.
- Different services, durations, and pricing.
- Separate user login for employees and authority to manage their own calendar.
- Detailed reporting (revenue, customer density, etc.).
- Marketing and campaign modules.

This document establishes a solid foundation for implementing the first and leanest version of the project. Active use by a barber after the project goes live will help us gather the most valuable feedback and plan the next steps correctly.
