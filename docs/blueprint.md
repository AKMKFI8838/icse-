# **App Name**: ICSEasy

## Core Features:

- Login: User enters Name and Indian Phone Number for login, with locally stored unique ID and data sent to Firebase. IP address is recorded for each login attempt.
- AI MCQ Test Paper Generation: Leveraging the OpenRouter API, dynamically generate multiple-choice question test papers, varying the difficulty level based on the user's needs using a tool.
- Doubt Solver: AI chatbot addresses user questions via the OpenRouter API and allows for generating customized, difficulty-adjustible question sets using a tool.
- Test History Tracking: Saves all completed tests, scores, answers, and analytics (performance, topic-wise, time spent, and accuracy). This will persist to Firebase.
- Admin Panel: Dedicated admin route (`/admin`) secured with login (user: admin, pass: admin123), enabling API key setting, feature management, news posting, and user data review.
- Loader Animation: Implements a pre-load animation with a blurred background on every website visit that indicates that the website is made by Akshit.
- Quick Revision Notes: Summarize large amounts of information quickly, for efficient study.

## Style Guidelines:

- Primary color: Soft, calming blue (#A8D0E6) evoking trust and serenity.
- Background color: Nearly white (#F0F8FF) with slight blue tint, for a translucent, clean feel.
- Accent color: Pale, muted green (#BCE29E) for interactive elements, signaling growth and clarity.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text.
- Consistent use of flat, minimalist icons in a light blue tone.
- Clean, card-based layout with rounded corners and subtle shadows to improve usability.
- Hover and transition animations provide user feedback and engagement. Loader animation shows progress during content loading.