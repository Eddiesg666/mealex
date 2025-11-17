# Name

- The app is called MealEx.

# Users

- Users are underclassmen who are on the meal plan looking to meet upperclassmen with more experience in their major/club/industry field, and upperclassmen who want to mentor underclasmen and get a free meal.

# Value proposition

MealEx connects underclassmen eager for mentorship with upperclassmen willing to share their experience, all over a meal. By leveraging the university’s meal plan system, MealEx turns dining halls and campus cafés into spaces for networking, mentorship, and community-building.
- For underclassmen: Gain career, academic, and social guidance from experienced students in your major or field — while using your existing meal plan to build meaningful relationships.
- For upperclassmen: Give back to your community, expand your network, and enjoy a free meal while mentoring the next generation of students.
- For universities: Strengthen inter-class relationships, improve retention, and foster a culture of mentorship and inclusion on campus.

# Key features

- A user can set up an account similar to a dating profile. It should include:
  - name (string, required)
  - email (string, required, must end in "@u.northwestern.edu")
  - year (number, e.g. 2026, 2027, 2028)
  - major (string or multiple-select list)
  - minor (optional string or multiple-select list)
  - hasMealPlan (boolean)
- Optional:
  - availability (optional list of time ranges, e.g., Mon 12–2 PM)
  - careerInterests (optional list of strings)
  - industryExperience (optional free text)
  - externalLinks (optional dictionary with keys: LinkedIn, GitHub, Website)
  - Each user can upload a profile photo (optional, JPG/PNG, <2 MB).
- A user should be able to browse through all other accounts, using the following filters:
  - Year (multi-select)
  - Major/Minor
  - Has Meal Plan (yes/no)
  - Career Interests
- Profiles are displayed as cards showing name, year, major, and a short bio.
- Clicking a profile opens the detailed view, with full info and “Message” button.
- Messaging
  - Users can send direct messages through an in-app chat.
  - Messages are stored in a database table with:
    - senderId, receiverId, timestamp, text
  - Users receive push or email notifications when they get a new message.
  - Conversation history is visible to both participants.

# Example scenario

Here is an example session:

- Alice (Freshman, CS major, hasMealPlan=true) signs up with her Northwestern email.
- She sets availability as “Weekdays 12–2 PM,” adds her LinkedIn, and notes “Interested in internships and AI research.”
- Bob (Senior, CS major, hasMealPlan=false) signs up and marks availability as “Tues/Thurs 1–3 PM.”
- Alice opens the app and selects filters:
  - Year: Junior/Senior
  - Major: CS
  - Has Meal Plan: false
- App queries profiles where:
  - user.year ∈ {Junior, Senior} AND
  - user.major == "CS" AND
  - user.hasMealPlan == false
- Bob’s card appears in the results grid.
- Alice clicks Bob’s profile and sees his experience listed (e.g. "Software Engineering Intern at Google").
- Alice clicks the "Message" button.
- Message sent: “Hi Bob! I’m a freshman in CS. Would you be down to grab lunch this week? I can use a meal exchange”
- Bob receives a notification, opens chat, and replies.
- They schedule lunch, choosing Norris 847 Burger, Thursday at 1:00 PM.
- Alice learns insider tips for landing internships, and Bob enjoys good food and conversation. They both leave satisfied: Alice with guidance, Bob with lunch and a new connection.


# Testing notes
- Verify that profiles load efficiently and filtering is accurate.
- Ensure messages are reliably delivered and notifications work.
- Test compatibility across devices and browsers (especially on campus Wi-Fi).