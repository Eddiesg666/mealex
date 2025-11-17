# 10/26 Swarm

## Status
Working:
- Browsing
- Filter by year and major
To be implemented:
- Backend
  - DB to store information
- Frontend
  - Profile page
    - Add experience history
  - Edit profile from profile page
  - Login page
    - Sign in/sign up button
    - Every page has log out button
- Overhaul profile data structure
  - Currently contains initials, which may be unnecessary
  - Use UUIDs
    - Implement using Google auth
- Reviews

## Priorities Today
1. Profile page
  - Connect button
    - Initial functionality: copy email to clipboard
    - Intermediate: write a message in-app, sends email automatically
    - End goal: in-house messaging platform
2. Firebase DB creation

## Conclusion
- Implemented Profile page
- Implemented routing
- Implemented Profile context that can be accessed from different pages
- Implemented Realtime DB and fetching functionality
- Need to do: landing page/login