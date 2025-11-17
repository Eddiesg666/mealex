# Database Schema: MealEx User Profiles

## Table: `users`

| Field               | Type                | Constraints / Notes |
|---------------------|---------------------|----------------------|
| `id`                | UUID / SERIAL       | Primary key |
| `name`              | VARCHAR(100)        | Required |
| `email`             | VARCHAR(255)        | Required, **must end with `@u.northwestern.edu`**, unique |
| `year`              | TEXT                 | Required (e.g., `"2026"`, `"2027"`, `"2028"`) |
| `major`             | TEXT[]              | Required (can be multiple) |
| `minor`             | TEXT[]              | Optional (can be multiple) |
| `hasMealPlan`       | BOOLEAN             | Optional |
| `availability`      | JSONB (array of objects) | Optional, e.g., `[{"day": "Mon", "start": "12:00", "end": "14:00"}]` |
| `careerInterests`   | TEXT[]              | Optional |
| `industryExperience`| TEXT                | Optional free text |
| `externalLinks`     | JSONB               | Optional, format: `{"LinkedIn": "...", "GitHub": "...", "Website": "..."}` |
| `profilePhotoUrl`   | VARCHAR(255)        | Optional, points to uploaded image (<2 MB, JPG/PNG) |
| `createdAt`         | TIMESTAMP           | Default: `NOW()` |
| `updatedAt`         | TIMESTAMP           | Auto-updated |

---

## Table: `filters` (for browsing users)

> Filters can be applied dynamically; this table is not necessarily stored, but represents supported query parameters.

| Filter Name      | Type        | Description |
|------------------|-------------|--------------|
| `year`           | INT[]       | Multi-select filter for graduation year(s) |
| `major`          | TEXT[]      | Filter by major(s) |
| `minor`          | TEXT[]      | Filter by minor(s) |
| `hasMealPlan`    | BOOLEAN     | Filter by meal plan status |
| `careerInterests`| TEXT[]      | Filter by one or more interests |

---

## Example JSON (User Record)

```json
{
  "id": "uuid-123",
  "name": "Alex Smith",
  "email": "alexsmith@u.northwestern.edu",
  "year": 2027,
  "major": ["Computer Science"],
  "minor": ["Data Science"],
  "hasMealPlan": true,
  "availability": [
    {"day": "Mon", "start": "12:00", "end": "14:00"},
    {"day": "Wed", "start": "15:00", "end": "17:00"}
  ],
  "careerInterests": ["AI", "Product Management"],
  "industryExperience": "Interned at a startup building mobile apps.",
  "externalLinks": {
    "LinkedIn": "https://linkedin.com/in/alexsmith",
    "GitHub": "https://github.com/alexsmith"
  },
  "profilePhotoUrl": "https://storage.mealex.com/photos/alexsmith.jpg",
  "createdAt": "2025-10-23T17:00:00Z",
  "updatedAt": "2025-10-23T17:00:00Z"
}
